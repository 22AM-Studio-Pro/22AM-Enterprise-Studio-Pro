import { Scheduler } from '../Scheduler';
import { Logger } from '../Logger';
import { JobQueue } from '../JobQueue';

describe('Scheduler', () => {
  let scheduler: Scheduler;
  let logger: Logger;
  let queue: JobQueue;

  beforeEach(() => {
    logger = new Logger('error'); // Suppress logs during tests
    queue = new JobQueue();
    scheduler = new Scheduler({ logger, queue });
  });

  describe('add', () => {
    it('should add a scheduled job', () => {
      const scheduleId = scheduler.add('0 0 * * *', 'manual', { test: 'data' });
      expect(typeof scheduleId).toBe('string');
      expect(scheduler.list().length).toBe(1);
    });

    it('should throw on invalid cron expression', () => {
      expect(() => {
        scheduler.add('invalid', 'manual', { test: 'data' });
      }).toThrow();
    });
  });

  describe('remove', () => {
    it('should remove a scheduled job', () => {
      const scheduleId = scheduler.add('0 0 * * *', 'manual', { test: 'data' });
      const removed = scheduler.remove(scheduleId);
      expect(removed).toBe(true);
      expect(scheduler.list().length).toBe(0);
    });

    it('should return false if schedule not found', () => {
      const removed = scheduler.remove('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('start and stop', () => {
    it('should start a scheduled job', () => {
      const scheduleId = scheduler.add(
        '0 0 * * *',
        'manual',
        { test: 'data' },
        false
      );
      const started = scheduler.start(scheduleId);
      expect(started).toBe(true);
    });

    it('should stop a scheduled job', () => {
      const scheduleId = scheduler.add('0 0 * * *', 'manual', { test: 'data' });
      const stopped = scheduler.stop(scheduleId);
      expect(stopped).toBe(true);
    });
  });

  describe('list', () => {
    it('should list all scheduled jobs', () => {
      scheduler.add('0 0 * * *', 'manual', { test: 'data1' });
      scheduler.add('0 12 * * *', 'manual', { test: 'data2' });
      const jobs = scheduler.list();
      expect(jobs.length).toBe(2);
    });
  });

  describe('startAll and stopAll', () => {
    it('should start all scheduled jobs', () => {
      scheduler.add('0 0 * * *', 'manual', { test: 'data1' }, false);
      scheduler.add('0 12 * * *', 'manual', { test: 'data2' }, false);
      scheduler.startAll();
      expect(scheduler.list().every((job) => job.enabled)).toBe(true);
    });

    it('should stop all scheduled jobs', () => {
      scheduler.add('0 0 * * *', 'manual', { test: 'data1' });
      scheduler.add('0 12 * * *', 'manual', { test: 'data2' });
      scheduler.stopAll();
      expect(scheduler.list().every((job) => !job.enabled)).toBe(true);
    });
  });
});
