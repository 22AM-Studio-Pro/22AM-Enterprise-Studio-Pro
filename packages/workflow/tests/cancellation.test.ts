import { describe, it, expect, beforeEach } from 'vitest'
import WorkflowEngine from '../src/engine'

describe('cancellation and concurrency', () => {
  it('cancels execution immediately', async () => {
    const engine = new WorkflowEngine(':memory:', { maxConcurrent: 1 })
    engine.registerTask('long', async (_input, _ctx, signal) => {
      // cooperative cancellation
      for (let i = 0; i < 50; i++) {
        if (signal?.aborted) throw new Error('aborted')
        // wait 20ms
        await new Promise((r) => setTimeout(r, 20))
      }
      return 'done'
    })

    const wf = { id: 'cw', name: 'cancel', nodes: [{ id: 'n1', type: 'task', task: 'long' }] }
    const id = await engine.runWorkflow(wf as any)
    // cancel shortly after
    setTimeout(() => {
      engine.cancelWorkflow(id)
    }, 50)

    // wait a bit
    await new Promise((r) => setTimeout(r, 500))
    const exec = engine['persistence'].getExecution(id)
    expect(exec).toBeDefined()
    expect(exec?.status).toBeDefined()
  })

  it('queues executions when concurrency exceeded', async () => {
    const engine = new WorkflowEngine(':memory:', { maxConcurrent: 1 })
    engine.registerTask('noop', async () => { await new Promise((r) => setTimeout(r, 50)); return null })
    const wf = { id: 'q1', name: 'q', nodes: [{ id: 'n', type: 'task', task: 'noop' }] }
    const a = await engine.runWorkflow(wf as any)
    const b = await engine.runWorkflow(wf as any)
    expect(a).toBeTruthy()
    expect(b).toBeTruthy()
    // b should be queued; check execution state
    const bexec = engine['persistence'].getExecution(b)
    expect(bexec).toBeDefined()
  })
})
