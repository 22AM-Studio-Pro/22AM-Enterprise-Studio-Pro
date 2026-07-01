import type { EngineConfig, LogLevel, JobType, JobPayload } from './types';
import { EventBus } from './EventBus';
import { Logger } from './Logger';
import { JobQueue } from './JobQueue';
import { Worker, type JobHandler } from './Worker';
import { Scheduler } from './Scheduler';
import type { DatabaseManager } from '@22am-enterprise/database';

export class Engine {
  private config: EngineConfig;
  private eventBus: EventBus;
  private logger: Logger;
  private queue: JobQueue;
  private workers: Worker[] = [];
  private scheduler: Scheduler;
  private db: DatabaseManager | null = null;
  private running: boolean = false;
  private processingInterval: NodeJS.Timer | null = null;

  constructor(config: EngineConfig, db?: DatabaseManager) {
    this.config = config;
    this.eventBus = new EventBus();
    this.logger = new Logger(config.logLevel);
    this.queue = new JobQueue(db);
    this.scheduler = new Scheduler({
      logger: this.logger,
      queue: this.queue,
    });
    this.db = db || null;

    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.config.workerCount; i++) {
      const worker = new Worker({
        id: i,
        maxConcurrency: 1,
        retryCount: this.config.retryCount,
      });
      worker.activate();
      this.workers.push(worker);
    }
    this.logger.info(`Engine initialized with ${this.config.workerCount} workers`);
  }

  registerJobHandler(jobType: JobType, handler: JobHandler): void {
    for (const worker of this.workers) {
      worker.registerHandler(jobType, handler);
    }
    this.logger.info(`Job handler registered for type: ${jobType}`);
  }

  enqueueJob(
    type: JobType,
    payload: JobPayload,
    priority: number = 0
  ): string {
    const job = this.queue.enqueue(type, payload, priority);
    this.eventBus.emit('job.created', { jobId: job.id, type });
    this.logger.info(`Job enqueued: ${job.id}`, { type, priority });
    return job.id;
  }

  async start(): Promise<void> {
    if (this.running) {
      this.logger.warn('Engine is already running');
      return;
    }

    this.running = true;
    this.scheduler.startAll();
    this.logger.info('Engine started');

    // Start job processing loop
    this.processingInterval = setInterval(() => {
      this.processJobs();
    }, 1000);
  }

  async shutdown(): Promise<void> {
    if (!this.running) {
      this.logger.warn('Engine is not running');
      return;
    }

    this.running = false;
    this.scheduler.stopAll();

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    // Wait for any running jobs to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.logger.info('Engine shutdown complete');
  }

  private async processJobs(): Promise<void> {
    while (this.running && !this.queue.isPaused()) {
      const availableWorker = this.workers.find((w) => w.isAvailable());
      if (!availableWorker) {
        break;
      }

      const job = this.queue.dequeue();
      if (!job) {
        break;
      }

      job.start();
      this.eventBus.emit('job.started', { jobId: job.id, timestamp: Date.now() });

      (async () => {
        try {
          const result = await availableWorker.execute(job.type, job.payload);
          job.complete(result);
          this.eventBus.emit('job.completed', {
            jobId: job.id,
            result,
            duration: job.getDuration(),
          });
          this.logger.info(`Job completed: ${job.id}`);
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          job.retryCount++;

          if (job.retryCount < this.config.retryCount) {
            this.queue.enqueue(job.type, job.payload, job.priority);
            this.logger.info(
              `Job will be retried: ${job.id}`,
              { attempt: job.retryCount }
            );
          } else {
            job.fail(errorMsg);
            this.eventBus.emit('job.failed', {
              jobId: job.id,
              error: errorMsg,
              duration: job.getDuration(),
            });
            this.logger.error(
              `Job failed: ${job.id}`,
              error,
              { attempts: job.retryCount }
            );
          }
        }
      })();
    }
  }

  pauseQueue(): void {
    this.queue.pause();
    this.logger.info('Job queue paused');
  }

  resumeQueue(): void {
    this.queue.resume();
    this.logger.info('Job queue resumed');
  }

  cancelJob(jobId: string): boolean {
    const success = this.queue.remove(jobId);
    if (success) {
      this.logger.info(`Job cancelled: ${jobId}`);
    }
    return success;
  }

  getJobQueueSize(): number {
    return this.queue.size();
  }

  getQueueJobs() {
    return this.queue.getAll();
  }

  status(): {
    running: boolean;
    queueSize: number;
    workerCount: number;
    workers: Array<{ id: number; load: number; active: boolean }>
  } {
    return {
      running: this.running,
      queueSize: this.queue.size(),
      workerCount: this.workers.length,
      workers: this.workers.map((w) => ({
        id: w.getId(),
        load: w.getCurrentLoad(),
        active: w.isWorkerActive(),
      })),
    };
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getLogger(): Logger {
    return this.logger;
  }

  getScheduler(): Scheduler {
    return this.scheduler;
  }

  isRunning(): boolean {
    return this.running;
  }
}
