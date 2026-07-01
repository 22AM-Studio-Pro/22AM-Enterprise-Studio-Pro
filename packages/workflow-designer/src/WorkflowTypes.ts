export type NodeType = 'ai' | 'asset' | 'publishing' | 'logic' | 'input' | 'output'

export type WorkflowNode = {
  id: string
  type: NodeType
  label: string
  position: { x: number; y: number }
  data: Record<string, any>
  disabled?: boolean
}

export type WorkflowEdge = {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  animated?: boolean
  label?: string
}

export type WorkflowDefinition = {
  id: string
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  createdAt: string
  updatedAt: string
}

export type ValidationError = {
  nodeId?: string
  edgeId?: string
  message: string
  severity: 'error' | 'warning'
}
