import { EventEmitter } from 'events';
import type { ExecutionContext } from '../types/index';
import { Logger } from '../logger/Logger';
import { JobExecutor, type JobTask } from './JobExecutor';
import type { DatabaseManager } from '@22am-enterprise/database';

export interface WorkflowTask {
  id: string;
  name: string;
  action: string;
  params?: Record<string, any>;
  dependencies?: string[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  tasks: WorkflowTask[];
  variables?: Record<string, any>;
}

export class WorkflowExecutor extends EventEmitter {
  private logger: Logger;
  private db: DatabaseManager;
  private jobExecutor: JobExecutor;
  private config: {
    taskTimeout: number;
    retryAttempts: number;
    retryDelay: number;
  };

  constructor(config: {
    logger: Logger;
    db: DatabaseManager;
    taskTimeout: number;
    retryAttempts: number;
    retryDelay: number;
  }) {
    super();
    this.logger = config.logger;
    this.db = config.db;
    this.config = config;
    this.jobExecutor = new JobExecutor(config);
  }

  /**
   * Execute a workflow
   */
  async execute(
    workflow: WorkflowDefinition,
    jobId: string
  ): Promise<Map<string, any>> {
    this.logger.info(`Starting workflow execution`, jobId, {
      workflowId: workflow.id,
      taskCount: workflow.tasks.length,
    });

    try {
      // Create execution context
      const context: ExecutionContext = {
        jobId,
        workflowId: workflow.id,
        startTime: Date.now(),
        variables: { ...workflow.variables },
        previousResults: new Map(),
      };

      // Register tasks
      const jobTasks: JobTask[] = workflow.tasks.map((task) => ({
        id: task.id,
        name: task.name,
        handler: async (ctx: ExecutionContext) =>
          this.executeWorkflowTask(task, ctx),
        dependencies: task.dependencies,
      }));

      this.jobExecutor.registerTasks(jobTasks);

      // Execute job
      const results = await this.jobExecutor.execute(context);

      // Convert results to output format
      const output = new Map<string, any>();
      for (const [taskId, result] of results) {
        output.set(taskId, result.output);
      }

      // Update workflow status
      await this.db.workflows.update(workflow.id, {
        lastRunAt: Date.now(),
        lastStatus: 'completed',
      });

      this.logger.info(`Workflow execution completed`, jobId);
      return output;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Workflow execution failed`, jobId, { error: errorMsg });

      await this.db.workflows.update(workflow.id, {
        lastStatus: 'failed',
        lastRunAt: Date.now(),
      });

      throw error;
    }
  }

  /**
   * Execute a single workflow task
   */
  private async executeWorkflowTask(
    task: WorkflowTask,
    context: ExecutionContext
  ): Promise<any> {
    this.logger.info(`Executing task: ${task.name}`, task.id, {
      action: task.action,
    });

    // Here you would dispatch to plugins or built-in actions
    // For now, return a placeholder that can be extended
    const result = {
      taskId: task.id,
      taskName: task.name,
      action: task.action,
      params: task.params,
      executedAt: Date.now(),
    };

    return result;
  }

  /**
   * Pause workflow execution
   */
  pause(): void {
    this.jobExecutor.pause();
  }

  /**
   * Resume workflow execution
   */
  resume(): void {
    this.jobExecutor.resume();
  }

  /**
   * Stop workflow execution
   */
  stop(): void {
    this.jobExecutor.stop();
  }

  /**
   * Get execution logs
   */
  getLogs(taskId?: string) {
    return this.logger.getLogs(taskId);
  }
}
