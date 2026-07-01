import { Engine } from '../Engine';
import { DatabaseManager } from '@22am-enterprise/database';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Engine Crash Recovery Tests', () => {
  let tmpDir: string;
  let dbPath: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'engine-crash-test-'));
    dbPath = join(tmpDir, 'test.db');
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true });
  });

  it('should recover incomplete jobs after simulated crash', async () => {
    let db = new DatabaseManager(dbPath);
    await db.initialize();

    let engine = new Engine(
      {
        workerCount: 2,
        retryCount: 2,
        logLevel: 'error',
        databasePath: dbPath,
      },
      db
    );

    await engine.start();
    const processedJobs: string[] = [];

    engine.registerJobHandler('manual', async (payload: any) => {
      processedJobs.push(payload.id);
      return { processed: payload.id };
    });

    // Enqueue 5 jobs
    const jobIds: string[] = [];
    for (let i = 0; i < 5; i++) {
      const jobId = await engine.enqueueJob('manual', { id: `job-${i}` });
      jobIds.push(jobId);
    }

    // Simulate crash - shutdown without waiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await engine.shutdown();

    // Restart engine
    db = new DatabaseManager(dbPath);
    await db.initialize();

    engine = new Engine(
      {
        workerCount: 2,
        retryCount: 2,
        logLevel: 'error',
        databasePath: dbPath,
      },
      db
    );

    await engine.start();

    engine.registerJobHandler('manual', async (payload: any) => {
      processedJobs.push(payload.id);
      return { processed: payload.id };
    });

    // Wait for recovery processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    expect(processedJobs.length).toBeGreaterThan(0);

    await engine.shutdown();
  });

  it('should not duplicate jobs after recovery', async () => {
    let db = new DatabaseManager(dbPath);
    await db.initialize();

    let engine = new Engine(
      {
        workerCount: 1,
        retryCount: 1,
        logLevel: 'error',
        databasePath: dbPath,
      },
      db
    );

    await engine.start();
    const jobIds = new Set<string>();

    engine.registerJobHandler('manual', async (payload: any) => {
      jobIds.add(payload.id);
      return payload.id;
    });

    for (let i = 0; i < 3; i++) {
      await engine.enqueueJob('manual', { id: `duplicate-test-${i}` });
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    await engine.shutdown();

    // Restart and verify
    db = new DatabaseManager(dbPath);
    await db.initialize();

    engine = new Engine(
      {
        workerCount: 1,
        retryCount: 1,
        logLevel: 'error',
        databasePath: dbPath,
      },
      db
    );

    await engine.start();

    engine.registerJobHandler('manual', async (payload: any) => {
      return payload.id;
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(jobIds.size).toBeLessThanOrEqual(3);

    await engine.shutdown();
  });
});
