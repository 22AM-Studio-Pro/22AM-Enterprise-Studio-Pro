import { PipelineExecution, PipelineExecutionState, StageExecution, StageExecutionState, PipelineDefinition } from './PipelineTypes'
import { pipelineEvents } from './PipelineEvents'
import { MetricsCollector } from './PipelineMetrics'
import { PipelineContextManager, PipelineContext } from './PipelineContext'
import { PipelinePersistence } from './PipelinePersistence'
import { v4 as uuidv4 } from 'crypto'

export class PipelineEngine {
  private persistence: PipelinePersistence
  private metricsCollector: MetricsCollector
  private contextManager: PipelineContextManager
  private executingPipelines: Map<string, boolean> = new Map()

  constructor(dbPath?: string) {
    this.persistence = new PipelinePersistence(dbPath)
    this.metricsCollector = new MetricsCollector()
    this.contextManager = new PipelineContextManager()
  }

  async executeSync(pipeline: PipelineDefinition): Promise<PipelineExecution> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const execution: PipelineExecution = {
      id: executionId,
      pipelineId: pipeline.id,
      state: 'pending',
      stageExecutions: new Map(),
      variables: { ...pipeline.variables },
      createdAt: new Date().toISOString()
    }

    this.persistence.savePipelineDefinition(pipeline)
    this.persistence.saveExecution(execution)
    this.metricsCollector.createMetrics(executionId, pipeline.id)

    this.executingPipelines.set(executionId, true)
    pipelineEvents.emit('pipeline.started', { executionId })

    const ctx = this.contextManager.createContext(execution)
    execution.state = 'running'
    execution.startedAt = new Date().toISOString()

    try {
      // Execute stages sequentially (simplified)
      for (const stageDef of pipeline.stages) {
        if (!this.executingPipelines.get(executionId)) {
          execution.state = 'cancelled'
          break
        }

        if (!stageDef.enabled) {
          const stageExec: StageExecution = {
            stageId: stageDef.id,
            state: 'skipped',
            retries: 0
          }
          this.contextManager.recordStageExecution(ctx, stageExec)
          continue
        }

        pipelineEvents.emit('stage.started', { executionId, stageId: stageDef.id })

        const stageStart = Date.now()
        const stageExec = await this.executeStage(stageDef, ctx, executionId)
        const stageDuration = Date.now() - stageStart

        this.metricsCollector.recordStageDuration(executionId, stageDef.id, stageDuration)
        this.contextManager.recordStageExecution(ctx, stageExec)

        if (stageExec.state === 'failed' && stageDef.errorHandling !== 'continue') {
          execution.state = 'failed'
          execution.error = stageExec.error
          pipelineEvents.emit('stage.failed', { executionId, stageId: stageDef.id, error: stageExec.error || 'unknown' })
          break
        }

        pipelineEvents.emit('stage.completed', { executionId, stageId: stageDef.id })
      }

      if (execution.state === 'running') {
        execution.state = 'completed'
      }
    } catch (e: any) {
      execution.state = 'failed'
      execution.error = e.message
      pipelineEvents.emit('pipeline.failed', { executionId, error: e.message })
    } finally {
      execution.completedAt = new Date().toISOString()
      const start = new Date(execution.startedAt!).getTime()
      const end = new Date(execution.completedAt).getTime()
      execution.duration = end - start

      this.metricsCollector.completeMetrics(executionId)
      this.persistence.saveExecution(execution)
      this.executingPipelines.delete(executionId)

      if (execution.state === 'completed') {
        pipelineEvents.emit('pipeline.completed', { executionId })
      }
    }

    return execution
  }

  private async executeStage(stageDef: any, ctx: PipelineContext, executionId: string): Promise<StageExecution> {
    const maxAttempts = stageDef.retryPolicy?.maxAttempts ?? 1
    let attempt = 0
    let lastError: any

    while (attempt < maxAttempts) {
      try {
        const stageExec: StageExecution = {
          stageId: stageDef.id,
          state: 'running',
          startedAt: new Date().toISOString(),
          retries: attempt,
          output: { type: stageDef.type, message: 'stage executed' }
        }

        // Simulate stage execution (in real implementation, call actual stage handlers)
        await new Promise((r) => setTimeout(r, 10))

        stageExec.state = 'completed'
        stageExec.completedAt = new Date().toISOString()
        return stageExec
      } catch (e: any) {
        lastError = e
        attempt += 1
        if (attempt < maxAttempts) {
          this.metricsCollector.recordRetry(executionId)
          pipelineEvents.emit('stage.retried', { executionId, stageId: stageDef.id, attempt })
          await new Promise((r) => setTimeout(r, stageDef.retryPolicy?.backoffMs ?? 200))
        }
      }
    }

    return {
      stageId: stageDef.id,
      state: 'failed',
      error: lastError.message,
      retries: attempt
    }
  }

  async cancelExecution(executionId: string) {
    this.executingPipelines.delete(executionId)
    const execution = this.persistence.getExecution(executionId)
    if (execution) {
      execution.state = 'cancelled'
      this.persistence.saveExecution(execution)
      pipelineEvents.emit('pipeline.cancelled', { executionId })
    }
  }
}
