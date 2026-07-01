import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs-extra'
import { PipelineDefinition, PipelineExecution } from './PipelineTypes'

export class PipelinePersistence {
  private db: Database.Database

  constructor(dbPath?: string) {
    const base = dbPath ?? path.resolve(process.cwd(), 'packages/content-pipeline/data/pipeline.db')
    fs.ensureDirSync(path.dirname(base))
    this.db = new Database(base)
    this.init()
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pipeline_definitions (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        definition TEXT,
        created_at TEXT,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS pipeline_executions (
        id TEXT PRIMARY KEY,
        pipeline_id TEXT,
        state TEXT,
        started_at TEXT,
        completed_at TEXT,
        duration INTEGER,
        stage_executions TEXT,
        variables TEXT,
        checkpoint_id TEXT,
        error TEXT,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS pipeline_checkpoints (
        id TEXT PRIMARY KEY,
        execution_id TEXT,
        stage_id TEXT,
        context TEXT,
        created_at TEXT,
        FOREIGN KEY(execution_id) REFERENCES pipeline_executions(id)
      );
      CREATE TABLE IF NOT EXISTS pipeline_metrics (
        execution_id TEXT PRIMARY KEY,
        pipeline_id TEXT,
        total_duration INTEGER,
        stage_durations TEXT,
        retries INTEGER,
        failures INTEGER,
        providers_used TEXT,
        token_usage TEXT,
        estimated_cost REAL,
        asset_count INTEGER,
        started_at TEXT,
        completed_at TEXT
      );
    `)
  }

  savePipelineDefinition(pipeline: PipelineDefinition) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO pipeline_definitions (id, name, description, definition, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    const now = new Date().toISOString()
    stmt.run(pipeline.id, pipeline.name, pipeline.description ?? '', JSON.stringify(pipeline), now, now)
  }

  getPipelineDefinition(id: string): PipelineDefinition | undefined {
    const stmt = this.db.prepare('SELECT definition FROM pipeline_definitions WHERE id = ?')
    const row = stmt.get(id) as any
    return row ? JSON.parse(row.definition) : undefined
  }

  saveExecution(execution: PipelineExecution) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO pipeline_executions 
      (id, pipeline_id, state, started_at, completed_at, duration, stage_executions, variables, checkpoint_id, error, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const stageExecs = Array.from(execution.stageExecutions.entries())
    stmt.run(
      execution.id,
      execution.pipelineId,
      execution.state,
      execution.startedAt ?? null,
      execution.completedAt ?? null,
      execution.duration ?? null,
      JSON.stringify(stageExecs),
      JSON.stringify(execution.variables),
      execution.checkpointId ?? null,
      execution.error ?? null,
      execution.createdAt
    )
  }

  getExecution(id: string): PipelineExecution | undefined {
    const stmt = this.db.prepare('SELECT * FROM pipeline_executions WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return undefined
    return {
      id: row.id,
      pipelineId: row.pipeline_id,
      state: row.state,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      duration: row.duration,
      stageExecutions: new Map(JSON.parse(row.stage_executions)),
      variables: JSON.parse(row.variables),
      checkpointId: row.checkpoint_id,
      error: row.error,
      createdAt: row.created_at
    }
  }
}
