import { describe, it, expect } from 'vitest'
import { MetricsCollector } from '../src/PipelineMetrics'

describe('MetricsCollector', () => {
  it('creates and collects metrics', () => {
    const collector = new MetricsCollector()
    const metrics = collector.createMetrics('exec-1', 'pipeline-1')
    expect(metrics.executionId).toBe('exec-1')
    expect(metrics.pipelineId).toBe('pipeline-1')
  })

  it('records stage durations', () => {
    const collector = new MetricsCollector()
    collector.createMetrics('exec-1', 'pipeline-1')
    collector.recordStageDuration('exec-1', 'stage1', 100)
    const metrics = collector.getMetrics('exec-1')
    expect(metrics?.stageDurations.get('stage1')).toBe(100)
  })

  it('records provider usage and token counts', () => {
    const collector = new MetricsCollector()
    collector.createMetrics('exec-1', 'pipeline-1')
    collector.recordProvider('exec-1', 'openai')
    collector.recordTokenUsage('exec-1', 'openai', 1000)
    const metrics = collector.getMetrics('exec-1')
    expect(metrics?.providersUsed).toContain('openai')
    expect(metrics?.tokenUsage.get('openai')).toBe(1000)
  })
})
