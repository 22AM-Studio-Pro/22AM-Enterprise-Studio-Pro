import { describe, it, expect } from 'vitest'
import { PipelineEngine } from '../src/PipelineEngine'
import { PipelineDefinition } from '../src/PipelineTypes'
import path from 'path'
import fs from 'fs-extra'

const dbPath = path.resolve(__dirname, 'test-data', 'pipeline.db')

beforeEach(() => {
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
})

describe('PipelineEngine', () => {
  it('executes a simple pipeline', async () => {
    const engine = new PipelineEngine(dbPath)
    const pipeline: PipelineDefinition = {
      id: 'test-pipeline',
      name: 'Test Pipeline',
      stages: [
        { id: 'stage1', type: 'prompt', name: 'Prompt', enabled: true },
        { id: 'stage2', type: 'script_generation', name: 'Script', enabled: true, dependencies: ['stage1'] }
      ],
      mode: 'sequential',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const execution = await engine.executeSync(pipeline)
    expect(execution.state).toBe('completed')
    expect(execution.stageExecutions.size).toBeGreaterThan(0)
  })

  it('skips disabled stages', async () => {
    const engine = new PipelineEngine(dbPath)
    const pipeline: PipelineDefinition = {
      id: 'test-pipeline-2',
      name: 'Test Pipeline 2',
      stages: [
        { id: 'stage1', type: 'prompt', name: 'Prompt', enabled: true },
        { id: 'stage2', type: 'script_generation', name: 'Script', enabled: false }
      ],
      mode: 'sequential',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const execution = await engine.executeSync(pipeline)
    const stage2 = execution.stageExecutions.get('stage2')
    expect(stage2?.state).toBe('skipped')
  })

  it('retrieves saved execution from persistence', async () => {
    const engine = new PipelineEngine(dbPath)
    const pipeline: PipelineDefinition = {
      id: 'test-pipeline-3',
      name: 'Test Pipeline 3',
      stages: [{ id: 'stage1', type: 'prompt', name: 'Prompt', enabled: true }],
      mode: 'sequential',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const execution = await engine.executeSync(pipeline)
    const retrieved = (engine as any).persistence.getExecution(execution.id)
    expect(retrieved?.id).toBe(execution.id)
    expect(retrieved?.state).toBe('completed')
  })
})
