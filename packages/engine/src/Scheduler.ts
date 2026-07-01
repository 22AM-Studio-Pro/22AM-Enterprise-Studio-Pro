import type { ScheduledJob, JobType, JobPayload, LogLevel } from './types';
import { JobQueue } from './JobQueue';
import { Logger } from './Logger';
import cron from 'cron';

interface SchedulerConfig {
  logger: Logger;
  queue: JobQueue;
}

export class Scheduler {
  private jobs: Map<string, { job: ScheduledJob; task: cron.CronJob }> =
    new Map();
  private logger: Logger;
  private queue: JobQueue;
  private running = false;

  constructor(config: SchedulerConfig) {
    this.logger = config.logger;
    this.queue = config.queue;
  }

  private generateScheduleId(): string {
    return `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  add(
    cronExpression: string,
    jobType: JobType,
    payload: JobPayload,
    enabled: boolean = true
  ): string {
    try {
      const scheduleId = this.generateScheduleId();

      const scheduledJob: ScheduledJob = {
        id: scheduleId,
        cronExpression,
        jobType,
        payload,
        enabled,
        nextRun: undefined,
      };

      const task = new cron.CronJob(
        cronExpression,
        () => {
          if (scheduledJob.enabled && this.running) {
            this.logger.info(`Executing scheduled job: ${scheduleId}`);
            this.queue.enqueue(jobType, payload);
            scheduledJob.nextRun = new Date(Date.now()).getTime() + 60000; // Approximate next run
          }
        },
        null,
        false, // Don't start automatically
        'UTC'
      );

      this.jobs.set(scheduleId, { job: scheduledJob, task });

      if (enabled && this.running) {
        task.start();
      }

      this.logger.info(`Scheduled job added: ${scheduleId}`, {
        cronExpression,
        jobType,
      });

      return scheduleId;
    } catch (error) {
      this.logger.error(
        'Failed to add scheduled job',
        error,
        { cronExpression, jobType }
      );
      throw error;
    }
  }

  remove(scheduleId: string): boolean {
    const entry = this.jobs.get(scheduleId);
    if (entry) {
      entry.task.stop();
      this.jobs.delete(scheduleId);
      this.logger.info(`Scheduled job removed: ${scheduleId}`);
      return true;
    }
    return false;
  }

  start(scheduleId: string): boolean {
    const entry = this.jobs.get(scheduleId);
    if (entry && !entry.task.running) {
      entry.task.start();
      entry.job.enabled = true;
      this.logger.info(`Scheduled job started: ${scheduleId}`);
      return true;
    }
    return false;
  }

  stop(scheduleId: string): boolean {
    const entry = this.jobs.get(scheduleId);
    if (entry && entry.task.running) {
      entry.task.stop();
      entry.job.enabled = false;
      this.logger.info(`Scheduled job stopped: ${scheduleId}`);
      return true;
    }
    return false;
  }

  list(): ScheduledJob[] {
    return Array.from(this.jobs.values()).map((entry) => entry.job);
  }

  startAll(): void {
    for (const [scheduleId, entry] of this.jobs) {
      if (entry.job.enabled && !entry.task.running) {
        entry.task.start();
      }
    }
    this.running = true;
    this.logger.info('All scheduled jobs started');
  }

  stopAll(): void {
    for (const entry of this.jobs.values()) {
      if (entry.task.running) {
        entry.task.stop();
      }
    }
    this.running = false;
    this.logger.info('All scheduled jobs stopped');
  }
}
