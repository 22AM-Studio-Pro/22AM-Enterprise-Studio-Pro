export type PikaGeneration = {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  output?: string
  error?: string
}

export function mapVideoGenerationRequest(prompt: string, model?: string, duration?: number) {
  return {
    prompt,
    model: model ?? 'default',
    duration: duration ?? 4,
    fps: 24
  }
}

export function extractGenerationFromResponse(resp: any): PikaGeneration {
  return {
    id: resp.id || resp.generation_id,
    status: resp.status || 'processing',
    output: resp.output || resp.video_url,
    error: resp.error
  }
}
