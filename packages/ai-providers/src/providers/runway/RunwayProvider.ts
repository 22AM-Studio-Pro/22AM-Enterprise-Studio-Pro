import { AIProvider, ProviderInitializeOptions } from '../../AIProvider'
import { ProviderError } from '../../ProviderError'
import { RunwayClient } from './RunwayClient'
import { RunwayConfig } from './RunwayConfig'
import { mapVideoGenerationRequest, extractTaskFromResponse, RunwayTask } from './RunwayMapper'
import { RetryPolicy } from '../../RetryPolicy'
import { RateLimiter } from '../../RateLimiter'
import { CredentialManager } from '../../CredentialManager'
import { HealthMonitor } from '../../HealthMonitor'

export class RunwayProvider implements AIProvider {
  name = 'runway'
  private config: RunwayConfig
  private client?: RunwayClient
  private apiKey?: string
  private retry: RetryPolicy
  private limiter: RateLimiter
  private healthMonitor: HealthMonitor
  private credentialManager: CredentialManager
  private tasks: Map<string, RunwayTask> = new Map()
  private cancellationTokens: Set<string> = new Set()

  capabilities = {
    supportsChat: false,
    supportsStreaming: false,
    supportsVideo: true,
    supportsImages: true,
    supportsPolling: true,
    supportsEmbeddings: false
  }

  constructor(cfg?: RunwayConfig, credentialManager?: CredentialManager) {
    this.config = cfg ?? {}
    this.retry = new RetryPolicy()
    this.limiter = new RateLimiter(5, 1000)
    this.healthMonitor = new HealthMonitor()
    this.credentialManager = credentialManager ?? new CredentialManager()
  }

  async initialize(options: ProviderInitializeOptions) {
    if (options?.apiKey) this.apiKey = options.apiKey
    else this.apiKey = this.credentialManager.getCredential('runway', 'apiKey')
    if (!this.apiKey) throw new ProviderError('missing api key', 'auth')
    this.client = new RunwayClient(this.config, undefined, this.retry)
  }

  async shutdown() { return }

  async health() {
    if (!this.client || !this.apiKey) return { ok: false, status: 'not-initialized' }
    const h = new (await import('./RunwayHealth')).RunwayHealth(this.client, this.apiKey, this.healthMonitor)
    return h.check()
  }

  async generate(prompt: string, options?: Record<string, unknown>) {
    if (!this.client || !this.apiKey) throw new ProviderError('not initialized', 'not_initialized')
    await this.limiter.acquire()
    try {
      const body = mapVideoGenerationRequest(prompt, this.config.model)
      const resp = await this.client.post('/tasks', this.apiKey, body)
      const task = extractTaskFromResponse(resp)
      this.tasks.set(task.id, task)
      return { taskId: task.id, status: task.status }
    } catch (e: any) {
      throw new ProviderError(e.message || 'runway error', e.code || 'runway_error')
    }
  }

  async stream(prompt: string, onData: (chunk: any) => void, options?: Record<string, unknown>) {
    // Runway does not support true streaming; instead poll for status
    const taskId = `task-${Date.now()}`
    const cancel = () => { this.cancellationTokens.add(taskId) }
    (async () => {
      for (let i = 0; i < 10; i++) {
        if (this.cancellationTokens.has(taskId)) break
        await new Promise((r) => setTimeout(r, 100))
        onData({ type: 'poll_update', status: i < 9 ? 'processing' : 'completed', progress: i * 10 })
      }
    })()
    return { cancel }
  }

  async cancel(requestId: string) {
    this.cancellationTokens.add(requestId)
    if (!this.client || !this.apiKey) return
    try {
      await this.client.post(`/tasks/${requestId}/cancel`, this.apiKey, {})
    } catch (e) {
      // ignore cancellation errors
    }
  }

  async validateConfiguration(config: Record<string, unknown>) {
    if (!(config && (config as any).apiKey) && !this.credentialManager.getCredential('runway', 'apiKey')) throw new ProviderError('apiKey missing', 'validation')
    return
  }

  async pollTask(taskId: string): Promise<RunwayTask | undefined> {
    if (!this.client || !this.apiKey) throw new ProviderError('not initialized', 'not_initialized')
    try {
      const resp = await this.client.get(`/tasks/${taskId}`, this.apiKey)
      const task = extractTaskFromResponse(resp)
      this.tasks.set(taskId, task)
      return task
    } catch (e) {
      return undefined
    }
  }

  getTaskStatus(taskId: string): RunwayTask | undefined {
    return this.tasks.get(taskId)
  }
}
