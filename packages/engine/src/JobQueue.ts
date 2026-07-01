import type { JobType, JobPayload } from './types';
import { Job } from './Job';
import type { DatabaseManager } from '@22am-enterprise/database';

interface QueueState {
  jobs: Job[];
  paused: boolean;
}

export class JobQueue {
  private jobs: Job[] = [];
  private paused = false;
  private db: DatabaseManager | null = null;

  constructor(db?: DatabaseManager) {
    this.db = db || null;
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  enqueue(
    type: JobType,
    payload: JobPayload,
    priority: number = 0
  ): Job {
    const job = new Job(this.generateJobId(), type, payload, priority);
    this.jobs.push(job);
    this.jobs.sort((a, b) => b.priority - a.priority);
    return job;
  }

  dequeue(): Job | null {
    if (this.paused || this.jobs.length === 0) {
      return null;
    }
    const job = this.jobs.shift();
    return job || null;
  }

  peek(): Job | null {
    if (this.jobs.length === 0) {
      return null;
    }
    return this.jobs[0];
  }

  remove(jobId: string): boolean {
    const index = this.jobs.findIndex((job) => job.id === jobId);
    if (index > -1) {
      this.jobs.splice(index, 1);
      return true;
    }
    return false;
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  cancel(): void {
    for (const job of this.jobs) {
      job.cancel();
    }
    this.jobs = [];
  }

  clear(): void {
    this.jobs = [];
  }

  size(): number {
    return this.jobs.length;
  }

  getAll(): Job[] {
    return [...this.jobs];
  }

  getJobById(jobId: string): Job | null {
    return this.jobs.find((job) => job.id === jobId) || null;
  }

  isPaused(): boolean {
    return this.paused;
  }

  toJSON(): QueueState {
    return {
      jobs: this.jobs.map((job) => job.toJSON() as Job),
      paused: this.paused,
    };
  }
}
