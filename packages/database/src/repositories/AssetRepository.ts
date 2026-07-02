import { DatabaseConnection } from '../Database';
import { BaseRepository } from './BaseRepository';
import type { Asset, AssetCreateInput, AssetUpdateInput } from '../shared-types';

export class AssetRepository extends BaseRepository {
  constructor(db: DatabaseConnection) {
    super(db, 'assets');
  }

  /**
   * Create a new asset
   */
  create(input: AssetCreateInput): Asset {
    const id = input.id || this.generateId();
    const now = Date.now();

    this.db.execute(
      `INSERT INTO assets (id, name, type, path, size, mimeType, tags, metadata, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.name,
        input.type,
        input.path,
        input.size || null,
        input.mimeType || null,
        input.tags ? JSON.stringify(input.tags) : null,
        input.metadata ? JSON.stringify(input.metadata) : null,
        now,
        now,
      ]
    );

    return this.getById(id) as Asset;
  }

  /**
   * Get asset by id
   */
  getById(id: string): Asset | null {
    const row = this.db.queryOne<any>(
      `SELECT * FROM assets WHERE id = ?`,
      [id]
    );

    return row ? this.mapRow(row) : null;
  }

  /**
   * Get asset by path
   */
  getByPath(path: string): Asset | null {
    const row = this.db.queryOne<any>(
      `SELECT * FROM assets WHERE path = ?`,
      [path]
    );

    return row ? this.mapRow(row) : null;
  }

  /**
   * List all assets
   */
  list(limit: number = 100, offset: number = 0): Asset[] {
    const rows = this.db.query<any>(
      `SELECT * FROM assets ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Find assets by type
   */
  findByType(type: string): Asset[] {
    const rows = this.db.query<any>(
      `SELECT * FROM assets WHERE type = ? ORDER BY createdAt DESC`,
      [type]
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Update an asset
   */
  update(id: string, input: AssetUpdateInput): Asset | null {
    const updates: string[] = [];
    const params: any[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      params.push(input.name);
    }
    if (input.size !== undefined) {
      updates.push('size = ?');
      params.push(input.size);
    }
    if (input.tags !== undefined) {
      updates.push('tags = ?');
      params.push(input.tags ? JSON.stringify(input.tags) : null);
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
      `UPDATE assets SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.getById(id);
  }

  /**
   * Delete an asset
   */
  delete(id: string): boolean {
    return this.deleteById(id);
  }

  /**
   * Map database row to Asset object
   */
  private mapRow(row: any): Asset {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      path: row.path,
      size: row.size,
      mimeType: row.mimeType,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
