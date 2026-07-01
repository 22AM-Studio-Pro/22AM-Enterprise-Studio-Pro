import { describe, it, expect } from 'vitest'
import { PipelineValidator } from '../src/PipelineValidator'
import { PipelineDefinition } from '../src/PipelineTypes'

describe('PipelineValidator', () => {
  it('validates a correct pipeline', () => {
    const validator = new PipelineValidator()
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
    const result = validator.validate(pipeline)
    expect(result.valid).toBe(true)
    expect(result.errors.length).toBe(0)
  })

  it('detects missing stage dependencies', () => {
    const validator = new PipelineValidator()
    const pipeline: PipelineDefinition = {
      id: 'test-pipeline',
      name: 'Test Pipeline',
      stages: [
        { id: 'stage1', type: 'prompt', name: 'Prompt', enabled: true },
        { id: 'stage2', type: 'script_generation', name: 'Script', enabled: true, dependencies: ['unknown'] }
      ],
      mode: 'sequential',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const result = validator.validate(pipeline)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('detects circular dependencies', () => {
    const validator = new PipelineValidator()
    const pipeline: PipelineDefinition = {
      id: 'test-pipeline',
      name: 'Test Pipeline',
      stages: [
        { id: 'stage1', type: 'prompt', name: 'Prompt', enabled: true, dependencies: ['stage2'] },
        { id: 'stage2', type: 'script_generation', name: 'Script', enabled: true, dependencies: ['stage1'] }
      ],
      mode: 'sequential',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const result = validator.validate(pipeline)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('circular'))).toBe(true)
  })
})
