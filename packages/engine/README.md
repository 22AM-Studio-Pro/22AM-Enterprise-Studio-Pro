# Engine Package

Production-grade execution engine for the 22AM Enterprise Studio Pro application.

## Features

- **Event Bus**: Strongly typed event system for job lifecycle and workflow events
- **Job Queue**: Priority-based job queue with pause/resume support
- **Worker Pool**: Configurable worker concurrency with automatic retry logic
- **Scheduler**: Cron-based job scheduling with enable/disable support
- **Logger**: Structured logging with file rotation (10MB limit)
- **Type Safety**: Fully typed TypeScript implementation

## Architecture

### Engine
Main orchestrator that coordinates all subsystems:
- Manages worker pool
- Processes job queue
- Emits events
- Logs operations
- Integrates with database for persistence

### EventBus
Strongly typed event system supporting:
- `job.created` - New job added to queue
- `job.started` - Job execution started
- `job.progress` - Job progress update
- `job.completed` - Job completed successfully
- `job.failed` - Job execution failed
- `workflow.started` - Workflow execution started
- `workflow.completed` - Workflow execution completed
- `plugin.loaded` - Plugin loaded

### JobQueue
Priority-based queue with features:
- Priority sorting
- Pause/resume
- Job cancellation
- Queue state export

### Worker Pool
Configurable workers with:
- Concurrent job execution
- Automatic retry with exponential backoff
- Handler registration per job type
- Load tracking

### Scheduler
Cron-based scheduling with:
- Valid cron expression validation
- Enable/disable support
- Start/stop operations
- Multiple scheduled jobs

### Logger
Structured logging with:
- Multiple log levels (debug, info, warn, error)
- File writing with rotation
- In-memory log buffer
- Timestamp on all entries

## Configuration

```typescript
interface EngineConfig {
  workerCount: number;      // Number of workers (default: 4)
  retryCount: number;       // Max retries per job (default: 3)
  logLevel: LogLevel;        // Log level (default: 'info')
  databasePath: string;      // SQLite database path
}
```

## Usage

```typescript
import { Engine } from '@22am-enterprise/engine';

const engine = new Engine({
  workerCount: 4,
  retryCount: 3,
  logLevel: 'info',
  databasePath: './data.db'
});

// Register job handlers
engine.registerJobHandler('manual', async (payload) => {
  // Handle job
  return result;
});

// Start engine
await engine.start();

// Enqueue jobs
const jobId = engine.enqueueJob('manual', { data: 'value' }, priority);

// Listen to events
engine.getEventBus().on('job.completed', ({ jobId, result, duration }) => {
  console.log(`Job ${jobId} completed in ${duration}ms`);
});

// Shutdown
await engine.shutdown();
```

## Testing

Run tests with:
```bash
npm test
```

Tests cover:
- EventBus (listeners, events, cleanup)
- JobQueue (priority, pause, removal)
- Scheduler (cron validation, start/stop)
