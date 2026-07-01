import { v4 as uuidv4 } from 'uuid'
import EventEmitter from 'eventemitter3'
import Jexl from 'jexl'
import { Workflow, WorkflowNode, TaskNode, ParallelNode, SequenceNode, ConditionalNode, LoopNode, DelayNode, RetryNode, WorkflowExecution, NodeExecutionRecord } from './types'
import { Persistence } from './persistence'

export type TaskHandler = (input?: Record<string, unknown>, context?: Record<string, unknown>) => Promise<unknown>

export class WorkflowEngine extends EventEmitter {
  private handlers: Map<string, TaskHandler>
  private persistence: Persistence
  private executions: Map<string, { cancelled: boolean; paused: boolean }>

  constructor(dbPath?: string) {
    super()
    this.handlers = new Map()
    this.persistence = new Persistence(dbPath)
    this.executions = new Map()
  }

  registerTask(name: string, handler: TaskHandler) {
    if (!name) throw new Error('handler name required')
    this.handlers.set(name, handler)
  }

  async runWorkflow(workflow: Workflow, input?: Record<string, unknown>): Promise<string> {
    // validate workflow schema elsewhere; assume caller validated
    const executionId = uuidv4()
    const now = new Date().toISOString()
    const exec: WorkflowExecution = { id: executionId, workflowId: workflow.id, status: 'running', createdAt: now }
    this.persistence.createExecution(exec)
    this.executions.set(executionId, { cancelled: false, paused: false })

    // run asynchronously
    this.executeWorkflow(executionId, workflow, input).catch((err) => {
      // already recorded
      // emit failure
      this.emit('execution:failed', { executionId, error: String(err) })
    })

    return executionId
  }

  async pauseWorkflow(executionId: string) {
    const s = this.executions.get(executionId)
    if (!s) throw new Error('execution not found')
    s.paused = true
    this.persistence.updateExecution(executionId, 'paused')
    this.emit('execution:paused', { executionId })
  }

  async resumeWorkflow(executionId: string) {
    const s = this.executions.get(executionId)
    if (!s) throw new Error('execution not found')
    s.paused = false
    this.persistence.updateExecution(executionId, 'running')
    this.emit('execution:resumed', { executionId })
  }

  async cancelWorkflow(executionId: string) {
    const s = this.executions.get(executionId)
    if (!s) throw new Error('execution not found')
    s.cancelled = true
    this.persistence.updateExecution(executionId, 'cancelled')
    this.emit('execution:cancelled', { executionId })
  }

  private async checkPauseCancel(executionId: string) {
    const s = this.executions.get(executionId)
    if (!s) return
    while (s.paused && !s.cancelled) {
      // wait until resumed
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 200))
    }
    if (s.cancelled) {
      throw new Error('execution cancelled')
    }
  }

  private async executeWorkflow(executionId: string, workflow: Workflow, input?: Record<string, unknown>) {
    try {
      const context: Record<string, unknown> = { input, variables: {}, workflowId: workflow.id }
      this.emit('execution:started', { executionId, workflowId: workflow.id })
      for (const node of workflow.nodes) {
        await this.checkPauseCancel(executionId)
        await this.executeNode(executionId, node, context)
      }
      this.persistence.updateExecution(executionId, 'completed')
      this.emit('execution:completed', { executionId })
    } catch (err) {
      this.persistence.updateExecution(executionId, 'failed')
      this.emit('execution:failed', { executionId, error: String(err) })
    }
  }

  private async recordNode(executionId: string, rec: NodeExecutionRecord) {
    this.persistence.insertNodeRecord(rec)
    this.emit('node:updated', { executionId, nodeId: rec.nodeId, status: rec.status })
  }

  private async executeNode(executionId: string, node: WorkflowNode, context: Record<string, unknown>): Promise<unknown> {
    const started = new Date().toISOString()
    await this.recordNode(executionId, { executionId, nodeId: node.id, nodeType: node.type, status: 'running', startedAt: started })

    try {
      let result: unknown
      switch (node.type) {
        case 'task': {
          const t = node as TaskNode
          const handler = this.handlers.get(t.task)
          if (!handler) throw new Error(`no handler registered for task ${t.task}`)
          // merge input and context variables
          const input = (t.input ?? {}) as Record<string, unknown>
          result = await handler(input, context)
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
            // execute body
            await this.executeNode(executionId, l.body, context)
          }
          result = null
          break
        }
        case 'retry': {
          const r = node as RetryNode
          let lastErr: any = null
          for (let attempt = 1; attempt <= r.attempts; attempt++) {
            try {
              // attempt inner node
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

      const finished = new Date().toISOString()
      await this.recordNode(executionId, { executionId, nodeId: node.id, nodeType: node.type, status: 'completed', startedAt: started, finishedAt: finished, result })
      return result
    } catch (err) {
      const finished = new Date().toISOString()
      await this.recordNode(executionId, { executionId, nodeId: node.id, nodeType: node.type, status: 'failed', startedAt: started, finishedAt: finished, error: String(err) })
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
