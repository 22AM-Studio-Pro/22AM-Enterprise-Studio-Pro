import { describe, it, expect } from 'vitest'
import { WorkflowValidator } from '../src/WorkflowValidator'
import { WorkflowDefinition } from '../src/WorkflowTypes'

describe('WorkflowValidator', () => {
  it('validates correct workflow', () => {
    const validator = new WorkflowValidator()
    const workflow: WorkflowDefinition = {
      id: 'wf-1',
      name: 'Test Workflow',
      nodes: [{ id: 'n1', type: 'ai', label: 'AI Node', position: { x: 0, y: 0 }, data: {} }],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const errors = validator.validate(workflow)
    expect(errors.length).toBe(0)
  })

  it('detects missing nodes', () => {
    const validator = new WorkflowValidator()
    const workflow: WorkflowDefinition = {
      id: 'wf-1',
      name: 'Test Workflow',
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const errors = validator.validate(workflow)
    expect(errors.some((e) => e.severity === 'error')).toBe(true)
  })

  it('detects circular dependencies', () => {
    const validator = new WorkflowValidator()
    const workflow: WorkflowDefinition = {
      id: 'wf-1',
      name: 'Test Workflow',
      nodes: [
        { id: 'n1', type: 'ai', label: 'AI Node 1', position: { x: 0, y: 0 }, data: {} },
        { id: 'n2', type: 'ai', label: 'AI Node 2', position: { x: 100, y: 0 }, data: {} }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n1' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const errors = validator.validate(workflow)
    expect(errors.some((e) => e.message.includes('Circular'))).toBe(true)
  })
})
