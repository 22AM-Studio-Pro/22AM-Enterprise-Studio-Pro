import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..');

export class DatabaseConnection {
  private db: Database.Database;
  private isInitialized = false;

  constructor(filepath: string) {
    this.db = new Database(filepath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
  }

  /**
   * Initialize the database with schema
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
      const statements = schema.split(';').filter((stmt) => stmt.trim());

      for (const statement of statements) {
        this.db.exec(statement);
      }

      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize database: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute a query with parameters
   */
  query<T = any>(sql: string, params: any[] = []): T[] {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(...params) as T[];
    } catch (error) {
      throw new Error(`Query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute a query and return a single row
   */
  queryOne<T = any>(sql: string, params: any[] = []): T | null {
    try {
      const stmt = this.db.prepare(sql);
      return (stmt.get(...params) as T) || null;
    } catch (error) {
      throw new Error(`Query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute a statement and return the number of changes
   */
  execute(sql: string, params: any[] = []): number {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(...params);
      return result.changes;
    } catch (error) {
      throw new Error(`Execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Begin a transaction
   */
  beginTransaction(): void {
    this.db.exec('BEGIN TRANSACTION');
  }

  /**
   * Commit the current transaction
   */
  commit(): void {
    this.db.exec('COMMIT');
  }

  /**
   * Rollback the current transaction
   */
  rollback(): void {
    this.db.exec('ROLLBACK');
  }

  /**
   * Run a callback within a transaction
   */
  transaction<T>(callback: () => T): T {
    try {
      this.beginTransaction();
      const result = callback();
      this.commit();
      return result;
    } catch (error) {
      this.rollback();
      throw error;
    }
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}
