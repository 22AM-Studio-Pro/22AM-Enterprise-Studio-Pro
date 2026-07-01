import { DatabaseConnection } from '../Database';
import { BaseRepository } from './BaseRepository';
import {
  Workflow,
  WorkflowCreateInput,
  WorkflowUpdateInput,
} from '@22am-enterprise/shared';

export class WorkflowRepository extends BaseRepository {
  constructor(db: DatabaseConnection) {
    super(db, 'workflows');
  }

  /**
   * Create a new workflow
   */
  create(input: WorkflowCreateInput): Workflow {
    const id = input.id || this.generateId();
    const now = Date.now();

    this.db.execute(
      `INSERT INTO workflows (id, name, description, enabled, config, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.name,
        input.description || null,
        input.enabled !== false ? 1 : 0,
        JSON.stringify(input.config || {}),
        now,
        now,
      ]
    );

    return this.getById(id) as Workflow;
  }

  /**
   * Get workflow by id
   */
  getById(id: string): Workflow | null {
    const row = this.db.queryOne<any>(
      `SELECT * FROM workflows WHERE id = ?`,
      [id]
    );

    return row ? this.mapRow(row) : null;
  }

  /**
   * List all workflows
   */
  list(limit: number = 100, offset: number = 0): Workflow[] {
    const rows = this.db.query<any>(
      `SELECT * FROM workflows ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Get enabled workflows
   */
  listEnabled(): Workflow[] {
    const rows = this.db.query<any>(
      `SELECT * FROM workflows WHERE enabled = 1 ORDER BY createdAt DESC`
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Update a workflow
   */
  update(id: string, input: WorkflowUpdateInput): Workflow | null {
    const updates: string[] = [];
    const params: any[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      params.push(input.name);
    }
    if (input.description !== undefined) {
      updates.push('description = ?');
      params.push(input.description);
    }
    if (input.enabled !== undefined) {
      updates.push('enabled = ?');
      params.push(input.enabled ? 1 : 0);
    }
    if (input.config !== undefined) {
      updates.push('config = ?');
      params.push(JSON.stringify(input.config));
    }
    if (input.lastRunAt !== undefined) {
      updates.push('lastRunAt = ?');
      params.push(input.lastRunAt);
    }
    if (input.lastStatus !== undefined) {
      updates.push('lastStatus = ?');
      params.push(input.lastStatus);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    updates.push('updatedAt = ?');
    params.push(Date.now());
    params.push(id);

    this.db.execute(
      `UPDATE workflows SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.getById(id);
  }

  /**
   * Delete a workflow
   */
  delete(id: string): boolean {
    return this.deleteById(id);
  }

  /**
   * Map database row to Workflow object
   */
  private mapRow(row: any): Workflow {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      enabled: row.enabled === 1,
      config: JSON.parse(row.config),
      lastRunAt: row.lastRunAt,
      lastStatus: row.lastStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
