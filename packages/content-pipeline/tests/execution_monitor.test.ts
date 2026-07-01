import { describe, it, expect } from 'vitest'
import { ExecutionMonitor } from '../src/ExecutionMonitor'

describe('ExecutionMonitor', () => {
  it('records and retrieves execution updates', () => {
    const monitor = new ExecutionMonitor()
    monitor.recordUpdate({
      executionId: 'exec-1',
      type: 'stage_start',
      stageId: 'stage1',
      timestamp: new Date().toISOString()
    })
    const timeline = monitor.getExecutionTimeline('exec-1')
    expect(timeline.length).toBe(1)
    expect(timeline[0].type).toBe('stage_start')
  })

  it('broadcasts updates to subscribers', () => {
    const monitor = new ExecutionMonitor()
    let received = 0
    monitor.subscribe('exec-1', () => { received += 1 })
    monitor.broadcastUpdate({
      executionId: 'exec-1',
      type: 'stage_complete',
      timestamp: new Date().toISOString()
    })
    expect(received).toBe(1)
  })
})
