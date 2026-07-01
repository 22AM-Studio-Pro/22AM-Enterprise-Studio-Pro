import { AsyncLogger } from './AsyncLogger';
import { writeFileSync, appendFileSync, statSync, renameSync } from 'fs';
import { join } from 'path';
import { dirname } from 'path';
import { mkdirSync } from 'fs';
import type { LogEntry } from './types';

const LOG_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export class LoggerService {
  private logger: AsyncLogger;
  private logPath: string;
  private writeLock = false;

  constructor(level: 'debug' | 'info' | 'warn' | 'error' = 'info', logDirectory: string = './logs') {
    this.logPath = join(logDirectory, 'application.log');
    this.ensureLogDirectory(logDirectory);
    this.logger = new AsyncLogger(level);
    this.logger.on('write', (entries: LogEntry[]) => {
      this.writeLogsAtomic(entries);
    });
  }

  private ensureLogDirectory(directory: string): void {
    try {
      mkdirSync(directory, { recursive: true });
    } catch (error) {
      console.error(`Failed to create log directory: ${directory}`);
    }
  }

  private writeLogsAtomic(entries: LogEntry[]): void {
    if (this.writeLock) {
      return;
    }

    this.writeLock = true;
    try {
      const lines = entries.map((entry) => JSON.stringify(entry) + '\n').join('');
      appendFileSync(this.logPath, lines);
      this.rotateIfNeeded();
    } catch (error) {
      console.error(
        `Failed to write logs: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      this.writeLock = false;
    }
  }

  private rotateIfNeeded(): void {
    try {
      const stats = statSync(this.logPath);
      if (stats.size > LOG_MAX_SIZE) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedPath = join(dirname(this.logPath), `application.${timestamp}.log`);
        renameSync(this.logPath, rotatedPath);
      }
    } catch (error) {
      // File might not exist yet or rotation failed, ignore
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.logger.debug(message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.logger.info(message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.logger.warn(message, metadata);
  }

  error(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void {
    this.logger.error(message, error, metadata);
  }

  getLogs(limit?: number): LogEntry[] {
    return this.logger.getLogs(limit);
  }

  clearLogs(): void {
    this.logger.clearLogs();
  }

  async shutdown(): Promise<void> {
    await this.logger.shutdown();
    await this.logger.flush();
  }
}
