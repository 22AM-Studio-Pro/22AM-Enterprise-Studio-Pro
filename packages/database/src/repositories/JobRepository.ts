import { DatabaseConnection } from '../Database';
import { BaseRepository } from './BaseRepository';
import {
  Job,
  JobCreateInput,
  JobUpdateInput,
  JobStatus,
} from '@22am-enterprise/shared';

export class JobRepository extends BaseRepository {
  constructor(db: DatabaseConnection) {
    super(db, 'jobs');
  }

  /**
   * Create a new job
   */
  create(input: JobCreateInput): Job {
    const id = input.id || this.generateId();
    const now = Date.now();

    this.db.execute(
      `INSERT INTO jobs (id, workflowId, name, status, progress, metadata, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.workflowId,
        input.name,
        input.status || 'pending',
        input.progress || 0,
        input.metadata ? JSON.stringify(input.metadata) : null,
        now,
        now,
      ]
    );

    return this.getById(id) as Job;
  }

  /**
   * Get job by id
   */
  getById(id: string): Job | null {
    const row = this.db.queryOne<any>(
      `SELECT * FROM jobs WHERE id = ?`,
      [id]
    );

    return row ? this.mapRow(row) : null;
  }

  /**
   * List all jobs with optional filtering
   */
  list(limit: number = 100, offset: number = 0): Job[] {
    const rows = this.db.query<any>(
      `SELECT * FROM jobs ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Find jobs by status
   */
  findByStatus(status: JobStatus): Job[] {
    const rows = this.db.query<any>(
      `SELECT * FROM jobs WHERE status = ? ORDER BY createdAt DESC`,
      [status]
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Find jobs by workflow id
   */
  findByWorkflowId(workflowId: string): Job[] {
    const rows = this.db.query<any>(
      `SELECT * FROM jobs WHERE workflowId = ? ORDER BY createdAt DESC`,
      [workflowId]
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Update a job
   */
  update(id: string, input: JobUpdateInput): Job | null {
    const updates: string[] = [];
    const params: any[] = [];

    if (input.status !== undefined) {
      updates.push('status = ?');
      params.push(input.status);
    }
    if (input.progress !== undefined) {
      updates.push('progress = ?');
      params.push(input.progress);
    }
    if (input.error !== undefined) {
      updates.push('error = ?');
      params.push(input.error);
    }
    if (input.startedAt !== undefined) {
      updates.push('startedAt = ?');
      params.push(input.startedAt);
    }
    if (input.completedAt !== undefined) {
      updates.push('completedAt = ?');
      params.push(input.completedAt);
    }
    if (input.metadata !== undefined) {
      updates.push('metadata = ?');
      params.push(input.metadata ? JSON.stringify(input.metadata) : null);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    updates.push('updatedAt = ?');
    params.push(Date.now());
    params.push(id);

    this.db.execute(
      `UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.getById(id);
  }

  /**
   * Delete a job
   */
  delete(id: string): boolean {
    return this.deleteById(id);
  }

  /**
   * Map database row to Job object
   */
  private mapRow(row: any): Job {
    return {
      id: row.id,
      workflowId: row.workflowId,
      name: row.name,
      status: row.status,
      progress: row.progress,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      error: row.error,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
