import { PublisherHealthStatus, CredentialConfig, PublishingContent, PublishingAnalytics } from './PublishingTypes'

export interface IPublisher {
  platform: string

  initialize(credentialConfig: CredentialConfig): Promise<void>
  shutdown(): Promise<void>
  authenticate(credentialConfig: CredentialConfig): Promise<boolean>
  refreshToken(refreshToken: string): Promise<string>
  validateConfiguration(credentialConfig: CredentialConfig): Promise<boolean>

  publish(content: PublishingContent): Promise<{ platformId: string; url?: string }>
  schedule(content: PublishingContent): Promise<{ jobId: string }>
  cancel(jobId: string): Promise<void>
  delete(platformId: string): Promise<void>

  getStatus(platformId: string): Promise<PublishingContent | undefined>
  getAnalytics(platformId: string): Promise<PublishingAnalytics | undefined>
  health(): Promise<PublisherHealthStatus>
}
