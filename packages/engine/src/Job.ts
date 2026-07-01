import type { JobStatus, JobType, JobPayload } from './types';

export class Job {
  public readonly id: string;
  public readonly type: JobType;
  public status: JobStatus;
  public priority: number;
  public payload: JobPayload;
  public progress: number;
  public readonly createdAt: number;
  public startedAt: number | null;
  public completedAt: number | null;
  public error: string | null;
  public retryCount: number;

  constructor(
    id: string,
    type: JobType,
    payload: JobPayload,
    priority: number = 0
  ) {
    this.id = id;
    this.type = type;
    this.status = 'pending';
    this.priority = priority;
    this.payload = payload;
    this.progress = 0;
    this.createdAt = Date.now();
    this.startedAt = null;
    this.completedAt = null;
    this.error = null;
    this.retryCount = 0;
  }

  start(): void {
    this.status = 'running';
    this.startedAt = Date.now();
  }

  complete(result?: unknown): void {
    this.status = 'completed';
    this.completedAt = Date.now();
    this.progress = 100;
  }

  fail(error: string): void {
    this.status = 'failed';
    this.completedAt = Date.now();
    this.error = error;
  }

  pause(): void {
    if (this.status === 'running') {
      this.status = 'paused';
    }
  }

  resume(): void {
    if (this.status === 'paused') {
      this.status = 'running';
    }
  }

  cancel(): void {
    this.status = 'cancelled';
    this.completedAt = Date.now();
  }

  updateProgress(percentage: number): void {
    this.progress = Math.min(100, Math.max(0, percentage));
  }

  getDuration(): number {
    if (!this.startedAt) {
      return 0;
    }
    const endTime = this.completedAt || Date.now();
    return endTime - this.startedAt;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      type: this.type,
      status: this.status,
      priority: this.priority,
      payload: this.payload,
      progress: this.progress,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      error: this.error,
      retryCount: this.retryCount,
      duration: this.getDuration(),
    };
  }
}
