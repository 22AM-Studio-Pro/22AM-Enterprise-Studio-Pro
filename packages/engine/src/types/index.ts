export type ExecutionState = 'idle' | 'running' | 'paused' | 'stopping' | 'stopped';
export type TaskState = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'cancelled';

export interface ExecutionContext {
  jobId: string;
  workflowId: string;
  startTime: number;
  variables: Record<string, any>;
  previousResults: Map<string, any>;
}

export interface TaskResult {
  taskId: string;
  state: TaskState;
  output?: any;
  error?: string;
  duration: number;
  startTime: number;
  endTime: number;
}

export interface ExecutionLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  taskId?: string;
  metadata?: Record<string, any>;
}

export interface EngineConfig {
  maxConcurrentJobs: number;
  taskTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
