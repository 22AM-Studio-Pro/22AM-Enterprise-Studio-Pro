import { EventEmitter } from 'events';
import type { EngineConfig, ExecutionState } from '../types/index';
import { Logger } from '../logger/Logger';
import { WorkflowExecutor, type WorkflowDefinition } from '../executor/WorkflowExecutor';
import type { DatabaseManager } from '@22am-enterprise/database';
import type { Job } from '@22am-enterprise/shared';

export class Engine extends EventEmitter {
  private logger: Logger;
  private db: DatabaseManager;
  private config: EngineConfig;
  private state: ExecutionState = 'idle';
  private activeJobs: Map<string, Promise<any>> = new Map();
  private workflowExecutor: WorkflowExecutor;

  constructor(
    db: DatabaseManager,
    config: Partial<EngineConfig> = {}
  ) {
    super();
    this.db = db;
    this.config = {
      maxConcurrentJobs: config.maxConcurrentJobs || 5,
      taskTimeout: config.taskTimeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      logLevel: config.logLevel || 'info',
    };
    this.logger = new Logger(this.config.logLevel);
    this.workflowExecutor = new WorkflowExecutor({
      logger: this.logger,
      db: this.db,
      taskTimeout: this.config.taskTimeout,
      retryAttempts: this.config.retryAttempts,
      retryDelay: this.config.retryDelay,
    });
  }

  /**
   * Start the engine
   */
  async start(): Promise<void> {
    this.logger.info('Engine starting');
    this.state = 'running';
    this.emit('engine-started');
  }

  /**
   * Stop the engine
   */
  async stop(): Promise<void> {
    this.logger.info('Engine stopping');
    this.state = 'stopped';

    // Cancel all active jobs
    for (const [jobId] of this.activeJobs) {
      await this.cancelJob(jobId);
    }

    this.emit('engine-stopped');
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflow: WorkflowDefinition
  ): Promise<{ jobId: string; result: Map<string, any> }> {
    if (this.state !== 'running') {
      throw new Error('Engine is not running');
    }

    if (this.activeJobs.size >= this.config.maxConcurrentJobs) {
      throw new Error(
        `Maximum concurrent jobs (${this.config.maxConcurrentJobs}) reached`
      );
    }

    // Create job in database
    const jobData = this.db.jobs.create({
      workflowId: workflow.id,
      name: `${workflow.name} - ${new Date().toISOString()}`,
      status: 'running',
    });

    this.logger.info(`Job created`, jobData.id, {
      workflowId: workflow.id,
    });

    const executionPromise = this.workflowExecutor
      .execute(workflow, jobData.id)
      .then((result) => {
        // Update job status to completed
        this.db.jobs.update(jobData.id, {
          status: 'completed',
          completedAt: Date.now(),
        });
        this.emit('job-completed', { jobId: jobData.id });
        return result;
      })
      .catch((error) => {
        // Update job status to failed
        this.db.jobs.update(jobData.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
          completedAt: Date.now(),
        });
        this.emit('job-failed', {
          jobId: jobData.id,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      })
      .finally(() => {
        this.activeJobs.delete(jobData.id);
      });

    this.activeJobs.set(jobData.id, executionPromise);

    const result = await executionPromise;
    return { jobId: jobData.id, result };
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    this.logger.info(`Cancelling job`, jobId);
    this.workflowExecutor.stop();
    this.activeJobs.delete(jobId);

    await this.db.jobs.update(jobId, {
      status: 'cancelled',
      completedAt: Date.now(),
    });
  }

  /**
   * Pause a job
   */
  pauseJob(): void {
    this.workflowExecutor.pause();
  }

  /**
   * Resume a job
   */
  resumeJob(): void {
    this.workflowExecutor.resume();
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): Job | null {
    return this.db.jobs.getById(jobId);
  }

  /**
   * Get active jobs
   */
  getActiveJobs(): string[] {
    return Array.from(this.activeJobs.keys());
  }

  /**
   * Get engine state
   */
  getState(): ExecutionState {
    return this.state;
  }

  /**
   * Get logs
   */
  getLogs(taskId?: string) {
    return this.workflowExecutor.getLogs(taskId);
  }

  /**
   * Get logger
   */
  getLogger(): Logger {
    return this.logger;
  }
}
