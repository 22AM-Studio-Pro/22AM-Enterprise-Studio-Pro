import type { LogLevel, LogEntry } from './types';
import { appendFileSync, statSync, renameSync } from 'fs';
import { join } from 'path';
import { dirname } from 'path';
import { mkdirSync } from 'fs';

const LOG_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export class Logger {
  private level: LogLevel;
  private logPath: string;
  private logEntries: LogEntry[] = [];
  private maxInMemoryLogs = 1000;

  constructor(level: LogLevel = 'info', logDirectory: string = './logs') {
    this.level = level;
    this.logPath = join(logDirectory, 'application.log');
    this.ensureLogDirectory(logDirectory);
  }

  private ensureLogDirectory(directory: string): void {
    try {
      mkdirSync(directory, { recursive: true });
    } catch (error) {
      console.error(`Failed to create log directory: ${directory}`);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private writeLog(entry: LogEntry): void {
    // Keep in memory for recent logs
    this.logEntries.push(entry);
    if (this.logEntries.length > this.maxInMemoryLogs) {
      this.logEntries.shift();
    }

    // Write to file
    try {
      const logLine = JSON.stringify(entry) + '\n';
      appendFileSync(this.logPath, logLine);

      // Check if rotation is needed
      this.rotateIfNeeded();
    } catch (error) {
      console.error(`Failed to write log: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private rotateIfNeeded(): void {
    try {
      const stats = statSync(this.logPath);
      if (stats.size > LOG_MAX_SIZE) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedPath = join(
          dirname(this.logPath),
          `application.${timestamp}.log`
        );
        renameSync(this.logPath, rotatedPath);
      }
    } catch (error) {
      // File might not exist yet, ignore
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      this.writeLog({
        timestamp: Date.now(),
        level: 'debug',
        message,
        metadata,
      });
      if (process.env.NODE_ENV !== 'production') {
        console.debug(message, metadata || '');
      }
    }
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      this.writeLog({
        timestamp: Date.now(),
        level: 'info',
        message,
        metadata,
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log(message, metadata || '');
      }
    }
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      this.writeLog({
        timestamp: Date.now(),
        level: 'warn',
        message,
        metadata,
      });
      console.warn(message, metadata || '');
    }
  }

  error(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.writeLog({
        timestamp: Date.now(),
        level: 'error',
        message: `${message}: ${errorMsg}`,
        metadata: {
          ...metadata,
          stack: error instanceof Error ? error.stack : undefined,
        },
      });
      console.error(message, error || '');
    }
  }

  getLogs(limit: number = 100): LogEntry[] {
    return this.logEntries.slice(-limit);
  }

  clearLogs(): void {
    this.logEntries = [];
  }
}
