import { v4 as uuidv4 } from 'uuid'
import EventEmitter from 'eventemitter3'
import Jexl from 'jexl'
import { Workflow, WorkflowNode, TaskNode, ParallelNode, SequenceNode, ConditionalNode, LoopNode, DelayNode, RetryNode, WorkflowExecution, NodeExecutionRecord } from './types'
import { Persistence } from './persistence'

export type TaskHandler = (input?: Record<string, unknown>, context?: Record<string, unknown>, signal?: AbortSignal) => Promise<unknown>

export type EngineOptions = {
  maxConcurrent?: number
}

export class WorkflowEngine extends EventEmitter {
  private handlers: Map<string, TaskHandler>
  private persistence: Persistence
  private executions: Map<string, { cancelled: boolean; paused: boolean }>
  private queue: string[]
  private runningCount: number
  private maxConcurrent: number

  constructor(dbPath?: string, opts?: EngineOptions) {
    super()
    this.handlers = new Map()
    this.persistence = new Persistence(dbPath)
    this.executions = new Map()
    this.queue = []
    this.runningCount = 0
    this.maxConcurrent = opts?.maxConcurrent ?? 2

    // Attempt basic crash recovery on startup: mark incomplete executions as failed and emit events
    // This is a conservative recovery strategy that avoids duplicating running work.
    this.recoverOnStartup().catch((e) => {
      // eslint-disable-next-line no-console
      console.error('recovery failed', e)
    })
  }

  private async recoverOnStartup() {
    const incompletes = this.persistence.findIncompleteExecutions()
    for (const ex of incompletes) {
      // if there is a snapshot we could attempt resume; for now, mark as failed with reason 'crash_recovery'
      const snap = this.persistence.getLastSnapshot(ex.id)
      this.persistence.markExecutionFailedWithReason(ex.id, 'crash_recovery')
      this.emit('workflow.failed', { executionId: ex.id, reason: 'crash_recovery', snapshotAvailable: !!snap })
    }
  }

  registerTask(name: string, handler: TaskHandler) {
    if (!name) throw new Error('handler name required')
    this.handlers.set(name, handler)
  }

  async runWorkflow(workflow: Workflow, input?: Record<string, unknown>): Promise<string> {
    // validate before scheduling
    // consumer should call validator; still check basic shape
    if (!workflow || !workflow.id) throw new Error('invalid workflow')

    const executionId = uuidv4()
    const now = new Date().toISOString()
    const exec: WorkflowExecution = { id: executionId, workflowId: workflow.id, status: 'running', createdAt: now }
    this.persistence.createExecution(exec)
    this.executions.set(executionId, { cancelled: false, paused: false })

    // enqueue or start immediately
    if (this.runningCount >= this.maxConcurrent) {
      this.queue.push(executionId)
      // persist queued state
      this.persistence.updateExecution(executionId, 'queued')
      this.emit('workflow.created', { executionId, workflowId: workflow.id })
    } else {
      this.startExecution(executionId, workflow, input)
    }

    return executionId
  }

  private async startExecution(executionId: string, workflow: Workflow, input?: Record<string, unknown>) {
    // try to acquire lock to prevent same execution in multiple workers
    this.runningCount += 1
    this.emit('workflow.started', { executionId, workflowId: workflow.id })
    // run async
    this.executeWorkflow(executionId, workflow, input).finally(() => {
      this.runningCount = Math.max(0, this.runningCount - 1)
      // if there are queued executions, start next
      const next = this.queue.shift()
      if (next) {
        // in this simple model, we don't load workflow from DB; caller should provide mapping; for now we store minimal info
        // emit event that next will start and caller should provide workflow object in real runtime
        this.emit('workflow.dequeue', { executionId: next })
      }
    })
  }

  async pauseWorkflow(executionId: string) {
    const s = this.executions.get(executionId)
    if (!s) throw new Error('execution not found')
    s.paused = true
    this.persistence.updateExecution(executionId, 'paused')
    this.emit('workflow.paused', { executionId })
  }

  async resumeWorkflow(executionId: string) {
    const s = this.executions.get(executionId)
    if (!s) throw new Error('execution not found')
    s.paused = false
    this.persistence.updateExecution(executionId, 'running')
    this.emit('workflow.resumed', { executionId })
  }

  async cancelWorkflow(executionId: string) {
    const s = this.executions.get(executionId)
    if (!s) throw new Error('execution not found')
    s.cancelled = true
    this.persistence.updateExecution(executionId, 'cancelled')
    this.emit('workflow.cancelled', { executionId })
  }

  private async checkPauseCancel(executionId: string) {
    const s = this.executions.get(executionId)
    if (!s) return
    while (s.paused && !s.cancelled) {
      await new Promise((r) => setTimeout(r, 200))
    }
    if (s.cancelled) {
      throw new Error('execution cancelled')
    }
  }

