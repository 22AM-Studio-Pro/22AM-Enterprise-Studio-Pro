import { DatabaseConnection } from '../Database';
import { Setting, SettingType } from '@22am-enterprise/shared';

export class SettingsRepository {
  private db: DatabaseConnection;
  private tableName = 'settings';

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  /**
   * Set a setting
   */
  set(key: string, value: any, type?: SettingType): Setting {
    const now = Date.now();
    const settingType = type || this.inferType(value);
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    const existing = this.get(key);
    if (existing) {
      this.db.execute(
        `UPDATE settings SET value = ?, type = ?, updatedAt = ? WHERE key = ?`,
        [stringValue, settingType, now, key]
      );
    } else {
      this.db.execute(
        `INSERT INTO settings (key, value, type, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
        [key, stringValue, settingType, now, now]
      );
    }

    return this.get(key) as Setting;
  }

  /**
   * Get a setting
   */
  get(key: string): Setting | null {
    const row = this.db.queryOne<any>(
      `SELECT * FROM settings WHERE key = ?`,
      [key]
    );

    return row ? this.mapRow(row) : null;
  }

  /**
   * Get all settings
   */
  getAll(): Setting[] {
    const rows = this.db.query<any>(`SELECT * FROM settings ORDER BY key ASC`);
    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Delete a setting
   */
  delete(key: string): boolean {
    const changes = this.db.execute(`DELETE FROM settings WHERE key = ?`, [key]);
    return changes > 0;
  }

  /**
   * Delete all settings
   */
  deleteAll(): number {
    return this.db.execute(`DELETE FROM settings`);
  }

  /**
   * Check if a setting exists
   */
  has(key: string): boolean {
    const result = this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM settings WHERE key = ?`,
      [key]
    );
    return (result?.count || 0) > 0;
  }

  /**
   * Map database row to Setting object
   */
  private mapRow(row: any): Setting {
    return {
      key: row.key,
      value: this.parseValue(row.value, row.type),
      type: row.type,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Parse value based on type
   */
  private parseValue(value: string, type: SettingType): any {
    switch (type) {
      case 'boolean':
        return value === 'true' || value === '1';
      case 'number':
        return Number(value);
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  }

  /**
   * Infer the type of a value
   */
  private inferType(value: any): SettingType {
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'object') {
      return 'json';
    }
    return 'string';
  }
}
