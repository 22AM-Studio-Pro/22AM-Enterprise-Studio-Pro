import { PublishingContent } from '../PublishingTypes'

export type DashboardFilter = {
  platform?: string
  status?: string
  dateRange?: { start: string; end: string }
}

export type DashboardStats = {
  totalPublished: number
  totalFailed: number
  totalScheduled: number
  successRate: number
  avgPublishTime: number
  platformBreakdown: Map<string, number>
}

export class PublishingDashboard {
  private publishedContent: Map<string, PublishingContent> = new Map()
  private scheduledContent: Map<string, PublishingContent> = new Map()
  private failedContent: Map<string, PublishingContent> = new Map()

  addPublished(content: PublishingContent) {
    this.publishedContent.set(content.id, content)
  }

  addScheduled(content: PublishingContent) {
    this.scheduledContent.set(content.id, content)
  }

  addFailed(content: PublishingContent) {
    this.failedContent.set(content.id, content)
  }

  getPublishingQueue(filter?: DashboardFilter): PublishingContent[] {
    let items = Array.from(this.publishedContent.values())
    if (filter?.platform) items = items.filter((i) => i.platform === filter.platform)
    if (filter?.status) items = items.filter((i) => i.status === filter.status)
    return items
  }

  getScheduledPosts(filter?: DashboardFilter): PublishingContent[] {
    let items = Array.from(this.scheduledContent.values())
    if (filter?.platform) items = items.filter((i) => i.platform === filter.platform)
    return items
  }

  getPublishingHistory(filter?: DashboardFilter): PublishingContent[] {
    let items = Array.from(this.publishedContent.values())
    if (filter?.platform) items = items.filter((i) => i.platform === filter.platform)
    if (filter?.dateRange) {
      const start = new Date(filter.dateRange.start).getTime()
      const end = new Date(filter.dateRange.end).getTime()
      items = items.filter((i) => {
        const time = new Date(i.publishedAt || i.createdAt).getTime()
        return time >= start && time <= end
      })
    }
    return items
  }

  getRetryableContent(): PublishingContent[] {
    return Array.from(this.failedContent.values()).filter((c) => c.retries < 3)
  }

  getStats(): DashboardStats {
    const all = [
      ...this.publishedContent.values(),
      ...this.scheduledContent.values(),
      ...this.failedContent.values()
    ]

    const platformBreakdown = new Map<string, number>()
    for (const content of all) {
      const count = platformBreakdown.get(content.platform) ?? 0
      platformBreakdown.set(content.platform, count + 1)
    }

    const successRate = all.length > 0 ? (this.publishedContent.size / all.length) * 100 : 0

    return {
      totalPublished: this.publishedContent.size,
      totalFailed: this.failedContent.size,
      totalScheduled: this.scheduledContent.size,
      successRate,
      avgPublishTime: 0,
      platformBreakdown
    }
  }

  bulkRetry(contentIds: string[]) {
    for (const id of contentIds) {
      const content = this.failedContent.get(id)
      if (content && content.retries < 3) {
        content.status = 'pending'
        content.retries += 1
      }
    }
  }

  bulkCancel(contentIds: string[]) {
    for (const id of contentIds) {
      const content = this.scheduledContent.get(id) || this.publishedContent.get(id)
      if (content) {
        content.status = 'cancelled'
      }
    }
  }
}
