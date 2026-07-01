import { DatabaseConnection } from '../Database';
import { BaseRepository } from './BaseRepository';
import {
  Plugin,
  PluginCreateInput,
  PluginUpdateInput,
} from '@22am-enterprise/shared';

export class PluginRepository extends BaseRepository {
  constructor(db: DatabaseConnection) {
    super(db, 'plugins');
  }

  /**
   * Create a new plugin
   */
  create(input: PluginCreateInput): Plugin {
    const id = input.id || this.generateId();
    const now = Date.now();

    this.db.execute(
      `INSERT INTO plugins (id, name, version, enabled, path, config, metadata, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.name,
        input.version,
        input.enabled !== false ? 1 : 0,
        input.path,
        input.config ? JSON.stringify(input.config) : null,
        input.metadata ? JSON.stringify(input.metadata) : null,
        now,
        now,
      ]
    );

    return this.getById(id) as Plugin;
  }

  /**
   * Get plugin by id
   */
  getById(id: string): Plugin | null {
    const row = this.db.queryOne<any>(
      `SELECT * FROM plugins WHERE id = ?`,
      [id]
    );

    return row ? this.mapRow(row) : null;
  }

  /**
   * Get plugin by name
   */
  getByName(name: string): Plugin | null {
    const row = this.db.queryOne<any>(
      `SELECT * FROM plugins WHERE name = ?`,
      [name]
    );

    return row ? this.mapRow(row) : null;
  }

  /**
   * List all plugins
   */
  list(limit: number = 100, offset: number = 0): Plugin[] {
    const rows = this.db.query<any>(
      `SELECT * FROM plugins ORDER BY name ASC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Get enabled plugins
   */
  listEnabled(): Plugin[] {
    const rows = this.db.query<any>(
      `SELECT * FROM plugins WHERE enabled = 1 ORDER BY name ASC`
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Update a plugin
   */
  update(id: string, input: PluginUpdateInput): Plugin | null {
    const updates: string[] = [];
    const params: any[] = [];

    if (input.enabled !== undefined) {
      updates.push('enabled = ?');
      params.push(input.enabled ? 1 : 0);
    }
    if (input.version !== undefined) {
      updates.push('version = ?');
      params.push(input.version);
    }
    if (input.config !== undefined) {
      updates.push('config = ?');
      params.push(input.config ? JSON.stringify(input.config) : null);
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
      `UPDATE plugins SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.getById(id);
  }

  /**
   * Delete a plugin
   */
  delete(id: string): boolean {
    return this.deleteById(id);
  }

  /**
   * Map database row to Plugin object
   */
  private mapRow(row: any): Plugin {
    return {
      id: row.id,
      name: row.name,
      version: row.version,
      enabled: row.enabled === 1,
      path: row.path,
      config: row.config ? JSON.parse(row.config) : undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `plugin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
