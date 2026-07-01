import { PublishingContent, PublishingStatus } from './PublishingTypes'
import { publishingEvents } from './PublishingEvents'
import { PublishingRetryPolicy } from './PublishingRetryPolicy'
import { PublishingPersistence } from './PublishingPersistence'
import { MetricsCollector } from './PublishingMetrics'

export class PublishingQueue {
  private queue: Map<string, PublishingContent> = new Map()
  private persistence: PublishingPersistence
  private retryPolicy: PublishingRetryPolicy
  private metricsCollector: MetricsCollector
  private processing: Set<string> = new Set()

  constructor(dbPath?: string, retryPolicy?: PublishingRetryPolicy) {
    this.persistence = new PublishingPersistence(dbPath)
    this.retryPolicy = retryPolicy ?? new PublishingRetryPolicy()
    this.metricsCollector = new MetricsCollector()
  }

  enqueue(content: PublishingContent) {
    content.status = 'pending'
    this.queue.set(content.id, content)
    this.persistence.saveJob(content)
    publishingEvents.emit('publish.created', { contentId: content.id, platform: content.platform })
  }

  dequeue(): PublishingContent | undefined {
    for (const [id, content] of this.queue) {
      if (!this.processing.has(id) && (content.status === 'pending' || content.status === 'failed')) {
        this.processing.add(id)
        return content
      }
    }
    return undefined
  }

  updateStatus(contentId: string, status: PublishingStatus, error?: string) {
    const content = this.queue.get(contentId)
    if (content) {
      content.status = status
      if (error) content.error = error
      if (status === 'completed') {
        content.publishedAt = new Date().toISOString()
      }
      this.persistence.saveJob(content)
    }
  }

  recordRetry(contentId: string) {
    const content = this.queue.get(contentId)
    if (content) {
      content.retries += 1
      this.metricsCollector.recordRetry(contentId)
      this.persistence.saveJob(content)
      publishingEvents.emit('publish.retry', { contentId, platform: content.platform, attempt: content.retries })
    }
  }

  shouldRetry(contentId: string): boolean {
    const content = this.queue.get(contentId)
    if (!content) return false
    return this.retryPolicy.shouldRetry(content.retries)
  }

  getRetryBackoff(contentId: string): number {
    const content = this.queue.get(contentId)
    if (!content) return 0
    return this.retryPolicy.calculateBackoff(content.retries)
  }

  cancel(contentId: string) {
    const content = this.queue.get(contentId)
    if (content) {
      content.status = 'cancelled'
      this.persistence.saveJob(content)
      this.processing.delete(contentId)
      publishingEvents.emit('publish.cancelled', { contentId, platform: content.platform })
    }
  }

  remove(contentId: string) {
    this.queue.delete(contentId)
    this.processing.delete(contentId)
  }

  getStatus(contentId: string): PublishingStatus | undefined {
    return this.queue.get(contentId)?.status
  }

  getMetrics(contentId: string) {
    return this.metricsCollector.getMetrics(contentId)
  }
}
