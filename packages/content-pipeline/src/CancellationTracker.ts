import { PipelineExecution } from './PipelineTypes'

export type CancellationEvent = {
  id: string
  executionId: string
  cancelledAt: string
  initiatedBy?: string
  reason?: string
  stagesAffected: string[]
}

export class CancellationTracker {
  private cancellations: Map<string, CancellationEvent> = new Map()

  trackCancellation(
    executionId: string,
    stagesAffected: string[],
    initiatedBy?: string,
    reason?: string
  ): CancellationEvent {
    const event: CancellationEvent = {
      id: `cancel-${Date.now()}`,
      executionId,
      cancelledAt: new Date().toISOString(),
      initiatedBy,
      reason,
      stagesAffected
    }
    this.cancellations.set(executionId, event)
    return event
  }

  getCancellation(executionId: string): CancellationEvent | undefined {
    return this.cancellations.get(executionId)
  }

  wasCancelled(executionId: string): boolean {
    return this.cancellations.has(executionId)
  }
}
