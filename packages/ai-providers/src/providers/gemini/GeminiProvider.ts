import { AIProvider, ProviderInitializeOptions } from '../../AIProvider'
import { ProviderError } from '../../ProviderError'
import { GeminiClient } from './GeminiClient'
import { GeminiConfig } from './GeminiConfig'
import { mapTextRequest, extractTextFromResponse } from './GeminiMapper'
import { GeminiStreaming } from './GeminiStreaming'
import { RetryPolicy } from '../../RetryPolicy'
import { RateLimiter } from '../../RateLimiter'
import { CredentialManager } from '../../CredentialManager'
import { HealthMonitor } from '../../HealthMonitor'

export class GeminiProvider implements AIProvider {
  name = 'gemini'
  private config: GeminiConfig
  private client?: GeminiClient
  private apiKey?: string
  private retry: RetryPolicy
  private limiter: RateLimiter
  private healthMonitor: HealthMonitor
  private credentialManager: CredentialManager

  capabilities = {
    supportsChat: true,
    supportsStreaming: true,
    supportsImages: false,
    supportsAudio: false,
    supportsEmbeddings: false
  }

  constructor(cfg?: GeminiConfig, credentialManager?: CredentialManager) {
    this.config = cfg ?? {}
    this.retry = new RetryPolicy()
    this.limiter = new RateLimiter(15, 1000)
    this.healthMonitor = new HealthMonitor()
    this.credentialManager = credentialManager ?? new CredentialManager()
  }

  async initialize(options: ProviderInitializeOptions) {
    if (options?.apiKey) this.apiKey = options.apiKey
    else this.apiKey = this.credentialManager.getCredential('gemini', 'apiKey')
    if (!this.apiKey) throw new ProviderError('missing api key', 'auth')
    this.client = new GeminiClient(this.config, undefined, this.retry)
  }

  async shutdown() { return }

  async health() {
    if (!this.client || !this.apiKey) return { ok: false, status: 'not-initialized' }
    const h = new (await import('./GeminiHealth')).GeminiHealth(this.client, this.apiKey, this.healthMonitor, this.config)
    return h.check()
  }

  async generate(prompt: string, options?: Record<string, unknown>) {
    if (!this.client || !this.apiKey) throw new ProviderError('not initialized', 'not_initialized')
    await this.limiter.acquire()
    try {
      const body = mapTextRequest(prompt, this.config.model)
      const resp = await this.client.post('/completions', this.apiKey, body)
      return extractTextFromResponse(resp)
    } catch (e: any) {
      throw new ProviderError(e.message || 'gemini error', e.code || 'gemini_error')
    }
  }

  async stream(prompt: string, onData: (chunk: any) => void, options?: Record<string, unknown>) {
    if (!this.apiKey) throw new ProviderError('not initialized', 'not_initialized')
    const streaming = new GeminiStreaming(this.config.apiBaseUrl ?? 'https://api.gemini.example/v1', this.apiKey, (globalThis.fetch as unknown as any))
    return streaming.streamText(prompt, onData)
  }

  async cancel(requestId: string) { return }

  async validateConfiguration(config: Record<string, unknown>) {
    if (!(config && (config as any).apiKey) && !this.credentialManager.getCredential('gemini', 'apiKey')) throw new ProviderError('apiKey missing', 'validation')
    return
  }
}
