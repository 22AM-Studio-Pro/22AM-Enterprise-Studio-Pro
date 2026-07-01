import { describe, it, expect } from 'vitest'
import { RetryHistory } from '../src/RetryHistory'

describe('RetryHistory', () => {
  it('records and retrieves retry events', () => {
    const history = new RetryHistory()
    history.recordRetry('exec-1', 'stage1', 1, 'Timeout')
    history.recordRetry('exec-1', 'stage1', 2, 'Network error')
    const retries = history.getRetryHistory('exec-1')
    expect(retries.length).toBe(2)
    expect(retries[0].attempt).toBe(1)
  })

  it('filters retries by stage', () => {
    const history = new RetryHistory()
    history.recordRetry('exec-1', 'stage1', 1)
    history.recordRetry('exec-1', 'stage2', 1)
    const stage1Retries = history.getStageRetries('exec-1', 'stage1')
    expect(stage1Retries.length).toBe(1)
  })
})
