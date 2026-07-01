import { describe, it, expect } from 'vitest'
import { PublishingDashboard } from '../src/PublishingDashboard'
import { PublishingContent } from '../src/PublishingTypes'

describe('PublishingDashboard', () => {
  it('tracks published content', () => {
    const dashboard = new PublishingDashboard()
    const content: PublishingContent = {
      id: 'post-1',
      platform: 'facebook',
      media: [{ type: 'image', path: '/tmp/image.jpg', mimeType: 'image/jpeg' }],
      status: 'completed',
      retries: 0,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString()
    }
    dashboard.addPublished(content)
    const queue = dashboard.getPublishingQueue()
    expect(queue.length).toBe(1)
  })

  it('filters by platform', () => {
    const dashboard = new PublishingDashboard()
    dashboard.addPublished({
      id: 'post-1',
      platform: 'facebook',
      media: [{ type: 'image', path: '/tmp/image.jpg', mimeType: 'image/jpeg' }],
      status: 'completed',
      retries: 0,
      createdAt: new Date().toISOString()
    })
    dashboard.addPublished({
      id: 'post-2',
      platform: 'youtube',
      media: [{ type: 'video', path: '/tmp/video.mp4', mimeType: 'video/mp4' }],
      status: 'completed',
      retries: 0,
      createdAt: new Date().toISOString()
    })
    const fbPosts = dashboard.getPublishingQueue({ platform: 'facebook' })
    expect(fbPosts.length).toBe(1)
  })

  it('calculates stats', () => {
    const dashboard = new PublishingDashboard()
    dashboard.addPublished({
      id: 'post-1',
      platform: 'facebook',
      media: [{ type: 'image', path: '/tmp/image.jpg', mimeType: 'image/jpeg' }],
      status: 'completed',
      retries: 0,
      createdAt: new Date().toISOString()
    })
    const stats = dashboard.getStats()
    expect(stats.totalPublished).toBe(1)
  })
})
