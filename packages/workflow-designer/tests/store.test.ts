import { describe, it, expect } from 'vitest'
import { useDesignerStore } from '../src/DesignerStore'
import { NodeFactory } from '../src/NodePalette'

describe('DesignerStore', () => {
  it('initializes with empty workflow', () => {
    const store = useDesignerStore()
    expect(store.workflow.nodes.length).toBe(0)
    expect(store.workflow.edges.length).toBe(0)
  })

  it('adds and removes nodes', () => {
    const store = useDesignerStore()
    const node = NodeFactory.createNode('ai', 'Text Generation', 0, 0)
    store.addNode(node)
    expect(store.workflow.nodes.length).toBe(1)

    store.deleteNode(node.id)
    expect(store.workflow.nodes.length).toBe(0)
  })

  it('undo/redo functionality', () => {
    const store = useDesignerStore()
    const node1 = NodeFactory.createNode('ai', 'Node 1', 0, 0)
    store.addNode(node1)
    store.save()

    const node2 = NodeFactory.createNode('ai', 'Node 2', 100, 0)
    store.addNode(node2)
    store.save()

    expect(store.workflow.nodes.length).toBe(2)
    expect(store.canUndo()).toBe(true)

    store.undo()
    expect(store.workflow.nodes.length).toBe(1)
    expect(store.canRedo()).toBe(true)

    store.redo()
    expect(store.workflow.nodes.length).toBe(2)
  })
})
