import { describe, it, expect } from 'vitest'
import { PublishingRetryPolicy } from '../src/PublishingRetryPolicy'

describe('PublishingRetryPolicy', () => {
  it('calculates exponential backoff', () => {
    const policy = new PublishingRetryPolicy()
    const backoff1 = policy.calculateBackoff(1)
    const backoff2 = policy.calculateBackoff(2)
    const backoff3 = policy.calculateBackoff(3)
    expect(backoff2).toBeGreaterThan(backoff1)
    expect(backoff3).toBeGreaterThan(backoff2)
  })

  it('respects max retry attempts', () => {
    const policy = new PublishingRetryPolicy({ maxAttempts: 3 })
    expect(policy.shouldRetry(1)).toBe(true)
    expect(policy.shouldRetry(2)).toBe(true)
    expect(policy.shouldRetry(3)).toBe(false)
  })

  it('caps backoff at maximum', () => {
    const policy = new PublishingRetryPolicy({ maxBackoffMs: 30000 })
    const backoff = policy.calculateBackoff(10)
    expect(backoff).toBeLessThanOrEqual(30000)
  })
})
