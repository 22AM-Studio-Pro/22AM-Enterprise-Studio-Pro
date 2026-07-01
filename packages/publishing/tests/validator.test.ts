import { describe, it, expect } from 'vitest'
import { PublishingValidator } from '../src/PublishingValidator'
import { PublishingContent } from '../src/PublishingTypes'

describe('PublishingValidator', () => {
  it('validates correct content', () => {
    const validator = new PublishingValidator()
    const content: PublishingContent = {
      id: 'post-1',
      platform: 'facebook',
      title: 'Test Post',
      media: [{ type: 'image', path: '/tmp/image.jpg', mimeType: 'image/jpeg' }],
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString()
    }
    const result = validator.validate(content)
    expect(result.valid).toBe(true)
  })

  it('detects missing required fields', () => {
    const validator = new PublishingValidator()
    const content: PublishingContent = {
      id: 'post-1',
      platform: '',
      media: [],
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString()
    }
    const result = validator.validate(content)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('validates media compatibility by platform', () => {
    const validator = new PublishingValidator()
    const tiktokMedia = [{ type: 'carousel' as const, path: '/tmp/carousel', mimeType: 'image/jpeg' }]
    const result = validator.validateMediaCompatibility(tiktokMedia, 'tiktok')
    expect(result.compatible).toBe(false)
  })
})
