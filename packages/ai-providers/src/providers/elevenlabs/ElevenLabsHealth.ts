import { HealthMonitor } from '../../HealthMonitor'
import { ElevenLabsClient } from './ElevenLabsClient'
import { ElevenLabsConfig } from './ElevenLabsConfig'

export class ElevenLabsHealth {
  private client: ElevenLabsClient
  private apiKey: string
  private monitor: HealthMonitor

  constructor(client: ElevenLabsClient, apiKey: string, monitor: HealthMonitor) {
    this.client = client
    this.apiKey = apiKey
    this.monitor = monitor
  }

  async check() {
    const start = Date.now()
    try {
      const res = await this.client.get('/voices', this.apiKey)
      this.monitor.recordSuccess()
      return { ok: true, status: 'ok', latencyMs: Date.now() - start }
    } catch (e) {
      this.monitor.recordFailure()
      return { ok: false, status: String((e as Error).message) }
    }
  }
}
