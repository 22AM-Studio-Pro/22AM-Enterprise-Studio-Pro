import { describe, it, expect } from 'vitest'
import { AnalyticsCollector } from '../src/AnalyticsCollector'
import { PublishingAnalytics, PublishingContent } from '../src/PublishingTypes'

describe('AnalyticsCollector', () => {
  it('records and retrieves platform analytics', () => {
    const collector = new AnalyticsCollector()
    const analytics: PublishingAnalytics = {
      platformId: 'fb-123',
      views: 1000,
      likes: 100,
      comments: 50,
      engagement: 5,
      updatedAt: new Date().toISOString()
    }
    collector.recordAnalytics(analytics)
    const content: PublishingContent = {
      id: 'post-1',
      platform: 'facebook',
      platformId: 'fb-123',
      media: [{ type: 'image', path: '/tmp/image.jpg', mimeType: 'image/jpeg' }],
      status: 'completed',
      retries: 0,
      createdAt: new Date().toISOString()
    }
    collector.recordContent(content)
    const data = collector.getPlatformAnalytics('facebook')
    expect(data.platform).toBe('facebook')
  })

  it('exports analytics as CSV', () => {
    const collector = new AnalyticsCollector()
    collector.recordAnalytics({
      platformId: 'fb-123',
      views: 1000,
      likes: 100,
      comments: 50,
      engagement: 5,
      updatedAt: new Date().toISOString()
    })
    const csv = collector.exportCSV('facebook')
    expect(csv).toContain('Platform,Views')
  })

  it('exports analytics as JSON', () => {
    const collector = new AnalyticsCollector()
    collector.recordAnalytics({
      platformId: 'fb-123',
      views: 1000,
      likes: 100,
      engagement: 5,
      updatedAt: new Date().toISOString()
    })
    const json = collector.exportJSON('facebook')
    expect(json).toContain('"platform"')
  })
})
