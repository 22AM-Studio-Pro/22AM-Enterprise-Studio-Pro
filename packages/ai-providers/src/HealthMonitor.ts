import { AIProvider } from './AIProvider'
import { RetryPolicy } from './RetryPolicy'
import { RateLimiter } from './RateLimiter'

export class HealthMonitor {
  private lastSuccess?: number
  private lastFailure?: number
  private failures: number
  private retryPolicy: RetryPolicy
  private rateLimiter: RateLimiter

  constructor(retry?: RetryPolicy, rateLimiter?: RateLimiter) {
    this.failures = 0
    this.retryPolicy = retry ?? new RetryPolicy()
    this.rateLimiter = rateLimiter ?? new RateLimiter()
  }

  recordSuccess() {
    this.lastSuccess = Date.now()
  }

  recordFailure() {
    this.lastFailure = Date.now()
    this.failures += 1
  }

  status() {
    return {
      ok: this.failures === 0,
      lastSuccess: this.lastSuccess,
      lastFailure: this.lastFailure,
      failures: this.failures
    }
  }
}
