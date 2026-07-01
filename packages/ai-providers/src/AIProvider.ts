export type ProviderInitializeOptions = {
  apiKey?: string
  config?: Record<string, unknown>
}

export interface AIProvider {
  name: string
  initialize(options: ProviderInitializeOptions): Promise<void>
  shutdown(): Promise<void>
  health(): Promise<{ ok: boolean; status?: string; latencyMs?: number }>
  generate(prompt: string, options?: Record<string, unknown>): Promise<any>
  stream(prompt: string, onData: (chunk: any) => void, options?: Record<string, unknown>): Promise<{ cancel: () => void }>
  cancel(requestId: string): Promise<void>
  validateConfiguration?(config: Record<string, unknown>): Promise<void>
}
