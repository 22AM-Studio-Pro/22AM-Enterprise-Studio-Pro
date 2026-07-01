export type PublishingStatus = 'pending' | 'scheduled' | 'publishing' | 'completed' | 'failed' | 'cancelled'

export type PublishingMedia = {
  type: 'video' | 'image' | 'audio' | 'carousel' | 'story' | 'reel'
  path: string
  mimeType: string
  duration?: number
  thumbnail?: string
}

export type PublishingContent = {
  id: string
  platform: string
  title?: string
  description?: string
  caption?: string
  media: PublishingMedia[]
  metadata?: Record<string, any>
  tags?: string[]
  scheduledAt?: string
  publishedAt?: string
  platformId?: string
  url?: string
  status: PublishingStatus
  retries: number
  error?: string
  createdAt: string
}

export type PublishingAnalytics = {
  platformId: string
  views?: number
  likes?: number
  shares?: number
  comments?: number
  engagement?: number
  reach?: number
  impressions?: number
  clicks?: number
  downloads?: number
  updatedAt: string
}

export type CredentialConfig = {
  platform: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: string
  clientId?: string
  clientSecret?: string
  customFields?: Record<string, string>
}

export type PublisherHealthStatus = {
  ok: boolean
  platform: string
  message: string
  lastChecked: string
  latency?: number
}
