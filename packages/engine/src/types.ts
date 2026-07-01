export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
export type JobType = 'workflow' | 'manual' | 'scheduled';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface JobPayload {
  [key: string]: unknown;
}

export interface JobProgressUpdate {
  percentage: number;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface EventMap {
  'job.created': { jobId: string; type: JobType }
  'job.started': { jobId: string; timestamp: number }
  'job.progress': { jobId: string } & JobProgressUpdate
  'job.completed': { jobId: string; result: unknown; duration: number }
  'job.failed': { jobId: string; error: string; duration: number }
  'workflow.started': { workflowId: string; jobId: string }
  'workflow.completed': { workflowId: string; jobId: string; result: unknown }
  'plugin.loaded': { pluginName: string; version: string }
}

export type EventType = keyof EventMap;

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface EngineConfig {
  workerCount: number;
  retryCount: number;
  logLevel: LogLevel;
  databasePath: string;
}

export interface ScheduledJob {
  id: string;
  cronExpression: string;
  jobType: JobType;
  payload: JobPayload;
  enabled: boolean;
  nextRun?: number;
}

export interface PersistentJobData {
  id: string;
  type: JobType;
  status: JobStatus;
  priority: number;
  payload: JobPayload;
  progress: number;
  error: string | null;
  retryCount: number;
  createdAt: number;
  startedAt: number | null;
  completedAt: number | null;
}
