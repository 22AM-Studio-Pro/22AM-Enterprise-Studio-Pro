import { PublishingContent } from './PublishingTypes'

export type RetryPolicy = {
  maxAttempts: number
  initialBackoffMs: number
  maxBackoffMs: number
  backoffMultiplier: number
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  initialBackoffMs: 1000,
  maxBackoffMs: 60000,
  backoffMultiplier: 2
}

export class PublishingRetryPolicy {
  private policy: RetryPolicy

  constructor(policy: Partial<RetryPolicy> = {}) {
    this.policy = { ...DEFAULT_RETRY_POLICY, ...policy }
  }

  calculateBackoff(attempt: number): number {
    const backoff = this.policy.initialBackoffMs * Math.pow(this.policy.backoffMultiplier, attempt - 1)
    return Math.min(backoff, this.policy.maxBackoffMs)
  }

  shouldRetry(attempt: number): boolean {
    return attempt < this.policy.maxAttempts
  }

  getPolicy(): RetryPolicy {
    return { ...this.policy }
  }
}
