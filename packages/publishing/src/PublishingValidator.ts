import { PublishingContent, PublishingMedia } from './PublishingTypes'

export class PublishingValidator {
  validate(content: PublishingContent): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!content.id || content.id.trim() === '') errors.push('Content ID is required')
    if (!content.platform || content.platform.trim() === '') errors.push('Platform is required')
    if (!content.media || content.media.length === 0) errors.push('At least one media item is required')

    // Validate media
    for (let i = 0; i < (content.media?.length ?? 0); i++) {
      const media = content.media![i]
      if (!media.path || media.path.trim() === '') {
        errors.push(`Media ${i}: path is required`)
      }
      if (!media.mimeType || media.mimeType.trim() === '') {
        errors.push(`Media ${i}: mimeType is required`)
      }
    }

    // Validate schedule if present
    if (content.scheduledAt) {
      const scheduledTime = new Date(content.scheduledAt).getTime()
      const now = Date.now()
      if (scheduledTime < now) {
        errors.push('Scheduled time must be in the future')
      }
    }

    return { valid: errors.length === 0, errors }
  }

  validateMediaCompatibility(media: PublishingMedia[], platform: string): { compatible: boolean; errors: string[] } {
    const errors: string[] = []

    // Platform-specific validation
    if (platform === 'tiktok') {
      if (media.some((m) => m.type === 'carousel')) {
        errors.push('TikTok does not support carousel media')
      }
      if (media.some((m) => m.duration && m.duration > 600)) {
        errors.push('TikTok videos must be <= 10 minutes')
      }
    }

    if (platform === 'instagram') {
      if (media.length > 10 && media.some((m) => m.type === 'carousel')) {
        errors.push('Instagram carousels support max 10 items')
      }
    }

    if (platform === 'youtube') {
      if (media.some((m) => m.type === 'story')) {
        errors.push('YouTube does not support stories')
      }
    }

    return { compatible: errors.length === 0, errors }
  }
}
