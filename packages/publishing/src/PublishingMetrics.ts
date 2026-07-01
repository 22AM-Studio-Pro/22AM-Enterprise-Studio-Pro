import { PublishingContent } from './PublishingTypes'

export type PublishingMetrics = {
  contentId: string
  platform: string
  duration: number
  retries: number
  uploadSpeed?: number
  platformResponseTime?: number
  success: boolean
  startedAt: string
  completedAt?: string
}

export class MetricsCollector {
  private metrics: Map<string, PublishingMetrics> = new Map()

  createMetrics(contentId: string, platform: string): PublishingMetrics {
    const m: PublishingMetrics = {
      contentId,
      platform,
      duration: 0,
      retries: 0,
      success: false,
      startedAt: new Date().toISOString()
    }
    this.metrics.set(contentId, m)
    return m
  }

  recordRetry(contentId: string) {
    const m = this.metrics.get(contentId)
    if (m) m.retries += 1
  }

  recordUploadSpeed(contentId: string, bytesPerSecond: number) {
    const m = this.metrics.get(contentId)
    if (m) m.uploadSpeed = bytesPerSecond
  }

  completeMetrics(contentId: string, success: boolean) {
    const m = this.metrics.get(contentId)
    if (m) {
      m.completedAt = new Date().toISOString()
      const start = new Date(m.startedAt).getTime()
      const end = new Date(m.completedAt).getTime()
      m.duration = end - start
      m.success = success
    }
  }

  getMetrics(contentId: string): PublishingMetrics | undefined {
    return this.metrics.get(contentId)
  }

  getAllMetrics(): PublishingMetrics[] {
    return Array.from(this.metrics.values())
  }
}
