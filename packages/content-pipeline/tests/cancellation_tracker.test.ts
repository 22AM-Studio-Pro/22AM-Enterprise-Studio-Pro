import { describe, it, expect } from 'vitest'
import { CancellationTracker } from '../src/CancellationTracker'

describe('CancellationTracker', () => {
  it('tracks cancellations', () => {
    const tracker = new CancellationTracker()
    const cancel = tracker.trackCancellation('exec-1', ['stage1', 'stage2'], 'user', 'Manual cancellation')
    expect(cancel.executionId).toBe('exec-1')
    expect(cancel.stagesAffected).toContain('stage1')
  })

  it('checks if execution was cancelled', () => {
    const tracker = new CancellationTracker()
    tracker.trackCancellation('exec-1', [])
    expect(tracker.wasCancelled('exec-1')).toBe(true)
    expect(tracker.wasCancelled('exec-2')).toBe(false)
  })
})
