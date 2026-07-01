import { EventEmitter } from 'events';
import type { ExecutionContext, TaskResult } from '../types/index';
import { Logger } from '../logger/Logger';
import { TaskExecutor } from './TaskExecutor';

export interface JobTask {
  id: string;
  name: string;
  handler: (context: ExecutionContext) => Promise<any>;
  dependencies?: string[];
  skip?: (context: ExecutionContext) => boolean;
}

export class JobExecutor extends EventEmitter {
  private logger: Logger;
  private taskExecutor: TaskExecutor;
  private tasks: Map<string, JobTask> = new Map();
  private results: Map<string, TaskResult> = new Map();
  private isRunning = false;
  private isPaused = false;

  constructor(config: {
    logger: Logger;
    taskTimeout: number;
    retryAttempts: number;
    retryDelay: number;
  }) {
    super();
    this.logger = config.logger;
    this.taskExecutor = new TaskExecutor({
      logger: this.logger,
      taskTimeout: config.taskTimeout,
      retryAttempts: config.retryAttempts,
      retryDelay: config.retryDelay,
    });
  }

  /**
   * Register a task
   */
  registerTask(task: JobTask): void {
    this.tasks.set(task.id, task);
    this.logger.debug(`Task registered: ${task.name}`, task.id);
  }

  /**
   * Register multiple tasks
   */
  registerTasks(tasks: JobTask[]): void {
    tasks.forEach((task) => this.registerTask(task));
  }

  /**
   * Execute the job
   */
  async execute(context: ExecutionContext): Promise<Map<string, TaskResult>> {
    if (this.isRunning) {
      throw new Error('Job is already running');
    }

    this.isRunning = true;
    this.results.clear();
    this.logger.info(`Starting job execution`, context.jobId);

    try {
      const executionOrder = this.topologicalSort();

      for (const taskId of executionOrder) {
        if (!this.isRunning) {
          break;
        }

        // Wait if paused
        while (this.isPaused) {
          await this.delay(100);
        }

        const task = this.tasks.get(taskId);
        if (!task) {
          continue;
        }

        // Check if task should be skipped
        if (task.skip && task.skip(context)) {
          this.logger.info(`Skipping task`, taskId);
          this.results.set(taskId, {
            taskId,
            state: 'skipped',
            duration: 0,
            startTime: Date.now(),
            endTime: Date.now(),
          });
          continue;
        }

        // Check dependencies
        if (task.dependencies && !this.areDependenciesMet(task.dependencies)) {
          this.logger.error(
            `Task dependencies not met`,
            taskId,
            { dependencies: task.dependencies }
          );
          this.results.set(taskId, {
            taskId,
            state: 'failed',
            error: 'Dependencies not met',
            duration: 0,
            startTime: Date.now(),
            endTime: Date.now(),
          });
          continue;
        }

        // Update context with previous results
        context.previousResults.set(
          taskId,
          Array.from(this.results.entries()).reduce(
            (acc, [key, result]) => {
              acc[key] = result.output;
              return acc;
            },
            {} as Record<string, any>
          )
        );

        const result = await this.taskExecutor.execute(
          taskId,
          task.handler,
          context
        );
        this.results.set(taskId, result);
        this.emit('task-complete', result);
      }

      this.logger.info(`Job execution completed`, context.jobId);
      return this.results;
    } catch (error) {
      this.logger.error(
        `Job execution failed: ${error instanceof Error ? error.message : String(error)}`,
        context.jobId
      );
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Pause execution
   */
  pause(): void {
    this.isPaused = true;
    this.logger.info('Job execution paused');
  }

  /**
   * Resume execution
   */
  resume(): void {
    this.isPaused = false;
    this.logger.info('Job execution resumed');
  }

  /**
   * Stop execution
   */
  stop(): void {
    this.isRunning = false;
    this.taskExecutor.cancel();
    this.logger.info('Job execution stopped');
  }

  /**
   * Get results
   */
  getResults(): Map<string, TaskResult> {
    return new Map(this.results);
  }

  /**
   * Topological sort for task dependencies
   */
  private topologicalSort(): string[] {
    const visited = new Set<string>();
    const stack: string[] = [];

    const visit = (taskId: string): void => {
      if (visited.has(taskId)) {
        return;
      }

      visited.add(taskId);
      const task = this.tasks.get(taskId);

      if (task?.dependencies) {
        for (const dep of task.dependencies) {
          visit(dep);
        }
      }

      stack.push(taskId);
    };

    for (const taskId of this.tasks.keys()) {
      visit(taskId);
    }

    return stack;
  }

  /**
   * Check if dependencies are met
   */
  private areDependenciesMet(dependencies: string[]): boolean {
    return dependencies.every((dep) => {
      const result = this.results.get(dep);
      return result && result.state === 'completed';
    });
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if running
   */
  isJobRunning(): boolean {
    return this.isRunning;
  }
}
