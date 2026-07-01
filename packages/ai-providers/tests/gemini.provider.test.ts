import { describe, it, expect } from 'vitest'
import { GeminiProvider } from '../../../src/providers/gemini/GeminiProvider'
import { CredentialManager } from '../../../src/CredentialManager'

// Mock global fetch
(globalThis as any).fetch = async (url: string, init?: any) => {
  return {
    status: 200,
    json: async () => ({ output: [{ text: 'gemini mock response' }] })
  }
}

describe('GeminiProvider (unit)', () => {
  it('initializes and generates text', async () => {
    const cm = new CredentialManager()
    cm.saveCredential('gemini', 'apiKey', 'sk-test')
    const p = new GeminiProvider(undefined, cm)
    await p.initialize({})
    const r = await p.generate('hello')
    expect(r).toContain('gemini mock response')
  })

  it('streams and supports cancellation', async () => {
    const cm = new CredentialManager()
    cm.saveCredential('gemini', 'apiKey', 'sk-test')
    const p = new GeminiProvider(undefined, cm)
    await p.initialize({})
    const chunks: string[] = []
    const s = await p.stream('longish text', (c: any) => { if (c.type === 'text') chunks.push(c.payload) })
    await new Promise((r) => setTimeout(r, 60))
    s.cancel()
    expect(chunks.length).toBeGreaterThan(0)
  })
})
