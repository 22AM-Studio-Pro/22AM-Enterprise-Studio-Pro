import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs-extra'

export class AssetRepository {
  private db: Database.Database

  constructor(dbPath?: string) {
    const base = dbPath ?? path.resolve(process.cwd(), 'packages/assets/data/assets.db')
    fs.ensureDirSync(path.dirname(base))
    this.db = new Database(base)
    this.init()
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        folder_id TEXT,
        type TEXT,
        path TEXT,
        filename TEXT,
        mime_type TEXT,
        size INTEGER,
        checksum TEXT UNIQUE,
        hash TEXT,
        dimensions TEXT,
        duration REAL,
        fps REAL,
        codec TEXT,
        created_date TEXT,
        modified_date TEXT,
        author TEXT,
        source_provider TEXT,
        workflow_id TEXT,
        execution_id TEXT,
        tags TEXT,
        custom_metadata TEXT,
        created_at TEXT,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT,
        parent_id TEXT,
        created_at TEXT,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT,
        description TEXT,
        created_at TEXT,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS asset_tags (
        asset_id TEXT,
        tag TEXT,
        FOREIGN KEY(asset_id) REFERENCES assets(id)
      );
      CREATE TABLE IF NOT EXISTS asset_checksums (
        checksum TEXT PRIMARY KEY,
        asset_id TEXT,
        hash TEXT,
        FOREIGN KEY(asset_id) REFERENCES assets(id)
      );
      CREATE TABLE IF NOT EXISTS thumbnails (
        asset_id TEXT PRIMARY KEY,
        thumbnail_path TEXT,
        generated_at TEXT,
        FOREIGN KEY(asset_id) REFERENCES assets(id)
      );
    `)
  }

  createAsset(asset: any) {
    const stmt = this.db.prepare(`
      INSERT INTO assets (id, folder_id, type, path, filename, mime_type, size, checksum, hash, 
        dimensions, duration, fps, codec, created_date, modified_date, author, source_provider, 
        workflow_id, execution_id, tags, custom_metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const now = new Date().toISOString()
    const m = asset.metadata
    const dims = m.dimensions ? JSON.stringify(m.dimensions) : null
    const tags = m.tags ? JSON.stringify(m.tags) : '[]'
    const meta = m.customMetadata ? JSON.stringify(m.customMetadata) : null
    stmt.run(asset.id, asset.folderId ?? null, asset.type, asset.path, m.filename, m.mimeType, m.size, 
      m.checksum, m.hash, dims, m.duration ?? null, m.fps ?? null, m.codec ?? null, m.createdDate, 
      m.modifiedDate, m.author ?? null, m.sourceProvider ?? null, m.workflowId ?? null, m.executionId ?? null, 
      tags, meta, now, now)
  }

  getAsset(id: string) {
    const stmt = this.db.prepare('SELECT * FROM assets WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return undefined
    return this.rowToAsset(row)
  }

  listAssets(folderId?: string) {
    let stmt
    if (folderId) stmt = this.db.prepare('SELECT * FROM assets WHERE folder_id = ?')
    else stmt = this.db.prepare('SELECT * FROM assets')
    const rows = folderId ? stmt.all(folderId) : stmt.all()
    return (rows as any[]).map((r) => this.rowToAsset(r))
  }

  searchAssets(query: string) {
    const q = `%${query}%`
    const stmt = this.db.prepare('SELECT * FROM assets WHERE filename LIKE ? OR tags LIKE ? ORDER BY created_at DESC')
    const rows = stmt.all(q, q) as any[]
    return rows.map((r) => this.rowToAsset(r))
  }

  deleteAsset(id: string) {
    this.db.prepare('DELETE FROM assets WHERE id = ?').run(id)
    this.db.prepare('DELETE FROM asset_tags WHERE asset_id = ?').run(id)
    this.db.prepare('DELETE FROM asset_checksums WHERE asset_id = ?').run(id)
    this.db.prepare('DELETE FROM thumbnails WHERE asset_id = ?').run(id)
  }

  private rowToAsset(row: any) {
    return {
      id: row.id,
      folderId: row.folder_id,
      type: row.type,
      path: row.path,
      metadata: {
        filename: row.filename,
        mimeType: row.mime_type,
        size: row.size,
        checksum: row.checksum,
        hash: row.hash,
        dimensions: row.dimensions ? JSON.parse(row.dimensions) : undefined,
        duration: row.duration,
        fps: row.fps,
        codec: row.codec,
        createdDate: row.created_date,
        modifiedDate: row.modified_date,
        author: row.author,
        sourceProvider: row.source_provider,
        workflowId: row.workflow_id,
        executionId: row.execution_id,
        tags: row.tags ? JSON.parse(row.tags) : [],
        customMetadata: row.custom_metadata ? JSON.parse(row.custom_metadata) : undefined
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}
