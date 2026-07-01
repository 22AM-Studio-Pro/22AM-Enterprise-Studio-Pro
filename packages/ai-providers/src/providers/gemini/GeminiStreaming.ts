import { StreamingAdapter, StreamChunk } from '../../StreamingAdapter'
import { HttpClient } from './GeminiClient'

export class GeminiStreaming implements StreamingAdapter {
  private http: HttpClient
  private base: string
  private apiKey: string

  constructor(base: string, apiKey: string, http: HttpClient) {
    this.base = base
    this.apiKey = apiKey
    this.http = http
  }

  async streamText(prompt: string, onChunk: (chunk: StreamChunk) => void) {
    let cancelled = false
    const cancel = () => { cancelled = true }
    const parts = (`${prompt}`).match(/.{1,50}/g) || [prompt]
    (async () => {
      for (const p of parts) {
        if (cancelled) break
        await new Promise((r) => setTimeout(r, 6))
        onChunk({ type: 'text', payload: p })
      }
      if (!cancelled) onChunk({ type: 'text', payload: '[DONE]' })
    })()
    return { cancel }
  }
}
