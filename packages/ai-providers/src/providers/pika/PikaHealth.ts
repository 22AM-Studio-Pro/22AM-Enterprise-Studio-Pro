import { HealthMonitor } from '../../HealthMonitor'
import { PikaClient } from './PikaClient'
import { PikaConfig } from './PikaConfig'

export class PikaHealth {
  private client: PikaClient
  private apiKey: string
  private monitor: HealthMonitor

  constructor(client: PikaClient, apiKey: string, monitor: HealthMonitor) {
    this.client = client
    this.apiKey = apiKey
    this.monitor = monitor
  }

  async check() {
    const start = Date.now()
    try {
      const res = await this.client.get('/models', this.apiKey)
      this.monitor.recordSuccess()
      return { ok: true, status: 'ok', latencyMs: Date.now() - start }
    } catch (e) {
      this.monitor.recordFailure()
      return { ok: false, status: String((e as Error).message) }
    }
  }
}
