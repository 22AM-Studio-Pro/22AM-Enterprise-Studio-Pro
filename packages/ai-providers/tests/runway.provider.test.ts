import { describe, it, expect } from 'vitest'
import { RunwayProvider } from '../../../src/providers/runway/RunwayProvider'
import { CredentialManager } from '../../../src/CredentialManager'

(globalThis as any).fetch = async (url: string, init?: any) => {
  if (url.includes('/models')) {
    return {
      status: 200,
      json: async () => ({ models: [{ id: 'gen3', name: 'Gen-3' }] })
    }
  }
  if (url.includes('/tasks')) {
    return {
      status: 200,
      json: async () => ({ id: 'task-123', status: 'processing', output: null })
    }
  }
  return { status: 200, json: async () => ({}) }
}

describe('RunwayProvider (unit)', () => {
  it('initializes and generates video task', async () => {
    const cm = new CredentialManager()
    cm.saveCredential('runway', 'apiKey', 'sk-test')
    const p = new RunwayProvider(undefined, cm)
    await p.initialize({})
    const res = await p.generate('cinematic scene')
    expect(res).toHaveProperty('taskId')
    expect(res).toHaveProperty('status')
  })

  it('polls task status', async () => {
    const cm = new CredentialManager()
    cm.saveCredential('runway', 'apiKey', 'sk-test')
    const p = new RunwayProvider(undefined, cm)
    await p.initialize({})
    const result = await p.generate('video')
    const task = await p.pollTask(result.taskId)
    expect(task).toBeDefined()
    expect(task?.status).toBeDefined()
  })

  it('supports cancellation', async () => {
    const cm = new CredentialManager()
    cm.saveCredential('runway', 'apiKey', 'sk-test')
    const p = new RunwayProvider(undefined, cm)
    await p.initialize({})
    const chunks: any[] = []
    const s = await p.stream('video', (c: any) => { chunks.push(c) })
    await new Promise((r) => setTimeout(r, 50))
    s.cancel()
    expect(chunks.length).toBeGreaterThan(0)
  })
})
