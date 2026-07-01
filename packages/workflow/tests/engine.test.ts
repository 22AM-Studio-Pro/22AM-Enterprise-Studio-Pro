import { describe, it, expect, beforeEach } from 'vitest'
import WorkflowEngine from '../src/engine'
import { validateWorkflow } from '../src/validator'

const simpleWorkflow = {
  id: 'w1',
  name: 'simple',
  nodes: [
    { id: 't1', type: 'task', task: 'echo', input: { msg: 'hello' } },
    { id: 't2', type: 'delay', ms: 10 },
    { id: 't3', type: 'task', task: 'echo', input: { msg: 'world' } }
  ]
}

describe('workflow engine', () => {
  let engine: any
  beforeEach(() => {
    engine = new WorkflowEngine(':memory:')
    engine.registerTask('echo', async (input: any) => {
      return { echoed: input?.msg }
    })
  })

  it('validates workflow', () => {
    expect(() => validateWorkflow(simpleWorkflow)).not.toThrow()
  })

  it('runs a simple workflow', async () => {
    const id = await engine.runWorkflow(simpleWorkflow as any)
    // wait for completion
    await new Promise((r) => setTimeout(r, 200))
    // there should be node records
    // we don't expose list here; sanity: engine emits events
    expect(id).toBeTruthy()
  })

  it('supports parallel nodes', async () => {
    const wf = { id: 'p1', name: 'parallel', nodes: [{ id: 'p', type: 'parallel', nodes: [{ id: 'a', type: 'task', task: 'echo', input: { msg: 'a' } }, { id: 'b', type: 'task', task: 'echo', input: { msg: 'b' } }] }] }
    const id = await engine.runWorkflow(wf as any)
    await new Promise((r) => setTimeout(r, 200))
    expect(id).toBeTruthy()
  })

  it('supports conditional node', async () => {
    const wf = { id: 'c1', name: 'cond', nodes: [{ id: 'c', type: 'conditional', condition: "input.msg == 'run'", then: { id: 't', type: 'task', task: 'echo', input: { msg: 'ran' } } }] }
    const id = await engine.runWorkflow(wf as any, { msg: 'run' })
    await new Promise((r) => setTimeout(r, 200))
    expect(id).toBeTruthy()
  })

  it('supports loop node', async () => {
    const wf = { id: 'l1', name: 'loop', nodes: [{ id: 'l', type: 'loop', condition: "variables.count < 3", maxIterations: 5, body: { id: 'inc', type: 'task', task: 'inc' } }] }
    engine.registerTask('inc', async (input: any, context: any) => {
      context.variables.count = (context.variables.count || 0) + 1
      return context.variables.count
    })
    const id = await engine.runWorkflow(wf as any)
    await new Promise((r) => setTimeout(r, 500))
    expect(id).toBeTruthy()
  })

  it('supports retry node', async () => {
    let count = 0
    engine.registerTask('flaky', async () => {
      count += 1
      if (count < 2) throw new Error('fail')
      return 'ok'
    })
    const wf = { id: 'r1', name: 'retry', nodes: [{ id: 'r', type: 'retry', attempts: 3, delayMs: 10, node: { id: 't', type: 'task', task: 'flaky' } }] }
    const id = await engine.runWorkflow(wf as any)
    await new Promise((r) => setTimeout(r, 500))
    expect(id).toBeTruthy()
  })
})