  private async executeWorkflow(executionId: string, workflow: Workflow, input?: Record<string, unknown>) {
    try {
      const context: Record<string, unknown> = { input, variables: {}, workflowId: workflow.id }
      this.emit('workflow.started', { executionId, workflowId: workflow.id })
      for (const node of workflow.nodes) {
        await this.checkPauseCancel(executionId)
        // snapshot before node
        this.persistence.saveExecutionSnapshot(executionId, { currentNode: node.id, context })
        await this.executeNode(executionId, node, context)
        // snapshot after node
        this.persistence.saveExecutionSnapshot(executionId, { lastNode: node.id, context })
      }
      this.persistence.updateExecution(executionId, 'completed')
      this.emit('workflow.completed', { executionId })
    } catch (err) {
      this.persistence.updateExecution(executionId, 'failed')
      this.emit('workflow.failed', { executionId, error: String(err) })
    } finally {
      // release lock if any
      try {
        this.persistence.releaseExecutionLock(executionId)
      } catch (e) {
        // ignore
      }
    }
  }

  private async recordNode(executionId: string, rec: NodeExecutionRecord & { durationMs?: number; retryCount?: number }) {
    // attach metrics if present
    const enriched = { ...rec, durationMs: rec['durationMs'], retryCount: rec['retryCount'] }
    this.persistence.insertNodeRecord(enriched as NodeExecutionRecord & any)
    this.emit('node.' + rec.status, { executionId, nodeId: rec.nodeId, status: rec.status })
  }

  private async executeNode(executionId: string, node: WorkflowNode, context: Record<string, unknown>): Promise<unknown> {
    const started = Date.now()
    await this.recordNode(executionId, { executionId, nodeId: node.id, nodeType: node.type, status: 'running', startedAt: new Date().toISOString() })

    try {
      let result: unknown
      switch (node.type) {
        case 'task': {
          const t = node as TaskNode
          const handler = this.handlers.get(t.task)
          if (!handler) throw new Error(`no handler registered for task ${t.task}`)
          // create abort signal for cancellation
          const controller = new AbortController()
          const signal = controller.signal
          // pass a small wrapper of context including signal
          result = await handler(t.input ?? {}, context, signal)
          break
        }
        case 'delay': {
          const d = node as DelayNode
          await this.sleepWithCancel(d.ms, executionId)
          result = null
          break
        }
        case 'sequence': {
          const s = node as SequenceNode
          for (const n of s.nodes) {
            await this.checkPauseCancel(executionId)
            await this.executeNode(executionId, n, context)
          }
          result = null
          break
        }
        case 'parallel': {
          const p = node as ParallelNode
          const promises = p.nodes.map((n) => this.executeNode(executionId, n, context))
          result = await Promise.all(promises)
          break
        }
        case 'conditional': {
          const c = node as ConditionalNode
          const val = await Jexl.eval(c.condition, context)
          if (val) {
            result = await this.executeNode(executionId, c.then, context)
          } else if (c.otherwise) {
            result = await this.executeNode(executionId, c.otherwise, context)
          } else {
            result = null
          }
          break
        }
        case 'loop': {
          const l = node as LoopNode
          let iter = 0
          const max = l.maxIterations ?? 1000
          while (await Jexl.eval(l.condition, context)) {
            iter += 1
            if (iter > max) throw new Error('max iterations exceeded')
            await this.checkPauseCancel(executionId)
            await this.executeNode(executionId, l.body, context)
          }
          result = null
          break
        }
        case 'retry': {
          const r = node as RetryNode
          let lastErr: any = null
          let attempts = 0
          for (let attempt = 1; attempt <= r.attempts; attempt++) {
            try {
              attempts = attempt
              result = await this.executeNode(executionId, r.node, context)
              lastErr = null
              break
            } catch (e) {
              lastErr = e
              if (attempt < r.attempts) {
                const ms = r.delayMs ?? 200
                await this.sleepWithCancel(ms, executionId)
              }
            }
          }
          if (lastErr) throw lastErr
          break
        }
        default:
          throw new Error(`unsupported node type ${(node as any).type}`)
      }

      const finished = Date.now()
      const duration = finished - started
      await this.recordNode(executionId, { executionId, nodeId: node.id, nodeType: node.type, status: 'completed', startedAt: new Date(started).toISOString(), finishedAt: new Date(finished).toISOString(), result: result as any, durationMs: duration })
      return result
    } catch (err: any) {
      const finished = Date.now()
      const duration = finished - started
      await this.recordNode(executionId, { executionId, nodeId: node.id, nodeType: node.type, status: 'failed', startedAt: new Date(started).toISOString(), finishedAt: new Date(finished).toISOString(), error: String(err), durationMs: duration })
      throw err
    }
  }

  private async sleepWithCancel(ms: number, executionId: string) {
    const step = 100
    let elapsed = 0
    while (elapsed < ms) {
      await this.checkPauseCancel(executionId)
      await new Promise((r) => setTimeout(r, Math.min(step, ms - elapsed)))
      elapsed += step
    }
  }
}

export default WorkflowEngine
