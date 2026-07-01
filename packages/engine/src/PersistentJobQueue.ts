import type { JobType, JobPayload, PersistentJobData } from './types';
import { Job } from './Job';
import type { DatabaseManager } from '@22am-enterprise/database';

export class PersistentJobQueue {
  private jobs: Map<string, Job> = new Map();
  private paused = false;
  private db: DatabaseManager;

  constructor(db: DatabaseManager) {
    this.db = db;
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async persistJob(job: Job): Promise<void> {
    const jobData = this.db.jobs.create({
      workflowId: 'engine-queue',
      name: job.id,
      status: job.status,
      progress: job.progress,
      metadata: job.payload,
    });
  }

  private async updateJobStatus(job: Job): Promise<void> {
    await this.db.jobs.update(job.id, {
      status: job.status,
      progress: job.progress,
      error: job.error,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    });
  }

  async loadPersistentJobs(): Promise<void> {
    try {
      const jobs = this.db.jobs.findByStatus('pending');
      for (const jobData of jobs) {
        const job = new Job(
          jobData.id,
          (jobData.metadata as any)?.type || 'manual',
          jobData.metadata || {},
          0
        );
        job.status = jobData.status as any;
        job.progress = jobData.progress;
        job.error = jobData.error;
        job.retryCount = 0;
        this.jobs.set(job.id, job);
      }
    } catch (error) {
      console.error('Failed to load persistent jobs:', error);
    }
  }

  async enqueue(
    type: JobType,
    payload: JobPayload,
    priority: number = 0
  ): Promise<Job> {
    const job = new Job(this.generateJobId(), type, payload, priority);
    this.jobs.set(job.id, job);
    this.sortByPriority();
    await this.persistJob(job);
    return job;
  }

  async dequeue(): Promise<Job | null> {
    if (this.paused || this.jobs.size === 0) {
      return null;
    }
    const firstJob = Array.from(this.jobs.values())[0];
    if (!firstJob) {
      return null;
    }
    this.jobs.delete(firstJob.id);
    await this.updateJobStatus(firstJob);
    return firstJob;
  }

  peek(): Job | null {
    if (this.jobs.size === 0) {
      return null;
    }
    return Array.from(this.jobs.values())[0] || null;
  }

  async remove(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.cancel();
      this.jobs.delete(jobId);
      await this.updateJobStatus(job);
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

  async cancel(): Promise<void> {
    for (const job of this.jobs.values()) {
      job.cancel();
      await this.updateJobStatus(job);
    }
    this.jobs.clear();
  }

  clear(): void {
    this.jobs.clear();
  }

  size(): number {
    return this.jobs.size;
  }

  getAll(): Job[] {
    return Array.from(this.jobs.values());
  }

  getJobById(jobId: string): Job | null {
    return this.jobs.get(jobId) || null;
  }

  isPaused(): boolean {
    return this.paused;
  }

  private sortByPriority(): void {
    const sorted = Array.from(this.jobs.values()).sort((a, b) => b.priority - a.priority);
    this.jobs.clear();
    for (const job of sorted) {
      this.jobs.set(job.id, job);
    }
  }
}
