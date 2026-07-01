# @22am/workflow

This package implements the Workflow Engine used by 22AM Enterprise Studio Pro.

Overview
- Validates workflows against JSON Schema
- Persists workflows and execution history to SQLite
- Supports sequential, parallel, conditional, loop, delay and retry nodes
- Dependency injection for task handlers (echo, delay, fileRead, fileWrite, httpRequest examples provided)
- Migrations, snapshots, metrics, concurrency control, cancellation and observability events

Configuration
- WORKFLOW_DB_PATH environment variable overrides the default DB path:
  packages/workflow/data/workflow.db

Testing
- Unit and integration tests are provided with Vitest. Run: pnpm --filter @22am/workflow run test

API
- WorkflowEngine class: registerTask, runWorkflow, pauseWorkflow, resumeWorkflow, cancelWorkflow
- Persistence APIs: listExecutions, getExecution, listNodeRecords

Documentation
- See docs/ for architecture, sequence diagrams and workflow JSON specification.
