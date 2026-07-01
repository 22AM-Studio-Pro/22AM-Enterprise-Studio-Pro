import type { LogLevel, JobPayload, JobType } from './types';

export interface WorkerConfig {
  id: number;
  maxConcurrency?: number;
  retryCount?: number;
}

export type JobHandler = (job: JobPayload) => Promise<unknown>;

export class Worker {
  private id: number;
  private maxConcurrency: number;
  private retryCount: number;
  private currentLoad: number = 0;
  private handlers: Map<JobType, JobHandler> = new Map();
  private isActive: boolean = false;

  constructor(config: WorkerConfig) {
    this.id = config.id;
    this.maxConcurrency = config.maxConcurrency || 4;
    this.retryCount = config.retryCount || 3;
  }

  getId(): number {
    return this.id;
  }

  registerHandler(jobType: JobType, handler: JobHandler): void {
    this.handlers.set(jobType, handler);
  }

  getHandler(jobType: JobType): JobHandler | undefined {
    return this.handlers.get(jobType);
  }

  async execute(
    jobType: JobType,
    payload: JobPayload
  ): Promise<unknown> {
    if (this.currentLoad >= this.maxConcurrency) {
      throw new Error(`Worker ${this.id} is at max capacity`);
    }

    const handler = this.handlers.get(jobType);
    if (!handler) {
      throw new Error(`No handler registered for job type: ${jobType}`);
    }

    this.currentLoad++;

    try {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= this.retryCount; attempt++) {
        try {
          const result = await handler(payload);
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          if (attempt < this.retryCount) {
            // Exponential backoff
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, attempt) * 1000)
            );
          }
        }
      }

      throw lastError || new Error('Job execution failed');
    } finally {
      this.currentLoad--;
    }
  }

  isAvailable(): boolean {
    return this.currentLoad < this.maxConcurrency;
  }

  getCurrentLoad(): number {
    return this.currentLoad;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  isWorkerActive(): boolean {
    return this.isActive;
  }
}
