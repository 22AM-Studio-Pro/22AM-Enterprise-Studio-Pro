import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs-extra'
import { WorkflowExecution, NodeExecutionRecord } from './types'

export class Persistence {
  private db: Database.Database

  constructor(dbPath?: string) {
    const base = dbPath ?? path.resolve(process.cwd(), 'workflow.db')
    fs.ensureDirSync(path.dirname(base))
    this.db = new Database(base)
    this.init()
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS executions (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS node_executions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        execution_id TEXT NOT NULL,
        node_id TEXT NOT NULL,
        node_type TEXT NOT NULL,
        status TEXT NOT NULL,
        started_at TEXT,
        finished_at TEXT,
        result TEXT,
        error TEXT
      );
    `)
  }

  createExecution(e: WorkflowExecution) {
    const stmt = this.db.prepare('INSERT INTO executions (id, workflow_id, status, created_at) VALUES (?, ?, ?, ?)')
    stmt.run(e.id, e.workflowId, e.status, e.createdAt)
  }

  updateExecution(id: string, status: string) {
    const stmt = this.db.prepare('UPDATE executions SET status = ?, updated_at = ? WHERE id = ?')
    stmt.run(status, new Date().toISOString(), id)
  }

  insertNodeRecord(r: NodeExecutionRecord) {
    const stmt = this.db.prepare('INSERT INTO node_executions (execution_id, node_id, node_type, status, started_at, finished_at, result, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    stmt.run(r.executionId, r.nodeId, r.nodeType, r.status, r.startedAt ?? null, r.finishedAt ?? null, r.result ? JSON.stringify(r.result) : null, r.error ?? null)
  }

  listNodeRecords(executionId: string): NodeExecutionRecord[] {
    const stmt = this.db.prepare('SELECT execution_id as executionId, node_id as nodeId, node_type as nodeType, status, started_at as startedAt, finished_at as finishedAt, result, error FROM node_executions WHERE execution_id = ? ORDER BY id ASC')
    const rows = stmt.all(executionId)
    return rows.map((r: any) => ({ ...r, result: r.result ? JSON.parse(r.result) : undefined }))
  }
}
