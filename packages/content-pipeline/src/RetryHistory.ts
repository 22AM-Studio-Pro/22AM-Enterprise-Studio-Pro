import { PipelineExecution } from './PipelineTypes'

export type RetryEvent = {
  id: string
  executionId: string
  stageId: string
  attempt: number
  timestamp: string
  reason?: string
  nextRetryAt?: string
}

export class RetryHistory {
  private retries: RetryEvent[] = []
  private maxHistory = 5000

  recordRetry(
    executionId: string,
    stageId: string,
    attempt: number,
    reason?: string,
    backoffMs?: number
  ): RetryEvent {
    const event: RetryEvent = {
      id: `retry-${Date.now()}-${Math.random()}`,
      executionId,
      stageId,
      attempt,
      timestamp: new Date().toISOString(),
      reason,
      nextRetryAt: backoffMs ? new Date(Date.now() + backoffMs).toISOString() : undefined
    }
    this.retries.push(event)
    if (this.retries.length > this.maxHistory) {
      this.retries.shift()
    }
    return event
  }

  getRetryHistory(executionId: string): RetryEvent[] {
    return this.retries.filter((r) => r.executionId === executionId)
  }

  getStageRetries(executionId: string, stageId: string): RetryEvent[] {
    return this.retries.filter((r) => r.executionId === executionId && r.stageId === stageId)
  }

  clearRetries(executionId: string) {
    this.retries = this.retries.filter((r) => r.executionId !== executionId)
  }
}
