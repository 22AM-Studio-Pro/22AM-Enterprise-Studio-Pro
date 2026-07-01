export type PipelineMetrics = {
  executionId: string
  pipelineId: string
  totalDuration: number
  stageDurations: Map<string, number>
  retries: number
  failures: number
  providersUsed: string[]
  tokenUsage: Map<string, number>
  estimatedCost: number
  assetCount: number
  startedAt: string
  completedAt?: string
}

export class MetricsCollector {
  private metrics: Map<string, PipelineMetrics> = new Map()

  createMetrics(executionId: string, pipelineId: string): PipelineMetrics {
    const m: PipelineMetrics = {
      executionId,
      pipelineId,
      totalDuration: 0,
      stageDurations: new Map(),
      retries: 0,
      failures: 0,
      providersUsed: [],
      tokenUsage: new Map(),
      estimatedCost: 0,
      assetCount: 0,
      startedAt: new Date().toISOString()
    }
    this.metrics.set(executionId, m)
    return m
  }

  recordStageDuration(executionId: string, stageId: string, duration: number) {
    const m = this.metrics.get(executionId)
    if (m) m.stageDurations.set(stageId, duration)
  }

  recordRetry(executionId: string) {
    const m = this.metrics.get(executionId)
    if (m) m.retries += 1
  }

  recordFailure(executionId: string) {
    const m = this.metrics.get(executionId)
    if (m) m.failures += 1
  }

  recordProvider(executionId: string, providerName: string) {
    const m = this.metrics.get(executionId)
    if (m && !m.providersUsed.includes(providerName)) m.providersUsed.push(providerName)
  }

  recordTokenUsage(executionId: string, providerName: string, tokens: number) {
    const m = this.metrics.get(executionId)
    if (m) {
      const current = m.tokenUsage.get(providerName) ?? 0
      m.tokenUsage.set(providerName, current + tokens)
    }
  }

  completeMetrics(executionId: string) {
    const m = this.metrics.get(executionId)
    if (m) {
      m.completedAt = new Date().toISOString()
      const start = new Date(m.startedAt).getTime()
      const end = new Date(m.completedAt).getTime()
      m.totalDuration = end - start
    }
  }

  getMetrics(executionId: string): PipelineMetrics | undefined {
    return this.metrics.get(executionId)
  }
}
