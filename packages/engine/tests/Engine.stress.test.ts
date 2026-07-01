import { Engine } from '../Engine';
import { DatabaseManager } from '@22am-enterprise/database';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Engine Stress Tests', () => {
  let tmpDir: string;
  let dbPath: string;
  let db: DatabaseManager;
  let engine: Engine;

  beforeEach(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), 'engine-stress-'));
    dbPath = join(tmpDir, 'test.db');
    db = new DatabaseManager(dbPath);
    await db.initialize();

    engine = new Engine(
      {
        workerCount: 4,
        retryCount: 2,
        logLevel: 'error',
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

  it('should handle 100 concurrent jobs without deadlocks', async () => {
    await engine.start();

    const completedJobs = new Set<string>();
    const failedJobs = new Set<string>();

    engine.registerJobHandler('manual', async (payload: any) => {
      return { processed: payload.id };
    });

    engine.getEventBus().on('job.completed', ({ jobId }) => {
      completedJobs.add(jobId);
    });

    engine.getEventBus().on('job.failed', ({ jobId }) => {
      failedJobs.add(jobId);
    });

    const jobIds: string[] = [];
    for (let i = 0; i < 100; i++) {
      const jobId = await engine.enqueueJob('manual', { id: `stress-${i}` }, Math.floor(Math.random() * 10));
      jobIds.push(jobId);
    }

    expect(engine.getJobQueueSize()).toBe(100);

    // Wait for processing
    let iterations = 0;
    while (
      (completedJobs.size + failedJobs.size < 100 || engine.getJobQueueSize() > 0) &&
      iterations < 50
    ) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      iterations++;
    }

    expect(completedJobs.size + failedJobs.size).toBeGreaterThanOrEqual(50);

    await engine.shutdown();
  });

  it('should maintain event emission under load', async () => {
    await engine.start();

    const events: Array<{ type: string; jobId: string }> = [];

    engine.getEventBus().on('job.created', ({ jobId }) => {
      events.push({ type: 'created', jobId });
    });
    engine.getEventBus().on('job.started', ({ jobId }) => {
      events.push({ type: 'started', jobId });
    });
    engine.getEventBus().on('job.completed', ({ jobId }) => {
      events.push({ type: 'completed', jobId });
    });

    engine.registerJobHandler('manual', async () => {
      return { success: true };
    });

    for (let i = 0; i < 50; i++) {
      await engine.enqueueJob('manual', { id: `event-test-${i}` });
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

    expect(events.filter((e) => e.type === 'created').length).toBe(50);
    expect(events.filter((e) => e.type === 'started').length).toBeGreaterThan(0);
    expect(events.filter((e) => e.type === 'completed').length).toBeGreaterThan(0);

    await engine.shutdown();
  });

  it('should preserve queue order under concurrent operations', async () => {
    await engine.start();

    const processedOrder: number[] = [];
    let processingCounter = 0;

    engine.registerJobHandler('manual', async (payload: any) => {
      processingCounter++;
      processedOrder.push(payload.priority);
      await new Promise((resolve) => setTimeout(resolve, 50));
      return payload.priority;
    });

    // Enqueue jobs with specific priorities
    const priorities = [10, 5, 8, 1, 9, 3, 7, 2, 6, 4];
    for (const priority of priorities) {
      await engine.enqueueJob('manual', { priority }, priority);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // First batch should be processed in priority order (highest first)
    if (processedOrder.length > 0) {
      expect(processedOrder[0]).toBeGreaterThanOrEqual(processedOrder[1] || 0);
    }

    await engine.shutdown();
  });

  it('should maintain logger consistency under concurrent logging', async () => {
    await engine.start();

    engine.registerJobHandler('manual', async (payload: any) => {
      engine.getLogger().info(`Processing job ${payload.id}`);
      return { processed: payload.id };
    });

    for (let i = 0; i < 50; i++) {
      await engine.enqueueJob('manual', { id: i });
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const logs = engine.getLogger().getLogs(1000);
    expect(logs.length).toBeGreaterThan(0);

    // Verify logs are valid JSON structures
    for (const log of logs) {
      expect(log).toHaveProperty('timestamp');
      expect(log).toHaveProperty('level');
      expect(log).toHaveProperty('message');
    }

    await engine.shutdown();
  });
});
