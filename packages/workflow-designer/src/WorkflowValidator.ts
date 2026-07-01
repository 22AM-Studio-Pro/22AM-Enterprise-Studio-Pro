import { WorkflowDefinition, ValidationError, WorkflowNode, WorkflowEdge } from './WorkflowTypes'

export class WorkflowValidator {
  validate(workflow: WorkflowDefinition): ValidationError[] {
    const errors: ValidationError[] = []

    // Validate nodes
    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push({ message: 'Workflow must have at least one node', severity: 'error' })
    }

    const nodeIds = new Set<string>()
    for (const node of workflow.nodes || []) {
      if (!node.id || node.id.trim() === '') {
        errors.push({ nodeId: node.id, message: 'Node ID is required', severity: 'error' })
      }
      if (!node.type) {
        errors.push({ nodeId: node.id, message: 'Node type is required', severity: 'error' })
      }
      if (nodeIds.has(node.id)) {
        errors.push({ nodeId: node.id, message: 'Duplicate node ID', severity: 'error' })
      }
      nodeIds.add(node.id)
    }

    // Validate edges
    for (const edge of workflow.edges || []) {
      if (!nodeIds.has(edge.source)) {
        errors.push({ edgeId: edge.id, message: `Source node ${edge.source} not found`, severity: 'error' })
      }
      if (!nodeIds.has(edge.target)) {
        errors.push({ edgeId: edge.id, message: `Target node ${edge.target} not found`, severity: 'error' })
      }
    }

    // Detect circular dependencies
    const circular = this.detectCircular(workflow.nodes || [], workflow.edges || [])
    for (const nodeId of circular) {
      errors.push({ nodeId, message: 'Circular dependency detected', severity: 'error' })
    }

    return errors
  }

  private detectCircular(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
    const graph = new Map<string, string[]>()
    for (const node of nodes) {
      graph.set(node.id, [])
    }
    for (const edge of edges) {
      graph.get(edge.source)?.push(edge.target)
    }

    const visited = new Set<string>()
    const recStack = new Set<string>()
    const circular: string[] = []

    const dfs = (node: string): boolean => {
      visited.add(node)
      recStack.add(node)

      for (const neighbor of graph.get(node) || []) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true
        } else if (recStack.has(neighbor)) {
          circular.push(neighbor)
          return true
        }
      }

      recStack.delete(node)
      return false
    }

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id)
      }
    }

    return circular
  }
}
