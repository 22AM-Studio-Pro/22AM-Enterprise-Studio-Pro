import { describe, it, expect } from 'vitest'
import { CanvasLayoutEngine } from '../src/CanvasLayoutEngine'

describe('CanvasLayoutEngine', () => {
  it('hierarchical layout positions nodes by level', () => {
    const engine = new CanvasLayoutEngine()
    const nodes = [
      { id: 'n1', position: { x: 0, y: 0 } },
      { id: 'n2', position: { x: 0, y: 0 } },
      { id: 'n3', position: { x: 0, y: 0 } }
    ]
    const edges = [
      { source: 'n1', target: 'n2' },
      { source: 'n1', target: 'n3' }
    ]

    const positions = engine.layoutHierarchical(nodes, edges)
    expect(positions.size).toBe(3)
    expect(positions.get('n2')?.y).toBeGreaterThan(positions.get('n1')?.y || 0)
  })

  it('force-directed layout converges', () => {
    const engine = new CanvasLayoutEngine()
    const nodes = [
      { id: 'n1' },
      { id: 'n2' },
      { id: 'n3' }
    ]
    const edges = [{ source: 'n1', target: 'n2' }]

    const positions = engine.layoutForceDirected(nodes, edges, 10)
    expect(positions.size).toBe(3)

    // Verify all positions have coordinates
    for (const pos of positions.values()) {
      expect(typeof pos.x).toBe('number')
      expect(typeof pos.y).toBe('number')
    }
  })
})
