import { AIProvider, ProviderInitializeOptions } from '../../AIProvider'
import { ProviderError } from '../../ProviderError'
import { OpenAIClient } from './OpenAIClient'
import { OpenAIConfig } from './OpenAIConfig'
import { OpenAIMapper, extractTextFromResponse, mapChatRequest } from './OpenAIMapper'
import { OpenAIStreaming } from './OpenAIStreaming'
import { RetryPolicy } from '../../RetryPolicy'
import { RateLimiter } from '../../RateLimiter'
import { ProviderConfig } from '../../ProviderConfig'
import { CredentialManager } from '../../CredentialManager'
import { HealthMonitor } from '../../HealthMonitor'

export class OpenAIProvider implements AIProvider {
  name = 'openai'
  private config: OpenAIConfig
  private client?: OpenAIClient
  private apiKey?: string
  private retry: RetryPolicy
  private limiter: RateLimiter
  private healthMonitor: HealthMonitor
  private credentialManager: CredentialManager

  constructor(cfg?: OpenAIConfig, credentialManager?: CredentialManager) {
    this.config = cfg ?? {}
    this.retry = new RetryPolicy()
    this.limiter = new RateLimiter(20, 1000)
    this.healthMonitor = new HealthMonitor()
    this.credentialManager = credentialManager ?? new CredentialManager()
  }

  async initialize(options: ProviderInitializeOptions) {
    // load api key from options or credential manager
    if (options?.apiKey) this.apiKey = options.apiKey
    else this.apiKey = this.credentialManager.getCredential('openai', 'apiKey')
    if (!this.apiKey) throw new ProviderError('missing api key', 'auth')
    this.client = new OpenAIClient(this.config, undefined, this.retry)
  }

  async shutdown() {
    // no-op for now
    return
  }

  async health() {
    if (!this.client || !this.apiKey) return { ok: false, status: 'not-initialized' }
    const h = new (await import('./OpenAIHealth')).OpenAIHealth(this.client, this.apiKey, this.healthMonitor, this.config)
    return h.check()
  }

  async generate(prompt: string, options?: Record<string, unknown>) {
    if (!this.client || !this.apiKey) throw new ProviderError('not initialized', 'not_initialized')
    await this.limiter.acquire()
    try {
      const body = mapChatRequest(prompt, this.config.model)
      const resp = await this.client.post('/chat/completions', this.apiKey, body)
      return extractTextFromResponse(resp)
    } catch (e: any) {
      // normalize errors
      throw new ProviderError(e.message || 'openai error', e.code || 'openai_error')
    }
  }

  async stream(prompt: string, onData: (chunk: any) => void, options?: Record<string, unknown>) {
    if (!this.apiKey) throw new ProviderError('not initialized', 'not_initialized')
    // For production we'd open an SSE or streaming response; here use the streaming adapter stub
    const streaming = new OpenAIStreaming(this.config.apiBaseUrl ?? 'https://api.openai.com/v1', this.apiKey, (globalThis.fetch as unknown as any))
    return streaming.streamText(prompt, onData)
  }

  async cancel(requestId: string) {
    // cancellation is a no-op for now in this stubbed provider
    return
  }

  async validateConfiguration(config: ProviderConfig) {
    if (!config.apiKey && !this.credentialManager.getCredential('openai', 'apiKey')) throw new ProviderError('apiKey missing', 'validation')
    return
  }
}
