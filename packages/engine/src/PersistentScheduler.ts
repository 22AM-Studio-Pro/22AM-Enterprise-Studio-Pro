import type { ScheduledJob, JobType, JobPayload } from './types';
import { PersistentJobQueue } from './PersistentJobQueue';
import { LoggerService } from './LoggerService';
import cron from 'cron';
import type { DatabaseManager } from '@22am-enterprise/database';

interface SchedulerConfig {
  logger: LoggerService;
  queue: PersistentJobQueue;
  db: DatabaseManager;
}

export class PersistentScheduler {
  private jobs: Map<string, { job: ScheduledJob; task: cron.CronJob }> = new Map();
  private logger: LoggerService;
  private queue: PersistentJobQueue;
  private db: DatabaseManager;
  private running = false;

  constructor(config: SchedulerConfig) {
    this.logger = config.logger;
    this.queue = config.queue;
    this.db = config.db;
  }

  private generateScheduleId(): string {
    return `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async loadPersistentSchedules(): Promise<void> {
    try {
      const settings = this.db.settings.get('scheduled_jobs');
      if (settings) {
        const schedules = JSON.parse(settings.value);
        for (const schedule of schedules) {
          if (schedule.enabled) {
            this.add(
              schedule.cronExpression,
              schedule.jobType,
              schedule.payload,
              true
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to load persistent schedules', error);
    }
  }

  private async persistSchedules(): Promise<void> {
    const schedules = Array.from(this.jobs.values()).map((entry) => entry.job);
    this.db.settings.set('scheduled_jobs', JSON.stringify(schedules));
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
            this.queue.enqueue(jobType, payload).catch((error) => {
              this.logger.error('Failed to enqueue scheduled job', error);
            });
            scheduledJob.nextRun = new Date(Date.now()).getTime() + 60000;
          }
        },
        null,
        false,
        'UTC'
      );

      this.jobs.set(scheduleId, { job: scheduledJob, task });

      if (enabled && this.running) {
        task.start();
      }

      this.persistSchedules().catch((error) => {
        this.logger.error('Failed to persist schedules', error);
      });

      this.logger.info(`Scheduled job added: ${scheduleId}`, {
        cronExpression,
        jobType,
      });

      return scheduleId;
    } catch (error) {
      this.logger.error('Failed to add scheduled job', error, { cronExpression, jobType });
      throw error;
    }
  }

  async remove(scheduleId: string): Promise<boolean> {
    const entry = this.jobs.get(scheduleId);
    if (entry) {
      entry.task.stop();
      this.jobs.delete(scheduleId);
      await this.persistSchedules();
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
      this.persistSchedules().catch((error) => {
        this.logger.error('Failed to persist schedules', error);
      });
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
      this.persistSchedules().catch((error) => {
        this.logger.error('Failed to persist schedules', error);
      });
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
