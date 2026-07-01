import { describe, it, expect } from 'vitest'
import { OpenAIProvider } from '../../src/providers/openai/OpenAIProvider'
import { CredentialManager } from '../../src/CredentialManager'

// Mock global fetch for OpenAIClient
(globalThis as any).fetch = async (url: string, init?: any) => {
  return {
    status: 200,
    json: async () => ({ choices: [{ message: { content: 'mocked response' } }] })
  }
}

describe('OpenAIProvider (unit)', () => {
  it('initializes from credential manager and validates config', async () => {
    const cm = new CredentialManager()
    cm.saveCredential('openai', 'apiKey', 'sk-test')
    const p = new OpenAIProvider(undefined, cm)
    await p.initialize({})
    const res = await p.generate('hello')
    expect(res).toBe('mocked response')
  })

  it('streams text and supports cancellation', async () => {
    const cm = new CredentialManager()
    cm.saveCredential('openai', 'apiKey', 'sk-test')
    const p = new OpenAIProvider(undefined, cm)
    await p.initialize({})
    const chunks: string[] = []
    const s = await p.stream('long text', (c: any) => { if (c.type === 'text') chunks.push(c.payload) })
    // allow a moment
    await new Promise((r) => setTimeout(r, 50))
    s.cancel()
    expect(chunks.length).toBeGreaterThan(0)
  })
})
