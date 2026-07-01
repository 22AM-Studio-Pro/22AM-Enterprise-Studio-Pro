import { HealthMonitor } from '../../HealthMonitor'
import { OpenAIClient } from './OpenAIClient'
import { OpenAIConfig } from './OpenAIConfig'

export class OpenAIHealth {
  private client: OpenAIClient
  private apiKey: string
  private monitor: HealthMonitor
  private config: OpenAIConfig

  constructor(client: OpenAIClient, apiKey: string, monitor: HealthMonitor, config: OpenAIConfig) {
    this.client = client
    this.apiKey = apiKey
    this.monitor = monitor
    this.config = config
  }

  async check() {
    const start = Date.now()
    try {
      // use a lightweight endpoint: models list
      const res = await this.client.post('/models', this.apiKey, {})
      this.monitor.recordSuccess()
      return { ok: true, status: 'ok', latencyMs: Date.now() - start }
    } catch (e) {
      this.monitor.recordFailure()
      return { ok: false, status: String((e as Error).message) }
    }
  }
}
