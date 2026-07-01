import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs-extra'
import { PublishingContent, CredentialConfig } from './PublishingTypes'

export class PublishingPersistence {
  private db: Database.Database

  constructor(dbPath?: string) {
    const base = dbPath ?? path.resolve(process.cwd(), 'packages/publishing/data/publishing.db')
    fs.ensureDirSync(path.dirname(base))
    this.db = new Database(base)
    this.init()
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS publishing_jobs (
        id TEXT PRIMARY KEY,
        platform TEXT,
        title TEXT,
        description TEXT,
        status TEXT,
        scheduled_at TEXT,
        published_at TEXT,
        platform_id TEXT,
        url TEXT,
        retries INTEGER,
        error TEXT,
        content TEXT,
        created_at TEXT,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS publishing_schedules (
        id TEXT PRIMARY KEY,
        job_id TEXT,
        cron_expression TEXT,
        timezone TEXT,
        created_at TEXT,
        FOREIGN KEY(job_id) REFERENCES publishing_jobs(id)
      );
      CREATE TABLE IF NOT EXISTS publishing_attempts (
        id TEXT PRIMARY KEY,
        job_id TEXT,
        attempt_number INTEGER,
        status TEXT,
        error TEXT,
        attempted_at TEXT,
        FOREIGN KEY(job_id) REFERENCES publishing_jobs(id)
      );
      CREATE TABLE IF NOT EXISTS publishing_analytics (
        id TEXT PRIMARY KEY,
        platform_id TEXT,
        platform TEXT,
        views INTEGER,
        likes INTEGER,
        shares INTEGER,
        comments INTEGER,
        engagement REAL,
        reach INTEGER,
        impressions INTEGER,
        updated_at TEXT
      );
    `)
  }

  saveJob(content: PublishingContent) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO publishing_jobs
      (id, platform, title, description, status, scheduled_at, published_at, platform_id, url, retries, error, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const now = new Date().toISOString()
    stmt.run(
      content.id,
      content.platform,
      content.title ?? null,
      content.description ?? null,
      content.status,
      content.scheduledAt ?? null,
      content.publishedAt ?? null,
      content.platformId ?? null,
      content.url ?? null,
      content.retries,
      content.error ?? null,
      JSON.stringify(content),
      content.createdAt,
      now
    )
  }

  getJob(id: string): PublishingContent | undefined {
    const stmt = this.db.prepare('SELECT content FROM publishing_jobs WHERE id = ?')
    const row = stmt.get(id) as any
    return row ? JSON.parse(row.content) : undefined
  }

  listJobs(platform?: string, status?: string): PublishingContent[] {
    let query = 'SELECT content FROM publishing_jobs WHERE 1=1'
    const params: any[] = []
    if (platform) {
      query += ' AND platform = ?'
      params.push(platform)
    }
    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }
    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params) as any[]
    return rows.map((r) => JSON.parse(r.content))
  }
}
