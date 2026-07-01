import { PipelineExecution } from './PipelineTypes'

export type ExecutionUpdate = {
  executionId: string
  type: 'stage_start' | 'stage_complete' | 'stage_fail' | 'stage_retry' | 'metrics_update'
  stageId?: string
  timestamp: string
  data?: any
}

export class ExecutionMonitor {
  private updates: ExecutionUpdate[] = []
  private listeners: Map<string, (update: ExecutionUpdate) => void> = new Map()
  private maxHistory = 1000

  recordUpdate(update: ExecutionUpdate) {
    this.updates.push(update)
    if (this.updates.length > this.maxHistory) {
      this.updates.shift()
    }
  }

  getExecutionTimeline(executionId: string): ExecutionUpdate[] {
    return this.updates.filter((u) => u.executionId === executionId)
  }

  subscribe(executionId: string, callback: (update: ExecutionUpdate) => void): () => void {
    const id = `${executionId}-${Math.random()}`
    this.listeners.set(id, callback)
    return () => this.listeners.delete(id)
  }

  broadcastUpdate(update: ExecutionUpdate) {
    for (const callback of this.listeners.values()) {
      try {
        callback(update)
      } catch (e) {
        // ignore listener errors
      }
    }
  }

  clearExecutionUpdates(executionId: string) {
    this.updates = this.updates.filter((u) => u.executionId !== executionId)
  }
}
