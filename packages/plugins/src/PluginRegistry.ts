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
    // Use migrations approach when available; for now create extended table if missing
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS plugins (
        id TEXT PRIMARY KEY,
        name TEXT,
        version TEXT,
        author TEXT,
        description TEXT,
        license TEXT,
        homepage TEXT,
        enabled INTEGER DEFAULT 0,
        path TEXT,
        manifest TEXT,
        permissions TEXT,
        dependencies TEXT,
        checksum TEXT,
        installed_at TEXT,
        updated_at TEXT,
        health TEXT,
        metrics TEXT,
        errors TEXT
      );
    `)
  }

  register(manifest: PluginManifest, pluginPath: string, enabled = false) {
    const now = new Date().toISOString()
    const stmt = this.db.prepare('INSERT OR REPLACE INTO plugins (id, name, version, author, description, license, homepage, enabled, path, manifest, permissions, dependencies, checksum, installed_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const perms = manifest.permissions ? JSON.stringify(manifest.permissions) : null
    const deps = manifest.dependencies ? JSON.stringify(manifest.dependencies) : null
    const checksum = this.computeChecksum(manifest)
    stmt.run(manifest.id, manifest.name, manifest.version, manifest.author ?? null, manifest.description ?? null, manifest.license ?? null, manifest.homepage ?? null, enabled ? 1 : 0, pluginPath, JSON.stringify(manifest), perms, deps, checksum, now, now)
  }

  unregister(id: string) {
    this.db.prepare('DELETE FROM plugins WHERE id = ?').run(id)
  }

  list(): Array<{ id: string; name: string; version: string; enabled: boolean; path: string; updatedAt?: string }> {
    const rows = this.db.prepare('SELECT id, name, version, enabled, path, updated_at FROM plugins').all()
    return rows.map((r: any) => ({ id: r.id, name: r.name, version: r.version, enabled: !!r.enabled, path: r.path, updatedAt: r.updated_at }))
  }

  get(id: string) {
    const row = this.db.prepare('SELECT id, name, version, enabled, path, manifest, permissions, dependencies, checksum, installed_at, updated_at, health, metrics, errors FROM plugins WHERE id = ?').get(id)
    if (!row) return undefined
    return {
      id: row.id,
      name: row.name,
      version: row.version,
      enabled: !!row.enabled,
      path: row.path,
      manifest: JSON.parse(row.manifest),
      permissions: row.permissions ? JSON.parse(row.permissions) : [],
      dependencies: row.dependencies ? JSON.parse(row.dependencies) : {},
      checksum: row.checksum,
      installedAt: row.installed_at,
      updatedAt: row.updated_at,
      health: row.health ? JSON.parse(row.health) : undefined,
      metrics: row.metrics ? JSON.parse(row.metrics) : undefined,
      errors: row.errors ? JSON.parse(row.errors) : undefined
    }
  }

  setEnabled(id: string, enabled: boolean) {
    this.db.prepare('UPDATE plugins SET enabled = ?, updated_at = ? WHERE id = ?').run(enabled ? 1 : 0, new Date().toISOString(), id)
  }

  setPermissions(id: string, permissions: string[]) {
    this.db.prepare('UPDATE plugins SET permissions = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(permissions), new Date().toISOString(), id)
  }

  setDependencies(id: string, dependencies: Record<string, string>) {
    this.db.prepare('UPDATE plugins SET dependencies = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(dependencies), new Date().toISOString(), id)
  }

  setChecksum(id: string, checksum: string) {
    this.db.prepare('UPDATE plugins SET checksum = ?, updated_at = ? WHERE id = ?').run(checksum, new Date().toISOString(), id)
  }

  setHealth(id: string, health: Record<string, unknown>) {
    this.db.prepare('UPDATE plugins SET health = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(health), new Date().toISOString(), id)
  }

  appendMetric(id: string, metric: Record<string, unknown>) {
    const row = this.db.prepare('SELECT metrics FROM plugins WHERE id = ?').get(id)
    const existing = row && row.metrics ? JSON.parse(row.metrics) : []
    existing.push(metric)
    this.db.prepare('UPDATE plugins SET metrics = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(existing), new Date().toISOString(), id)
  }

  appendError(id: string, error: Record<string, unknown>) {
    const row = this.db.prepare('SELECT errors FROM plugins WHERE id = ?').get(id)
    const existing = row && row.errors ? JSON.parse(row.errors) : []
    existing.push(error)
    this.db.prepare('UPDATE plugins SET errors = ?, updated_at = ? WHERE id = ?').run(JSON.stringify(existing), new Date().toISOString(), id)
  }

  computeChecksum(doc: any): string {
    const s = JSON.stringify(doc)
    let h = 0
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i)
      h |= 0
    }
    return h.toString()
  }
}
