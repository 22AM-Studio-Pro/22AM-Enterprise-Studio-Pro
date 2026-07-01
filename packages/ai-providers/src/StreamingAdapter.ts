export type StreamChunk = { type: 'text' | 'audio' | 'binary'; payload: any }

export interface StreamingAdapter {
  streamText(prompt: string, onChunk: (chunk: StreamChunk) => void): Promise<{ cancel: () => void }>
}
