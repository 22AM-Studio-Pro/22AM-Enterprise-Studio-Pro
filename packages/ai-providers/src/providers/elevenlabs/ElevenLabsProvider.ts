import { AIProvider, ProviderInitializeOptions } from '../../AIProvider'
import { ProviderError } from '../../ProviderError'
import { ElevenLabsClient } from './ElevenLabsClient'
import { ElevenLabsConfig } from './ElevenLabsConfig'
import { mapTTSRequest, extractVoicesFromResponse, Voice } from './ElevenLabsMapper'
import { ElevenLabsStreaming } from './ElevenLabsStreaming'
import { RetryPolicy } from '../../RetryPolicy'
import { RateLimiter } from '../../RateLimiter'
import { CredentialManager } from '../../CredentialManager'
import { HealthMonitor } from '../../HealthMonitor'

export class ElevenLabsProvider implements AIProvider {
  name = 'elevenlabs'
  private config: ElevenLabsConfig
  private client?: ElevenLabsClient
  private apiKey?: string
  private retry: RetryPolicy
  private limiter: RateLimiter
  private healthMonitor: HealthMonitor
  private credentialManager: CredentialManager
  private voices: Voice[] = []

  capabilities = {
    supportsChat: false,
    supportsStreaming: true,
    supportsAudio: true,
    supportsImages: false,
    supportsEmbeddings: false
  }

  constructor(cfg?: ElevenLabsConfig, credentialManager?: CredentialManager) {
    this.config = cfg ?? {}
    this.retry = new RetryPolicy()
    this.limiter = new RateLimiter(10, 1000)
    this.healthMonitor = new HealthMonitor()
    this.credentialManager = credentialManager ?? new CredentialManager()
  }

  async initialize(options: ProviderInitializeOptions) {
    if (options?.apiKey) this.apiKey = options.apiKey
    else this.apiKey = this.credentialManager.getCredential('elevenlabs', 'apiKey')
    if (!this.apiKey) throw new ProviderError('missing api key', 'auth')
    this.client = new ElevenLabsClient(this.config, undefined, this.retry)
    // Load voices on init
    try {
      const resp = await this.client.get('/voices', this.apiKey)
      this.voices = extractVoicesFromResponse(resp)
    } catch (e: any) {
      this.healthMonitor.recordFailure()
    }
  }

  async shutdown() { return }

  async health() {
    if (!this.client || !this.apiKey) return { ok: false, status: 'not-initialized' }
    const h = new (await import('./ElevenLabsHealth')).ElevenLabsHealth(this.client, this.apiKey, this.healthMonitor)
    return h.check()
  }

  async generate(text: string, options?: Record<string, unknown>) {
    if (!this.client || !this.apiKey) throw new ProviderError('not initialized', 'not_initialized')
    await this.limiter.acquire()
    try {
      const voiceId = (options?.voiceId as string) || this.config.voiceId || (this.voices[0]?.voice_id ?? '21m00Tcm4TlvDq8ikWAM')
      const body = mapTTSRequest(text, voiceId, this.config.model)
      // In production, this would return audio bytes; for now return a stub
      return { voiceId, text, type: 'audio', length: 1000 }
    } catch (e: any) {
      throw new ProviderError(e.message || 'elevenlabs error', e.code || 'elevenlabs_error')
    }
  }

  async stream(text: string, onData: (chunk: any) => void, options?: Record<string, unknown>) {
    if (!this.apiKey) throw new ProviderError('not initialized', 'not_initialized')
    const voiceId = (options?.voiceId as string) || this.config.voiceId || (this.voices[0]?.voice_id ?? '21m00Tcm4TlvDq8ikWAM')
    const streaming = new ElevenLabsStreaming(this.config.apiBaseUrl ?? 'https://api.elevenlabs.io/v1', this.apiKey, voiceId, (globalThis.fetch as unknown as any))
    return streaming.streamText(text, onData)
  }

  async cancel(requestId: string) { return }

  async validateConfiguration(config: Record<string, unknown>) {
    if (!(config && (config as any).apiKey) && !this.credentialManager.getCredential('elevenlabs', 'apiKey')) throw new ProviderError('apiKey missing', 'validation')
    return
  }

  getVoices(): Voice[] {
    return this.voices
  }
}
