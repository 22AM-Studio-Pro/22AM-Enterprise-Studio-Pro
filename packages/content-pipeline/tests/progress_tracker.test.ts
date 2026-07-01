import { describe, it, expect } from 'vitest'
import { ProgressTracker } from '../src/ProgressTracker'
import { MetricsCollector } from '../src/PipelineMetrics'
import { PipelineExecution } from '../src/PipelineTypes'

describe('ProgressTracker', () => {
  it('tracks execution progress', () => {
    const metricsCollector = new MetricsCollector()
    const tracker = new ProgressTracker(metricsCollector)
    const execution: PipelineExecution = {
      id: 'exec-1',
      pipelineId: 'pipeline-1',
      state: 'running',
      stageExecutions: new Map([
        ['stage1', { stageId: 'stage1', state: 'completed', retries: 0 }],
        ['stage2', { stageId: 'stage2', state: 'running', retries: 0 }]
      ]),
      variables: {},
      createdAt: new Date().toISOString()
    }
    const progress = tracker.trackProgress(execution, 3)
    expect(progress.completedStages).toBe(1)
    expect(progress.progress).toBeGreaterThan(0)
  })
})
