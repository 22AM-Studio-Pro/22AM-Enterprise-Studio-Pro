export class RetryPolicy {
  maxAttempts: number
  baseDelayMs: number

  constructor(maxAttempts = 3, baseDelayMs = 200) {
    this.maxAttempts = maxAttempts
    this.baseDelayMs = baseDelayMs
  }

  async run<T>(fn: () => Promise<T>) {
    let attempt = 0
    let lastErr: any
    while (attempt < this.maxAttempts) {
      try {
        return await fn()
      } catch (e) {
        lastErr = e
        attempt += 1
        if (attempt >= this.maxAttempts) break
        const wait = this.baseDelayMs * Math.pow(2, attempt - 1)
        await new Promise((r) => setTimeout(r, wait))
      }
    }
    throw lastErr
  }
}
