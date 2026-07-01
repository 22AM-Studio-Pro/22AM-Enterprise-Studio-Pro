// migrations/index.ts

const migrations = [
  {
    id: 1,
    up: [
      `
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        version TEXT,
        name TEXT NOT NULL,
        description TEXT,
        body TEXT NOT NULL,
        checksum TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS executions (
        id TEXT PRIMARY KEY,
        workflow_id TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        checkpoint TEXT,
        locked INTEGER DEFAULT 0
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
        error TEXT,
        retry_count INTEGER DEFAULT 0,
        node_duration_ms INTEGER
      );

      CREATE TABLE IF NOT EXISTS execution_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        execution_id TEXT NOT NULL,
        snapshot TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        execution_id TEXT NOT NULL,
        node_id TEXT,
        name TEXT NOT NULL,
        value TEXT,
        created_at TEXT NOT NULL
      );
      `
    ],
    down: [
      `DROP TABLE IF EXISTS metrics;`,
      `DROP TABLE IF EXISTS execution_snapshots;`,
      `DROP TABLE IF EXISTS node_executions;`,
      `DROP TABLE IF EXISTS executions;`,
      `DROP TABLE IF EXISTS workflows;`
    ]
  }
]

export default migrations
