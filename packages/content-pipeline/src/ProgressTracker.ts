import { PipelineExecution, StageExecution } from './PipelineTypes'
import { MetricsCollector, PipelineMetrics } from './PipelineMetrics'

export type ProviderStatus = {
  name: string
  available: boolean
  lastChecked: string
  latency?: number
  errorMessage?: string
}

export type ExecutionProgress = {
  executionId: string
  pipelineId: string
  totalStages: number
  completedStages: number
  failedStages: number
  skippedStages: number
  progress: number // 0-100
  currentStage?: string
  estimatedTimeRemaining?: number
  providersUsed: ProviderStatus[]
  tokenUsage: Map<string, number>
  estimatedCost: number
}

export class ProgressTracker {
  private metricsCollector: MetricsCollector
  private progressCache: Map<string, ExecutionProgress> = new Map()

  constructor(metricsCollector: MetricsCollector) {
    this.metricsCollector = metricsCollector
  }

  trackProgress(execution: PipelineExecution, totalStages: number): ExecutionProgress {
    const completedStages = Array.from(execution.stageExecutions.values()).filter(
      (s) => s.state === 'completed'
    ).length
    const failedStages = Array.from(execution.stageExecutions.values()).filter(
      (s) => s.state === 'failed'
    ).length
    const skippedStages = Array.from(execution.stageExecutions.values()).filter(
      (s) => s.state === 'skipped'
    ).length

    const progress = Math.round((completedStages / totalStages) * 100)

    const metrics = this.metricsCollector.getMetrics(execution.id)
    const providerStatuses: ProviderStatus[] = (metrics?.providersUsed ?? []).map((p) => ({
      name: p,
      available: true,
      lastChecked: new Date().toISOString()
    }))

    const trackingData: ExecutionProgress = {
      executionId: execution.id,
      pipelineId: execution.pipelineId,
      totalStages,
      completedStages,
      failedStages,
      skippedStages,
      progress,
      currentStage: this.getCurrentStage(execution),
      providersUsed: providerStatuses,
      tokenUsage: metrics?.tokenUsage ?? new Map(),
      estimatedCost: metrics?.estimatedCost ?? 0
    }

    this.progressCache.set(execution.id, trackingData)
    return trackingData
  }

  getProgress(executionId: string): ExecutionProgress | undefined {
    return this.progressCache.get(executionId)
  }

  private getCurrentStage(execution: PipelineExecution): string | undefined {
    for (const [stageId, stageExec] of execution.stageExecutions) {
      if (stageExec.state === 'running') return stageId
    }
    return undefined
  }
}
