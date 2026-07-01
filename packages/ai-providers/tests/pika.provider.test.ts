import { describe, it, expect } from 'vitest'
import { PikaProvider } from '../../../src/providers/pika/PikaProvider'
import { CredentialManager } from '../../../src/CredentialManager'

(globalThis as any).fetch = async (url: string, init?: any) => {
  if (url.includes('/models')) {
    return {
      status: 200,
      json: async () => ({ models: [{ id: 'default', name: 'Pika Default' }] })
    }
  }
  if (url.includes('/generate')) {
    return {
      status: 200,
      json: async () => ({ id: 'gen-456', status: 'processing', output: null })
    }
  }
  return { status: 200, json: async () => ({}) }
}

describe('PikaProvider (unit)', () => {
  it('initializes and generates video', async () => {
    const cm = new CredentialManager()
    cm.saveCredential('pika', 'apiKey', 'sk-test')
    const p = new PikaProvider(undefined, cm)
    await p.initialize({})
    const res = await p.generate('animated scene')
    expect(res).toHaveProperty('generationId')
    expect(res).toHaveProperty('status')
  })

  it('polls generation status', async () => {
    const cm = new CredentialManager()
    cm.saveCredential('pika', 'apiKey', 'sk-test')
    const p = new PikaProvider(undefined, cm)
    await p.initialize({})
    const result = await p.generate('video')
    const gen = await p.pollGeneration(result.generationId)
    expect(gen).toBeDefined()
    expect(gen?.status).toBeDefined()
  })

  it('supports cancellation', async () => {
    const cm = new CredentialManager()
    cm.saveCredential('pika', 'apiKey', 'sk-test')
    const p = new PikaProvider(undefined, cm)
    await p.initialize({})
    const chunks: any[] = []
    const s = await p.stream('video', (c: any) => { chunks.push(c) })
    await new Promise((r) => setTimeout(r, 60))
    s.cancel()
    expect(chunks.length).toBeGreaterThan(0)
  })
})
