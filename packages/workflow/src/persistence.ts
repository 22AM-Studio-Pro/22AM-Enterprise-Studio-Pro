import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs-extra'
import { WorkflowExecution, NodeExecutionRecord } from './types'
import migrations from './migrations'

export class Persistence {
  private db: Database.Database
  private migrationsRan: number = 0

  constructor(dbPath?: string) {
    const envPath = process.env.WORKFLOW_DB_PATH
    const base = dbPath ?? envPath ?? path.resolve(process.cwd(), 'packages/workflow/data/workflow.db')
    fs.ensureDirSync(path.dirname(base))
    this.db = new Database(base)
    this.init()
    this.runMigrations()
  }

  private init() {
    // create schema_version if needed
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_version (
        id INTEGER PRIMARY KEY,
        version INTEGER NOT NULL,
        applied_at TEXT NOT NULL
      );
    `)
  }

  private runMigrations() {
    // find current version
    const row = this.db.prepare('SELECT version FROM schema_version ORDER BY id DESC LIMIT 1').get()
    const current = row ? Number(row.version) : 0
    const toApply = migrations.filter((m) => m.id > current).sort((a, b) => a.id - b.id)
    if (toApply.length === 0) {
      this.migrationsRan = current
      return
    }

    const txn = this.db.transaction((ms: typeof toApply) => {
      for (const m of ms) {
        for (const s of m.up) {
          this.db.exec(s)
        }
        this.db.prepare('INSERT INTO schema_version (version, applied_at) VALUES (?, ?)').run(m.id, new Date().toISOString())
      }
    })

    txn(toApply)
    this.migrationsRan = toApply[toApply.length - 1].id
  }

  // rollback last migration where practical
  rollbackLast() {
    const row = this.db.prepare('SELECT id, version FROM schema_version ORDER BY id DESC LIMIT 1').get()
    if (!row) return
    const latest = row.version as number
    const migration = migrations.find((m) => m.id === latest)
    if (!migration || !migration.down) throw new Error('no rollback available')

    const txn = this.db.transaction(() => {
      for (const s of migration.down!) {
        this.db.exec(s)
      }
      this.db.prepare('DELETE FROM schema_version WHERE version = ?').run(latest)
    })
    txn()
  }

  // executions
  createExecution(e: WorkflowExecution) {
    const stmt = this.db.prepare('INSERT INTO executions (id, workflow_id, status, created_at, updated_at, checkpoint) VALUES (?, ?, ?, ?, ?, ?)')
    stmt.run(e.id, e.workflowId, e.status, e.createdAt, e.updatedAt ?? null, null)
  }

  updateExecution(id: string, status: string, checkpoint?: Record<string, unknown>) {
    const stmt = this.db.prepare('UPDATE executions SET status = ?, updated_at = ?, checkpoint = ? WHERE id = ?')
    const checkpointStr = checkpoint ? JSON.stringify(checkpoint) : null
    stmt.run(status, new Date().toISOString(), checkpointStr, id)
  }

  getExecution(id: string): WorkflowExecution | undefined {
    const row = this.db.prepare('SELECT id, workflow_id as workflowId, status, created_at as createdAt, updated_at as updatedAt FROM executions WHERE id = ?').get(id)
    return row as WorkflowExecution | undefined
  }

  listExecutions(limit = 50): WorkflowExecution[] {
    const rows = this.db.prepare('SELECT id, workflow_id as workflowId, status, created_at as createdAt, updated_at as updatedAt FROM executions ORDER BY created_at DESC LIMIT ?').all(limit)
    return rows as WorkflowExecution[]
  }

  // node records
  insertNodeRecord(r: NodeExecutionRecord) {
    const stmt = this.db.prepare('INSERT INTO node_executions (execution_id, node_id, node_type, status, started_at, finished_at, result, error, retry_count, node_duration_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const result = r.result ? JSON.stringify(r.result) : null
    stmt.run(r.executionId, r.nodeId, r.nodeType, r.status, r.startedAt ?? null, r.finishedAt ?? null, result, r.error ?? null, (r as any).retryCount ?? 0, (r as any).durationMs ?? null)
  }

  listNodeRecords(executionId: string): NodeExecutionRecord[] {
    const stmt = this.db.prepare('SELECT execution_id as executionId, node_id as nodeId, node_type as nodeType, status, started_at as startedAt, finished_at as finishedAt, result, error FROM node_executions WHERE execution_id = ? ORDER BY id ASC')
    const rows = stmt.all(executionId)
    return rows.map((r: any) => ({ ...r, result: r.result ? JSON.parse(r.result) : undefined }))
  }

  // snapshots persisted for crash recovery
  saveExecutionSnapshot(executionId: string, snapshot: Record<string, unknown>) {
    const stmt = this.db.prepare('INSERT INTO execution_snapshots (execution_id, snapshot, created_at) VALUES (?, ?, ?)')
    stmt.run(executionId, JSON.stringify(snapshot), new Date().toISOString())
  }

  getLastSnapshot(executionId: string): Record<string, unknown> | undefined {
    const row = this.db.prepare('SELECT snapshot FROM execution_snapshots WHERE execution_id = ? ORDER BY id DESC LIMIT 1').get(executionId)
    if (!row) return undefined
    return JSON.parse(row.snapshot)
  }

  // locking to prevent simultaneous execution
  tryAcquireExecutionLock(executionId: string): boolean {
    const info = this.db.prepare('SELECT locked FROM executions WHERE id = ?').get(executionId)
    if (!info) return false
    if (info.locked) return false
    this.db.prepare('UPDATE executions SET locked = 1 WHERE id = ?').run(executionId)
    return true
  }

  releaseExecutionLock(executionId: string) {
    this.db.prepare('UPDATE executions SET locked = 0 WHERE id = ?').run(executionId)
  }

  // workflow persistence and versioning
  saveWorkflow(doc: any) {
    const checksum = this.computeChecksum(doc)
    const now = new Date().toISOString()
    const stmt = this.db.prepare('INSERT INTO workflows (id, version, name, description, body, checksum, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    stmt.run(doc.id, doc.version ?? '1.0.0', doc.name, doc.description ?? null, JSON.stringify(doc), checksum, now, now)
  }

  getWorkflow(id: string) {
    const row = this.db.prepare('SELECT id, version, name, description, body, checksum, created_at as createdAt, updated_at as updatedAt FROM workflows WHERE id = ?').get(id)
    if (!row) return undefined
    const wf = JSON.parse(row.body)
    wf.version = row.version
    return wf
  }

  listWorkflows(limit = 50) {
    const rows = this.db.prepare('SELECT id, version, name, description, checksum, created_at as createdAt, updated_at as updatedAt FROM workflows ORDER BY updated_at DESC LIMIT ?').all(limit)
    return rows
  }

  deleteWorkflow(id: string) {
    this.db.prepare('DELETE FROM workflows WHERE id = ?').run(id)
  }

  computeChecksum(doc: any): string {
    // simple checksum using JSON stable stringify
    const s = JSON.stringify(doc)
    let h = 0
    for (let i = 0; i < s.length; i++) {
      // simple hash
      h = (h << 5) - h + s.charCodeAt(i)
      h |= 0
    }
    return h.toString()
  }
}
