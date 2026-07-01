import { StreamingAdapter, StreamChunk } from '../../StreamingAdapter'
import { HttpClient } from './OpenAIClient'

export class OpenAIStreaming implements StreamingAdapter {
  private http: HttpClient
  private base: string
  private apiKey: string

  constructor(base: string, apiKey: string, http: HttpClient) {
    this.base = base
    this.apiKey = apiKey
    this.http = http
  }

  async streamText(prompt: string, onChunk: (chunk: StreamChunk) => void) {
    // For CI and unit tests we simulate streaming via chunked onChunk calls.
    let cancelled = false
    const cancel = () => { cancelled = true }
    // simulate streaming
    const parts = (`${prompt}`).match(/.{1,40}/g) || [prompt]
    (async () => {
      for (const p of parts) {
        if (cancelled) break
        await new Promise((r) => setTimeout(r, 5))
        onChunk({ type: 'text', payload: p })
      }
      if (!cancelled) onChunk({ type: 'text', payload: '[DONE]' })
    })()
    return { cancel }
  }
}
