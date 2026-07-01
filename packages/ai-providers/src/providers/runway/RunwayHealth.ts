import { HealthMonitor } from '../../HealthMonitor'
import { RunwayClient } from './RunwayClient'
import { RunwayConfig } from './RunwayConfig'

export class RunwayHealth {
  private client: RunwayClient
  private apiKey: string
  private monitor: HealthMonitor

  constructor(client: RunwayClient, apiKey: string, monitor: HealthMonitor) {
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
