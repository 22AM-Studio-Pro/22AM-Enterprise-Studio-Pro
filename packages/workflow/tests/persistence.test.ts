import { describe, it, expect } from 'vitest'
import { Persistence } from '../src/persistence'
import fs from 'fs'
import path from 'path'

describe('persistence migrations and snapshots', () => {
  it('runs migrations and creates db file', () => {
    const dbPath = path.resolve(__dirname, 'test-data', 'wf.db')
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
    const p = new Persistence(dbPath)
    expect(fs.existsSync(dbPath)).toBe(true)
  })

  it('saves and retrieves snapshots', () => {
    const dbPath = path.resolve(__dirname, 'test-data', 'wf2.db')
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
    const p = new Persistence(dbPath)
    p.createExecution({ id: 'e1', workflowId: 'w1', status: 'running', createdAt: new Date().toISOString() })
    p.saveExecutionSnapshot('e1', { node: 'n1', variables: { x: 1 } })
    const snap = p.getLastSnapshot('e1')
    expect(snap).toBeDefined()
    expect((snap as any).node).toBe('n1')
  })
})
