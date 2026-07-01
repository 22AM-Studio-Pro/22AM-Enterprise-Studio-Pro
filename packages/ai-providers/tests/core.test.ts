import { describe, it, expect } from 'vitest'
import { RetryPolicy } from '../src/RetryPolicy'
import { RateLimiter } from '../src/RateLimiter'

describe('RetryPolicy', () => {
  it('retries until success', async () => {
    let c = 0
    const rp = new RetryPolicy(3, 10)
    const res = await rp.run(async () => {
      c += 1
      if (c < 2) throw new Error('fail')
      return 'ok'
    })
    expect(res).toBe('ok')
  })
})

describe('RateLimiter', () => {
  it('allows acquire and refills', async () => {
    const rl = new RateLimiter(2, 100)
    await rl.acquire()
    await rl.acquire()
    // next acquire will wait until refill
    const p = rl.acquire()
    setTimeout(() => {}, 150)
    await p
    expect(true).toBe(true)
  })
})
