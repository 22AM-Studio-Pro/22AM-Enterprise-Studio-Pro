import { describe, it, expect } from 'vitest'
import { FacebookPublisher } from '../src/providers/FacebookPublisher'
import { YouTubePublisher } from '../src/providers/YouTubePublisher'
import { TikTokPublisher } from '../src/providers/TikTokPublisher'
import { InstagramPublisher } from '../src/providers/InstagramPublisher'
import { LinkedInPublisher } from '../src/providers/LinkedInPublisher'

describe('Platform Publishers', () => {
  it('facebook publisher authenticates', async () => {
    const fb = new FacebookPublisher()
    const result = await fb.authenticate({ platform: 'facebook', accessToken: 'test-token' })
    expect(result).toBe(true)
  })

  it('youtube publisher publishes', async () => {
    const yt = new YouTubePublisher()
    await yt.initialize({ platform: 'youtube', accessToken: 'test-token' })
    const result = await yt.publish({
      id: 'post-1',
      platform: 'youtube',
      media: [{ type: 'video', path: '/tmp/video.mp4', mimeType: 'video/mp4' }],
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString()
    })
    expect(result.platformId).toBeDefined()
    expect(result.url).toBeDefined()
  })

  it('tiktok publisher schedules', async () => {
    const tt = new TikTokPublisher()
    await tt.initialize({ platform: 'tiktok', accessToken: 'test-token' })
    const result = await tt.schedule({
      id: 'post-1',
      platform: 'tiktok',
      media: [{ type: 'video', path: '/tmp/video.mp4', mimeType: 'video/mp4' }],
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 3600000).toISOString(),
      retries: 0,
      createdAt: new Date().toISOString()
    })
    expect(result.jobId).toBeDefined()
  })

  it('instagram publisher gets analytics', async () => {
    const ig = new InstagramPublisher()
    await ig.initialize({ platform: 'instagram', accessToken: 'test-token' })
    const analytics = await ig.getAnalytics('ig-123')
    expect(analytics?.platformId).toBe('ig-123')
    expect(analytics?.likes).toBeDefined()
  })

  it('linkedin publisher checks health', async () => {
    const li = new LinkedInPublisher()
    await li.initialize({ platform: 'linkedin', accessToken: 'test-token' })
    const health = await li.health()
    expect(health.ok).toBe(true)
    expect(health.platform).toBe('linkedin')
  })
})
