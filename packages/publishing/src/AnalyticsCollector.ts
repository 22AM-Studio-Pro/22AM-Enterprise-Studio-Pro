import { PublishingContent, PublishingAnalytics } from '../PublishingTypes'

export type AnalyticsData = {
  platform: string
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  avgEngagementRate: number
  topPerformingPost?: PublishingContent
  timeline: { date: string; views: number; engagement: number }[]
}

export type PlatformComparison = {
  platforms: string[]
  metrics: Map<string, Map<string, number>>
  totalReach: number
  avgEngagement: number
}

export class AnalyticsCollector {
  private analytics: Map<string, PublishingAnalytics> = new Map()
  private content: Map<string, PublishingContent> = new Map()

  recordAnalytics(analytics: PublishingAnalytics) {
    this.analytics.set(analytics.platformId, analytics)
  }

  recordContent(content: PublishingContent) {
    this.content.set(content.id, content)
  }

  getPlatformAnalytics(platform: string): AnalyticsData {
    const platformAnalytics = Array.from(this.analytics.values()).filter(
      (a) => this.content.get(Object.keys(this.content).find((k) => this.content.get(k)?.platform === platform)!)?.platform === platform
    )

    const totalViews = platformAnalytics.reduce((sum, a) => sum + (a.views ?? 0), 0)
    const totalLikes = platformAnalytics.reduce((sum, a) => sum + (a.likes ?? 0), 0)
    const totalComments = platformAnalytics.reduce((sum, a) => sum + (a.comments ?? 0), 0)
    const totalShares = platformAnalytics.reduce((sum, a) => sum + (a.shares ?? 0), 0)

    const avgEngagementRate = platformAnalytics.length > 0
      ? platformAnalytics.reduce((sum, a) => sum + (a.engagement ?? 0), 0) / platformAnalytics.length
      : 0

    return {
      platform,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      avgEngagementRate,
      timeline: []
    }
  }

  getComparison(platforms: string[]): PlatformComparison {
    const metrics = new Map<string, Map<string, number>>()

    for (const platform of platforms) {
      const data = this.getPlatformAnalytics(platform)
      metrics.set(platform, new Map([
        ['views', data.totalViews],
        ['likes', data.totalLikes],
        ['comments', data.totalComments],
        ['shares', data.totalShares],
        ['engagement', data.avgEngagementRate]
      ]))
    }

    const totalReach = platforms.reduce((sum, p) => sum + (metrics.get(p)?.get('views') ?? 0), 0)
    const avgEngagement = platforms.length > 0
      ? platforms.reduce((sum, p) => sum + (metrics.get(p)?.get('engagement') ?? 0), 0) / platforms.length
      : 0

    return { platforms, metrics, totalReach, avgEngagement }
  }

  exportCSV(platform: string): string {
    const analytics = this.getPlatformAnalytics(platform)
    const csv = [
      'Platform,Views,Likes,Comments,Shares,Engagement',
      `${analytics.platform},${analytics.totalViews},${analytics.totalLikes},${analytics.totalComments},${analytics.totalShares},${analytics.avgEngagementRate}`
    ].join('\n')
    return csv
  }

  exportJSON(platform: string): string {
    const analytics = this.getPlatformAnalytics(platform)
    return JSON.stringify(analytics, null, 2)
  }
}
