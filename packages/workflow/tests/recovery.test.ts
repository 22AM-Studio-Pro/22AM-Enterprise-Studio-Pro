import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { Persistence } from '../src/persistence'
import WorkflowEngine from '../src/engine'

describe('crash recovery', () => {
  it('marks running executions as failed on startup and preserves snapshot', async () => {
    const dbPath = path.resolve(__dirname, 'test-data', 'recovery.db')
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)

    // create persistence and fake a running execution with a snapshot
    const p = new Persistence(dbPath)
    p.createExecution({ id: 'ex1', workflowId: 'w1', status: 'running', createdAt: new Date().toISOString() })
    p.saveExecutionSnapshot('ex1', { node: 'n1', variables: { x: 1 } })

    // instantiate engine which runs recovery in constructor
    const eng = new WorkflowEngine(dbPath, { maxConcurrent: 1 })

    // allow async recovery to complete
    await new Promise((r) => setTimeout(r, 200))

    const exec = p.getExecution('ex1')
    expect(exec).toBeDefined()
    expect(exec?.status).toBe('failed')

    const snap = p.getLastSnapshot('ex1')
    expect(snap).toBeDefined()
    expect((snap as any).node).toBe('n1')
  })
})
