import type { ExecutionLog } from '../types/index';

export class Logger {
  private logs: ExecutionLog[] = [];
  private maxLogs = 10000;
  private level: 'debug' | 'info' | 'warn' | 'error';

  constructor(level: 'debug' | 'info' | 'warn' | 'error' = 'info') {
    this.level = level;
  }

  private shouldLog(messageLevel: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(messageLevel) >= levels.indexOf(this.level);
  }

  debug(
    message: string,
    taskId?: string,
    metadata?: Record<string, any>
  ): void {
    if (this.shouldLog('debug')) {
      this.addLog('debug', message, taskId, metadata);
    }
  }

  info(
    message: string,
    taskId?: string,
    metadata?: Record<string, any>
  ): void {
    if (this.shouldLog('info')) {
      this.addLog('info', message, taskId, metadata);
    }
  }

  warn(
    message: string,
    taskId?: string,
    metadata?: Record<string, any>
  ): void {
    if (this.shouldLog('warn')) {
      this.addLog('warn', message, taskId, metadata);
    }
  }

  error(
    message: string,
    taskId?: string,
    metadata?: Record<string, any>
  ): void {
    if (this.shouldLog('error')) {
      this.addLog('error', message, taskId, metadata);
    }
  }

  private addLog(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    taskId?: string,
    metadata?: Record<string, any>
  ): void {
    const log: ExecutionLog = {
      timestamp: Date.now(),
      level,
      message,
      taskId,
      metadata,
    };

    this.logs.push(log);

    // Trim logs if exceeds max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (process.env.NODE_ENV !== 'production') {
      const prefix = taskId ? `[${taskId}]` : '';
      console[level === 'warn' || level === 'error' ? level : 'log'](
        `${prefix} ${message}`,
        metadata || ''
      );
    }
  }

  getLogs(taskId?: string): ExecutionLog[] {
    if (taskId) {
      return this.logs.filter((log) => log.taskId === taskId);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}
