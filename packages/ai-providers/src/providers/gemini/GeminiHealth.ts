import { HealthMonitor } from '../../HealthMonitor'
import { GeminiClient } from './GeminiClient'
import { GeminiConfig } from './GeminiConfig'

export class GeminiHealth {
  private client: GeminiClient
  private apiKey: string
  private monitor: HealthMonitor
  private config: GeminiConfig

  constructor(client: GeminiClient, apiKey: string, monitor: HealthMonitor, config: GeminiConfig) {
    this.client = client
    this.apiKey = apiKey
    this.monitor = monitor
    this.config = config
  }

  async check() {
    const start = Date.now()
    try {
      // use a lightweight ping endpoint or models list
      const res = await this.client.post('/models', this.apiKey, {})
      this.monitor.recordSuccess()
      return { ok: true, status: 'ok', latencyMs: Date.now() - start }
    } catch (e) {
      this.monitor.recordFailure()
      return { ok: false, status: String((e as Error).message) }
    }
  }
}
