import { EventEmitter } from 'events';
import type { ExecutionContext, TaskResult, TaskState } from '../types/index';
import { Logger } from '../logger/Logger';

export class TaskExecutor extends EventEmitter {
  private logger: Logger;
  private activeTaskId: string | null = null;
  private taskTimeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(config: {
    logger: Logger;
    taskTimeout: number;
    retryAttempts: number;
    retryDelay: number;
  }) {
    super();
    this.logger = config.logger;
    this.taskTimeout = config.taskTimeout;
    this.retryAttempts = config.retryAttempts;
    this.retryDelay = config.retryDelay;
  }

  /**
   * Execute a task with error handling and retries
   */
  async execute(
    taskId: string,
    taskFn: (context: ExecutionContext) => Promise<any>,
    context: ExecutionContext
  ): Promise<TaskResult> {
    const startTime = Date.now();
    this.activeTaskId = taskId;

    this.logger.info(`Starting task execution`, taskId);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        if (attempt > 0) {
          this.logger.info(
            `Retry attempt ${attempt}/${this.retryAttempts}`,
            taskId
          );
          await this.delay(this.retryDelay);
        }

        const result = await this.executeWithTimeout(taskFn, context, taskId);
        const endTime = Date.now();

        this.logger.info(`Task completed successfully`, taskId, {
          duration: endTime - startTime,
        });

        this.activeTaskId = null;

        return {
          taskId,
          state: 'completed',
          output: result,
          duration: endTime - startTime,
          startTime,
          endTime,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === this.retryAttempts) {
          break;
        }
      }
    }

    const endTime = Date.now();
    this.logger.error(
      `Task failed after ${this.retryAttempts + 1} attempts`,
      taskId,
      { error: lastError?.message }
    );

    this.activeTaskId = null;

    return {
      taskId,
      state: 'failed',
      error: lastError?.message || 'Unknown error',
      duration: endTime - startTime,
      startTime,
      endTime,
    };
  }

  /**
   * Execute a task with timeout
   */
  private executeWithTimeout(
    taskFn: (context: ExecutionContext) => Promise<any>,
    context: ExecutionContext,
    taskId: string
  ): Promise<any> {
    return Promise.race([
      taskFn(context),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Task timeout after ${this.taskTimeout}ms`)),
          this.taskTimeout
        )
      ),
    ]);
  }

  /**
   * Cancel the active task
   */
  cancel(): void {
    if (this.activeTaskId) {
      this.logger.warn(`Cancelling task`, this.activeTaskId);
      this.activeTaskId = null;
    }
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get active task ID
   */
  getActiveTaskId(): string | null {
    return this.activeTaskId;
  }
}
