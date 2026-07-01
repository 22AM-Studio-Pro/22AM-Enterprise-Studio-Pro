# Workflow Engine Architecture

This document provides a high-level overview of the workflow engine architecture.

Components
- Validator: AJV-based JSON Schema validator
- Engine: Execution runtime, supports node types and context propagation
- Persistence: SQLite-backed persistence, migrations and snapshots
- Handlers: Task handlers are registered via DI; built-in examples are provided
- Observability: Events emitted for workflow/node lifecycle transitions

Execution flow
1. Workflow is validated and persisted
2. runWorkflow schedules execution (queued if concurrency limit reached)
3. Engine executes nodes sequentially or in parallel, persisting node records after each node
4. Snapshots are written before and after nodes for crash recovery
5. Metrics are recorded for execution/node duration and retry counts
6. On completion/failure/cancel the execution state is updated and events emitted
