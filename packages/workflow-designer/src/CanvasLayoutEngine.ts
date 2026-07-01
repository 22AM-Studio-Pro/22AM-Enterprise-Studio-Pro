export class CanvasLayoutEngine {
  /**
   * Daggre-style hierarchical layout for workflow DAGs
   */
  layoutHierarchical(nodes: Array<{ id: string; position: { x: number; y: number } }>, edges: Array<{ source: string; target: string }>) {
    // Group nodes by depth (topological sort)
    const graph = new Map<string, string[]>()
    const inDegree = new Map<string, number>()

    for (const node of nodes) {
      if (!graph.has(node.id)) graph.set(node.id, [])
      if (!inDegree.has(node.id)) inDegree.set(node.id, 0)
    }

    for (const edge of edges) {
      graph.get(edge.source)?.push(edge.target)
      inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1)
    }

    // Topological sort
    const queue: string[] = []
    const levels = new Map<string, number>()

    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0) queue.push(nodeId)
    }

    let level = 0
    while (queue.length > 0) {
      const levelSize = queue.length
      for (let i = 0; i < levelSize; i++) {
        const nodeId = queue.shift()!
        levels.set(nodeId, level)

        for (const neighbor of graph.get(nodeId) || []) {
          inDegree.set(neighbor, (inDegree.get(neighbor) ?? 0) - 1)
          if (inDegree.get(neighbor) === 0) queue.push(neighbor)
        }
      }
      level++
    }

    // Position nodes
    const levelGroups = new Map<number, string[]>()
    for (const [nodeId, lvl] of levels.entries()) {
      if (!levelGroups.has(lvl)) levelGroups.set(lvl, [])
      levelGroups.get(lvl)?.push(nodeId)
    }

    const positions = new Map<string, { x: number; y: number }>()
    const nodeWidth = 200
    const nodeHeight = 100
    const horizontalSpacing = 250
    const verticalSpacing = 150

    for (const [lvl, nodeIds] of levelGroups.entries()) {
      const yPos = lvl * verticalSpacing
      const totalWidth = nodeIds.length * horizontalSpacing
      const startX = -totalWidth / 2

      for (let i = 0; i < nodeIds.length; i++) {
        positions.set(nodeIds[i], {
          x: startX + i * horizontalSpacing,
          y: yPos
        })
      }
    }

    return positions
  }

  /**
   * Force-directed layout for general graphs
   */
  layoutForceDirected(
    nodes: Array<{ id: string }>,
    edges: Array<{ source: string; target: string }>,
    iterations: number = 50
  ) {
    const positions = new Map<string, { x: number; y: number; vx: number; vy: number }>()
    const k = Math.sqrt(1000 / nodes.length) // Spring constant
    const c = 0.1 // Damping
    const maxForce = 5

    // Initialize positions randomly
    for (const node of nodes) {
      positions.set(node.id, {
        x: Math.random() * 500,
        y: Math.random() * 500,
        vx: 0,
        vy: 0
      })
    }

    // Simulate
    for (let iter = 0; iter < iterations; iter++) {
      // Reset forces
      for (const pos of positions.values()) {
        pos.vx = 0
        pos.vy = 0
      }

      // Repulsive forces (node-node)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const p1 = positions.get(nodes[i].id)!
          const p2 = positions.get(nodes[j].id)!
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1
          const force = (k * k) / dist
          p1.vx += (force * dx) / dist
          p1.vy += (force * dy) / dist
          p2.vx -= (force * dx) / dist
          p2.vy -= (force * dy) / dist
        }
      }

      // Attractive forces (edges)
      for (const edge of edges) {
        const p1 = positions.get(edge.source)!
        const p2 = positions.get(edge.target)!
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1
        const force = (dist * dist) / k
        p1.vx += (force * dx) / dist
        p1.vy += (force * dy) / dist
        p2.vx -= (force * dx) / dist
        p2.vy -= (force * dy) / dist
      }

      // Apply velocities
      for (const pos of positions.values()) {
        const dist = Math.sqrt(pos.vx * pos.vx + pos.vy * pos.vy)
        if (dist > maxForce) {
          pos.vx = (pos.vx / dist) * maxForce
          pos.vy = (pos.vy / dist) * maxForce
        }
        pos.x += pos.vx * c
        pos.y += pos.vy * c
      }
    }

    return new Map([...positions].map(([id, pos]) => [id, { x: pos.x, y: pos.y }]))
  }
}
