import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs-extra'
import { PluginManifest } from './PluginManifest'

export class PluginRegistry {
  private db: Database.Database

  constructor(dbPath?: string) {
    const base = dbPath ?? path.resolve(process.cwd(), 'packages/plugins/data/plugins.db')
    fs.ensureDirSync(path.dirname(base))
    this.db = new Database(base)
    this.init()
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS plugins (
        id TEXT PRIMARY KEY,
        name TEXT,
        version TEXT,
        enabled INTEGER DEFAULT 0,
        path TEXT,
        manifest TEXT,
        installed_at TEXT
      );
    `)
  }

  register(manifest: PluginManifest, pluginPath: string, enabled = false) {
    const now = new Date().toISOString()
    const stmt = this.db.prepare('INSERT OR REPLACE INTO plugins (id, name, version, enabled, path, manifest, installed_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    stmt.run(manifest.id, manifest.name, manifest.version, enabled ? 1 : 0, pluginPath, JSON.stringify(manifest), now)
  }

  unregister(id: string) {
    this.db.prepare('DELETE FROM plugins WHERE id = ?').run(id)
  }

  list(): Array<{ id: string; name: string; version: string; enabled: boolean; path: string }> {
    const rows = this.db.prepare('SELECT id, name, version, enabled, path FROM plugins').all()
    return rows.map((r: any) => ({ id: r.id, name: r.name, version: r.version, enabled: !!r.enabled, path: r.path }))
  }

  get(id: string) {
    const row = this.db.prepare('SELECT id, name, version, enabled, path, manifest FROM plugins WHERE id = ?').get(id)
    if (!row) return undefined
    return { id: row.id, name: row.name, version: row.version, enabled: !!row.enabled, path: row.path, manifest: JSON.parse(row.manifest) as PluginManifest }
  }

  setEnabled(id: string, enabled: boolean) {
    this.db.prepare('UPDATE plugins SET enabled = ? WHERE id = ?').run(enabled ? 1 : 0, id)
  }
}
