export type RunwayTask = {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  output?: any
  error?: string
}

export function mapVideoGenerationRequest(prompt: string, model?: string, duration?: number) {
  return {
    task_type: 'video_generation',
    model: model ?? 'gen3',
    prompt,
    duration: duration ?? 16,
    fps: 24
  }
}

export function extractTaskFromResponse(resp: any): RunwayTask {
  return {
    id: resp.id || resp.task_id,
    status: resp.status || 'processing',
    output: resp.output,
    error: resp.error
  }
}
