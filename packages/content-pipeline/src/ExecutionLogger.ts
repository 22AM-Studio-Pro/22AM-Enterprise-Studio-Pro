import { PipelineExecution, StageExecution } from './PipelineTypes'

export type ExecutionLog = {
  id: string
  executionId: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  stageId?: string
  message: string
  metadata?: Record<string, any>
}

export class ExecutionLogger {
  private logs: ExecutionLog[] = []
  private maxLogs = 10000

  log(
    executionId: string,
    level: ExecutionLog['level'],
    message: string,
    stageId?: string,
    metadata?: Record<string, any>
  ) {
    const log: ExecutionLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      executionId,
      timestamp: new Date().toISOString(),
      level,
      stageId,
      message,
      metadata
    }
    this.logs.push(log)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  getExecutionLogs(executionId: string, level?: ExecutionLog['level']): ExecutionLog[] {
    return this.logs.filter((l) => l.executionId === executionId && (!level || l.level === level))
  }

  getStageLogs(executionId: string, stageId: string): ExecutionLog[] {
    return this.logs.filter((l) => l.executionId === executionId && l.stageId === stageId)
  }

  clearLogs(executionId: string) {
    this.logs = this.logs.filter((l) => l.executionId !== executionId)
  }
}
