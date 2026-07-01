import { describe, it, expect } from 'vitest'
import { ElevenLabsProvider } from '../../../src/providers/elevenlabs/ElevenLabsProvider'
import { CredentialManager } from '../../../src/CredentialManager'

(globalThis as any).fetch = async (url: string, init?: any) => {
  if (url.includes('/voices')) {
    return {
      status: 200,
      json: async () => ({ voices: [{ voice_id: 'voice1', name: 'Adam' }] })
    }
  }
  return { status: 200, json: async () => ({}) }
}

describe('ElevenLabsProvider (unit)', () => {
  it('initializes and loads voices', async () => {
    const cm = new CredentialManager()
    cm.saveCredential('elevenlabs', 'apiKey', 'sk-test')
    const p = new ElevenLabsProvider(undefined, cm)
    await p.initialize({})
    const voices = p.getVoices()
    expect(voices.length).toBeGreaterThan(0)
  })

  it('generates TTS audio', async () => {
    const cm = new CredentialManager()
    cm.saveCredential('elevenlabs', 'apiKey', 'sk-test')
    const p = new ElevenLabsProvider(undefined, cm)
    await p.initialize({})
    const res = await p.generate('hello world')
    expect(res).toHaveProperty('type', 'audio')
  })

  it('streams audio and supports cancellation', async () => {
    const cm = new CredentialManager()
    cm.saveCredential('elevenlabs', 'apiKey', 'sk-test')
    const p = new ElevenLabsProvider(undefined, cm)
    await p.initialize({})
    const chunks: any[] = []
    const s = await p.stream('test audio', (c: any) => { chunks.push(c) })
    await new Promise((r) => setTimeout(r, 60))
    s.cancel()
    expect(chunks.length).toBeGreaterThan(0)
  })
})
