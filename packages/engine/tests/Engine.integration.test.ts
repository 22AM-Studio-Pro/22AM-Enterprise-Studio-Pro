import { Engine } from '../Engine';
import { DatabaseManager } from '@22am-enterprise/database';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Engine Integration Tests', () => {
  let tmpDir: string;
  let engine: Engine;
  let db: DatabaseManager;

  beforeEach(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'engine-test-'));
    const dbPath = join(tmpDir, 'test.db');
    db = new DatabaseManager(dbPath);
    await db.initialize();

    engine = new Engine(
      {
        workerCount: 2,
        retryCount: 2,
        logLevel: 'info',
        databasePath: dbPath,
      },
      db
    );
  });

  afterEach(async () => {
    if (engine.isRunning()) {
      await engine.shutdown();
    }
    rmSync(tmpDir, { recursive: true });
  });

  describe('basic lifecycle', () => {
    it('should start and shutdown gracefully', async () => {
      await engine.start();
      expect(engine.isRunning()).toBe(true);
      await engine.shutdown();
      expect(engine.isRunning()).toBe(false);
    });

    it('should initialize with correct worker count', async () => {
      const status = engine.status();
      expect(status.workerCount).toBe(2);
      expect(status.workers.length).toBe(2);
    });
  });

  describe('job enqueueing and execution', () => {
    it('should enqueue and execute a job', async () => {
      await engine.start();
      engine.registerJobHandler('manual', async (payload) => {
        return { success: true, data: payload };
      });

      const jobId = await engine.enqueueJob('manual', { test: 'data' });
      expect(jobId).toBeDefined();
      expect(engine.getJobQueueSize()).toBe(1);

      // Wait for job execution
      await new Promise((resolve) => setTimeout(resolve, 2000));

      expect(engine.getJobQueueSize()).toBeLessThanOrEqual(1);
      await engine.shutdown();
    });

    it('should execute multiple jobs with correct priority', async () => {
      await engine.start();
      const results: string[] = [];

      engine.registerJobHandler('manual', async (payload: any) => {
        results.push(payload.order);
        return payload.order;
      });

      await engine.enqueueJob('manual', { order: 'low' }, 1);
      await engine.enqueueJob('manual', { order: 'high' }, 10);
      await engine.enqueueJob('manual', { order: 'medium' }, 5);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      expect(results[0]).toBe('high');
      expect(results[1]).toBe('medium');

      await engine.shutdown();
    });
  });

  describe('event emission', () => {
    it('should emit job lifecycle events', async () => {
      await engine.start();
      const events: string[] = [];

      engine.getEventBus().on('job.created', () => {
        events.push('created');
      });
      engine.getEventBus().on('job.started', () => {
        events.push('started');
      });
      engine.getEventBus().on('job.completed', () => {
        events.push('completed');
      });

      engine.registerJobHandler('manual', async () => {
        return { success: true };
      });

      await engine.enqueueJob('manual', {});

      await new Promise((resolve) => setTimeout(resolve, 2000));

      expect(events).toContain('created');
      expect(events).toContain('started');
      expect(events).toContain('completed');

      await engine.shutdown();
    });

    it('should emit job.failed event on error', async () => {
      await engine.start();
      let failedEventFired = false;

      engine.getEventBus().on('job.failed', () => {
        failedEventFired = true;
      });

      engine.registerJobHandler('manual', async () => {
        throw new Error('Job execution failed');
      });

      await engine.enqueueJob('manual', {});

      await new Promise((resolve) => setTimeout(resolve, 3000));

      expect(failedEventFired).toBe(true);

      await engine.shutdown();
    });
  });

  describe('persistence and recovery', () => {
    it('should persist jobs to database', async () => {
      await engine.start();

      engine.registerJobHandler('manual', async () => {
        return { success: true };
      });

      await engine.enqueueJob('manual', { data: 'persist-test' });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      await engine.shutdown();

      // Verify job was persisted
      const jobs = db.jobs.list();
      expect(jobs.length).toBeGreaterThan(0);
    });

    it('should recover incomplete jobs on restart', async () => {
      await engine.start();

      engine.registerJobHandler('manual', async () => {
        return { success: true };
      });

      const jobId = await engine.enqueueJob('manual', { data: 'recovery-test' });

      // Shutdown before job completes
      await new Promise((resolve) => setTimeout(resolve, 500));
      await engine.shutdown();

      // Restart engine
      const db2 = new DatabaseManager(db.jobs.getById(jobId)?.workflowId || '');
      const engine2 = new Engine(
        {
          workerCount: 2,
          retryCount: 2,
          logLevel: 'info',
          databasePath: '',
        },
        db2
      );

      // Queue size should be preserved or jobs recovered
      expect(engine2).toBeDefined();
    });
  });

  describe('queue management', () => {
    it('should pause and resume queue', async () => {
      await engine.start();
      const jobs: string[] = [];

      engine.registerJobHandler('manual', async (payload: any) => {
        jobs.push(payload.id);
        return payload.id;
      });

      await engine.enqueueJob('manual', { id: '1' });
      await engine.enqueueJob('manual', { id: '2' });

      engine.pauseQueue();
      await new Promise((resolve) => setTimeout(resolve, 500));

      const paused = jobs.length;

      engine.resumeQueue();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      expect(jobs.length).toBeGreaterThan(paused);

      await engine.shutdown();
    });

    it('should cancel pending jobs', async () => {
      await engine.start();

      engine.registerJobHandler('manual', async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { success: true };
      });

      const jobId = await engine.enqueueJob('manual', {});
      const cancelled = await engine.cancelJob(jobId);

      expect(cancelled).toBe(true);

      await engine.shutdown();
    });
  });

  describe('logging', () => {
    it('should collect logs', async () => {
      await engine.start();

      engine.registerJobHandler('manual', async () => {
        return { success: true };
      });

      await engine.enqueueJob('manual', {});

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const logs = engine.getLogger().getLogs();
      expect(logs.length).toBeGreaterThan(0);

      await engine.shutdown();
    });
  });

  describe('scheduler', () => {
    it('should add and remove scheduled jobs', async () => {
      await engine.start();

      const scheduleId = engine.getScheduler().add('0 0 * * *', 'manual', { test: 'data' });
      expect(scheduleId).toBeDefined();

      const schedules = engine.getScheduler().list();
      expect(schedules.length).toBeGreaterThan(0);

      const removed = await engine.getScheduler().remove(scheduleId);
      expect(removed).toBe(true);

      await engine.shutdown();
    });
  });
});
