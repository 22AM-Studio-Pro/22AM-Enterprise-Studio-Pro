import { DatabaseConnection } from '../Database';

export abstract class BaseRepository {
  protected db: DatabaseConnection;
  protected tableName: string;

  constructor(db: DatabaseConnection, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  /**
   * Count total records
   */
  count(): number {
    const result = this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${this.tableName}`
    );
    return result?.count || 0;
  }

  /**
   * Delete a record by id
   */
  deleteById(id: string): boolean {
    const changes = this.db.execute(
      `DELETE FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return changes > 0;
  }

  /**
   * Delete all records
   */
  deleteAll(): number {
    return this.db.execute(`DELETE FROM ${this.tableName}`);
  }
}
