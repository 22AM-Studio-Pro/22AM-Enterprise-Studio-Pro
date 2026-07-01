export class RateLimiter {
  private tokens: number
  private capacity: number
  private refillMs: number
  private lastRefill: number

  constructor(capacity = 10, refillMs = 1000) {
    this.capacity = capacity
    this.tokens = capacity
    this.refillMs = refillMs
    this.lastRefill = Date.now()
  }

  private refill() {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    if (elapsed >= this.refillMs) {
      this.tokens = this.capacity
      this.lastRefill = now
    }
  }

  async acquire(): Promise<void> {
    this.refill()
    while (this.tokens <= 0) {
      await new Promise((r) => setTimeout(r, 50))
      this.refill()
    }
    this.tokens -= 1
  }
}
