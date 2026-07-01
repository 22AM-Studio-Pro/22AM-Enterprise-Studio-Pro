import { AIProvider, ProviderInitializeOptions } from '../../AIProvider'
import { ProviderError } from '../../ProviderError'
import { PikaClient } from './PikaClient'
import { PikaConfig } from './PikaConfig'
import { mapVideoGenerationRequest, extractGenerationFromResponse, PikaGeneration } from './PikaMapper'
import { RetryPolicy } from '../../RetryPolicy'
import { RateLimiter } from '../../RateLimiter'
import { CredentialManager } from '../../CredentialManager'
import { HealthMonitor } from '../../HealthMonitor'

export class PikaProvider implements AIProvider {
  name = 'pika'
  private config: PikaConfig
  private client?: PikaClient
  private apiKey?: string
  private retry: RetryPolicy
  private limiter: RateLimiter
  private healthMonitor: HealthMonitor
  private credentialManager: CredentialManager
  private generations: Map<string, PikaGeneration> = new Map()
  private cancellationTokens: Set<string> = new Set()

  capabilities = {
    supportsChat: false,
    supportsStreaming: false,
    supportsVideo: true,
    supportsImages: false,
    supportsPolling: true,
    supportsEmbeddings: false
  }

  constructor(cfg?: PikaConfig, credentialManager?: CredentialManager) {
    this.config = cfg ?? {}
    this.retry = new RetryPolicy()
    this.limiter = new RateLimiter(5, 1000)
    this.healthMonitor = new HealthMonitor()
    this.credentialManager = credentialManager ?? new CredentialManager()
  }

  async initialize(options: ProviderInitializeOptions) {
    if (options?.apiKey) this.apiKey = options.apiKey
    else this.apiKey = this.credentialManager.getCredential('pika', 'apiKey')
    if (!this.apiKey) throw new ProviderError('missing api key', 'auth')
    this.client = new PikaClient(this.config, undefined, this.retry)
  }

  async shutdown() { return }

  async health() {
    if (!this.client || !this.apiKey) return { ok: false, status: 'not-initialized' }
    const h = new (await import('./PikaHealth')).PikaHealth(this.client, this.apiKey, this.healthMonitor)
    return h.check()
  }

  async generate(prompt: string, options?: Record<string, unknown>) {
    if (!this.client || !this.apiKey) throw new ProviderError('not initialized', 'not_initialized')
    await this.limiter.acquire()
    try {
      const body = mapVideoGenerationRequest(prompt, this.config.model)
      const resp = await this.client.post('/generate', this.apiKey, body)
      const gen = extractGenerationFromResponse(resp)
      this.generations.set(gen.id, gen)
      return { generationId: gen.id, status: gen.status }
    } catch (e: any) {
      throw new ProviderError(e.message || 'pika error', e.code || 'pika_error')
    }
  }

  async stream(prompt: string, onData: (chunk: any) => void, options?: Record<string, unknown>) {
    // Pika does not support true streaming; poll for status
    const genId = `gen-${Date.now()}`
    const cancel = () => { this.cancellationTokens.add(genId) }
    (async () => {
      for (let i = 0; i < 8; i++) {
        if (this.cancellationTokens.has(genId)) break
        await new Promise((r) => setTimeout(r, 125))
        onData({ type: 'poll_update', status: i < 7 ? 'processing' : 'completed', progress: i * 12.5 })
      }
    })()
    return { cancel }
  }

  async cancel(requestId: string) {
    this.cancellationTokens.add(requestId)
    if (!this.client || !this.apiKey) return
    try {
      await this.client.post(`/generations/${requestId}/cancel`, this.apiKey, {})
    } catch (e) {
      // ignore cancellation errors
    }
  }

  async validateConfiguration(config: Record<string, unknown>) {
    if (!(config && (config as any).apiKey) && !this.credentialManager.getCredential('pika', 'apiKey')) throw new ProviderError('apiKey missing', 'validation')
    return
  }

  async pollGeneration(generationId: string): Promise<PikaGeneration | undefined> {
    if (!this.client || !this.apiKey) throw new ProviderError('not initialized', 'not_initialized')
    try {
      const resp = await this.client.get(`/generations/${generationId}`, this.apiKey)
      const gen = extractGenerationFromResponse(resp)
      this.generations.set(generationId, gen)
      return gen
    } catch (e) {
      return undefined
    }
  }

  getGenerationStatus(generationId: string): PikaGeneration | undefined {
    return this.generations.get(generationId)
  }
}
