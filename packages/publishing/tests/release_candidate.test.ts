import { describe, it, expect } from 'vitest'
import { PublishingQueue } from '../src/PublishingQueue'
import { PublishingDashboard } from '../src/PublishingDashboard'
import { AnalyticsCollector } from '../src/AnalyticsCollector'
import { PublishingContent } from '../src/PublishingTypes'
import path from 'path'
import fs from 'fs-extra'

const dbPath = path.resolve(__dirname, 'test-data', 'rc.db')

beforeEach(() => {
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
})

describe('Release Candidate Integration', () => {
  it('end-to-end publishing workflow', async () => {
    const queue = new PublishingQueue(dbPath)
    const dashboard = new PublishingDashboard()

    // Create and enqueue content
    const content: PublishingContent = {
      id: 'rc-post-1',
      platform: 'facebook',
      title: 'RC Test Post',
      description: 'Release candidate integration test',
      media: [{ type: 'image', path: '/tmp/image.jpg', mimeType: 'image/jpeg' }],
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString()
    }

    queue.enqueue(content)
    dashboard.addPublished(content)

    // Verify dashboard
    const queueItems = dashboard.getPublishingQueue()
    expect(queueItems.length).toBe(1)

    // Update status
    queue.updateStatus('rc-post-1', 'completed', undefined)
    content.status = 'completed'
    content.publishedAt = new Date().toISOString()
    content.platformId = 'fb-rc-123'
    content.url = 'https://facebook.com/post/fb-rc-123'

    // Verify metrics
    const stats = dashboard.getStats()
    expect(stats.totalPublished).toBeGreaterThan(0)
  })

  it('multi-platform publishing simulation', () => {
    const dashboard = new PublishingDashboard()
    const analytics = new AnalyticsCollector()

    // Create content for multiple platforms
    const platforms = ['facebook', 'youtube', 'tiktok', 'instagram', 'linkedin']
    for (let i = 0; i < platforms.length; i++) {
      const content: PublishingContent = {
        id: `rc-post-${i}`,
        platform: platforms[i],
        media: [{ type: 'video', path: `/tmp/video${i}.mp4`, mimeType: 'video/mp4' }],
        status: 'completed',
        platformId: `${platforms[i]}-123`,
        retries: 0,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      }
      dashboard.addPublished(content)
      analytics.recordContent(content)
      analytics.recordAnalytics({
        platformId: `${platforms[i]}-123`,
        views: Math.floor(Math.random() * 100000),
        likes: Math.floor(Math.random() * 10000),
        comments: Math.floor(Math.random() * 1000),
        shares: Math.floor(Math.random() * 500),
        engagement: Math.random() * 10,
        updatedAt: new Date().toISOString()
      })
    }

    // Verify cross-platform stats
    const comparison = analytics.getComparison(platforms)
    expect(comparison.platforms.length).toBe(5)
    expect(comparison.totalReach).toBeGreaterThan(0)

    // Verify dashboard stats
    const stats = dashboard.getStats()
    expect(stats.platformBreakdown.size).toBe(5)
  })
})
