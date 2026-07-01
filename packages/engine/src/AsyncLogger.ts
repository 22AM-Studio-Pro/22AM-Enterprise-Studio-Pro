import type { LogLevel, LogEntry } from './types';
import { EventEmitter } from 'events';

const LOG_BUFFER_SIZE = 100;
const FLUSH_INTERVAL = 5000; // 5 seconds

export class AsyncLogger extends EventEmitter {
  private level: LogLevel;
  private logBuffer: LogEntry[] = [];
  private inMemoryLogs: LogEntry[] = [];
  private maxInMemoryLogs = 1000;
  private flushInterval: NodeJS.Timer | null = null;
  private isWriting = false;
  private isFlushing = false;

  constructor(level: LogLevel = 'info') {
    super();
    this.level = level;
    this.startFlushTimer();
  }

  private startFlushTimer(): void {
    this.flushInterval = setInterval(() => {
      this.flush().catch((error) => {
        console.error('Failed to flush logs:', error);
      });
    }, FLUSH_INTERVAL);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    this.inMemoryLogs.push(entry);

    if (this.inMemoryLogs.length > this.maxInMemoryLogs) {
      this.inMemoryLogs.shift();
    }

    if (this.logBuffer.length >= LOG_BUFFER_SIZE) {
      this.flush().catch((error) => {
        console.error('Failed to auto-flush logs:', error);
      });
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      const entry: LogEntry = {
        timestamp: Date.now(),
        level: 'debug',
        message,
        metadata,
      };
      this.addToBuffer(entry);
      if (process.env.NODE_ENV !== 'production') {
        console.debug(message, metadata || '');
      }
    }
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      const entry: LogEntry = {
        timestamp: Date.now(),
        level: 'info',
        message,
        metadata,
      };
      this.addToBuffer(entry);
      if (process.env.NODE_ENV !== 'production') {
        console.log(message, metadata || '');
      }
    }
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      const entry: LogEntry = {
        timestamp: Date.now(),
        level: 'warn',
        message,
        metadata,
      };
      this.addToBuffer(entry);
      console.warn(message, metadata || '');
    }
  }

  error(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const entry: LogEntry = {
        timestamp: Date.now(),
        level: 'error',
        message: `${message}: ${errorMsg}`,
        metadata: {
          ...metadata,
          stack: error instanceof Error ? error.stack : undefined,
        },
      };
      this.addToBuffer(entry);
      console.error(message, error || '');
    }
  }

  async flush(): Promise<void> {
    if (this.isFlushing || this.isWriting || this.logBuffer.length === 0) {
      return;
    }

    this.isFlushing = true;
    try {
      const entriesToWrite = [...this.logBuffer];
      this.logBuffer = [];

      this.isWriting = true;
      this.emit('write', entriesToWrite);
      this.isWriting = false;
    } finally {
      this.isFlushing = false;
    }
  }

  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flush();
  }

  getLogs(limit: number = 100): LogEntry[] {
    return this.inMemoryLogs.slice(-limit);
  }

  clearLogs(): void {
    this.inMemoryLogs = [];
  }
}
