import { StreamingAdapter, StreamChunk } from '../../StreamingAdapter'
import { HttpClient } from './ElevenLabsClient'

export class ElevenLabsStreaming implements StreamingAdapter {
  private http: HttpClient
  private base: string
  private apiKey: string
  private voiceId: string

  constructor(base: string, apiKey: string, voiceId: string, http: HttpClient) {
    this.base = base
    this.apiKey = apiKey
    this.voiceId = voiceId
    this.http = http
  }

  async streamText(text: string, onChunk: (chunk: StreamChunk) => void) {
    let cancelled = false
    const cancel = () => { cancelled = true }
    // Simulate audio streaming by chunking audio bytes
    (async () => {
      for (let i = 0; i < 5; i++) {
        if (cancelled) break
        await new Promise((r) => setTimeout(r, 10))
        // Emit simulated audio chunk
        const audioChunk = new Uint8Array(64).fill(i)
        onChunk({ type: 'audio', payload: audioChunk })
      }
      if (!cancelled) onChunk({ type: 'audio', payload: null }) // end marker
    })()
    return { cancel }
  }
}
