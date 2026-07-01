import { ExecutionMonitor } from './ExecutionMonitor'
import { ProgressTracker } from './ProgressTracker'
import { ExecutionLogger } from './ExecutionLogger'
import { RetryHistory } from './RetryHistory'
import { CancellationTracker } from './CancellationTracker'
import { MetricsCollector } from './PipelineMetrics'
import { PipelineExecution } from './PipelineTypes'

export class PipelineDashboard {
  private executionMonitor: ExecutionMonitor
  private progressTracker: ProgressTracker
  private executionLogger: ExecutionLogger
  private retryHistory: RetryHistory
  private cancellationTracker: CancellationTracker

  constructor(metricsCollector: MetricsCollector) {
    this.executionMonitor = new ExecutionMonitor()
    this.progressTracker = new ProgressTracker(metricsCollector)
    this.executionLogger = new ExecutionLogger()
    this.retryHistory = new RetryHistory()
    this.cancellationTracker = new CancellationTracker()
  }

  getFullExecutionStatus(execution: PipelineExecution, totalStages: number) {
    return {
      progress: this.progressTracker.trackProgress(execution, totalStages),
      logs: this.executionLogger.getExecutionLogs(execution.id),
      retries: this.retryHistory.getRetryHistory(execution.id),
      cancellation: this.cancellationTracker.getCancellation(execution.id),
      timeline: this.executionMonitor.getExecutionTimeline(execution.id)
    }
  }

  getExecutionMonitor(): ExecutionMonitor {
    return this.executionMonitor
  }

  getProgressTracker(): ProgressTracker {
    return this.progressTracker
  }

  getExecutionLogger(): ExecutionLogger {
    return this.executionLogger
  }

  getRetryHistory(): RetryHistory {
    return this.retryHistory
  }

  getCancellationTracker(): CancellationTracker {
    return this.cancellationTracker
  }
}
