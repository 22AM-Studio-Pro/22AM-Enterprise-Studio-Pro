import { describe, it, expect } from 'vitest'
import { WorkflowSerializer } from '../src/WorkflowSerializer'
import { WorkflowDefinition } from '../src/WorkflowTypes'

describe('WorkflowSerializer', () => {
  const mockWorkflow: WorkflowDefinition = {
    id: 'wf-1',
    name: 'Test Workflow',
    description: 'A test workflow',
    nodes: [
      { id: 'n1', type: 'ai', label: 'AI Node', position: { x: 0, y: 0 }, data: {} },
      { id: 'n2', type: 'publishing', label: 'Publish', position: { x: 100, y: 0 }, data: {} }
    ],
    edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  it('exports and imports JSON', () => {
    const json = WorkflowSerializer.export(mockWorkflow)
    const imported = WorkflowSerializer.import(json)
    expect(imported.id).toBe(mockWorkflow.id)
    expect(imported.nodes.length).toBe(2)
    expect(imported.edges.length).toBe(1)
  })

  it('exports YAML format', () => {
    const yaml = WorkflowSerializer.exportAsYAML(mockWorkflow)
    expect(yaml).toContain('id: wf-1')
    expect(yaml).toContain('name: Test Workflow')
    expect(yaml).toContain('nodes:')
    expect(yaml).toContain('edges:')
  })

  it('validates workflow format on import', () => {
    const invalid = '{"id":"wf-1"}' // Missing nodes and edges
    expect(() => WorkflowSerializer.import(invalid)).toThrow('Invalid workflow format')
  })
})
