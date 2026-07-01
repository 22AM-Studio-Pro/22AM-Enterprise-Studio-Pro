export type NodeType =
  | 'start'
  | 'end'
  | 'task'
  | 'sequence'
  | 'parallel'
  | 'conditional'
  | 'loop'
  | 'delay'
  | 'retry'

export type BaseNode = {
  id: string
  type: NodeType
  name?: string
}

export type TaskNode = BaseNode & {
  type: 'task'
  task: string
  input?: Record<string, unknown>
}

export type SequenceNode = BaseNode & {
  type: 'sequence'
  nodes: WorkflowNode[]
}

export type ParallelNode = BaseNode & {
  type: 'parallel'
  nodes: WorkflowNode[]
}

export type ConditionalNode = BaseNode & {
  type: 'conditional'
  condition: string // expression evaluated against context
  then: WorkflowNode
  otherwise?: WorkflowNode
}

export type LoopNode = BaseNode & {
  type: 'loop'
  condition: string // evaluated per iteration
  body: WorkflowNode
  maxIterations?: number
}

export type DelayNode = BaseNode & {
  type: 'delay'
  ms: number
}

export type RetryNode = BaseNode & {
  type: 'retry'
  attempts: number
  delayMs?: number
  node: WorkflowNode
}

export type WorkflowNode =
  | TaskNode
  | SequenceNode
  | ParallelNode
  | ConditionalNode
  | LoopNode
  | DelayNode
  | RetryNode

export type Workflow = {
  id: string
  version?: string
  name: string
  description?: string
  nodes: WorkflowNode[]
}

export type ExecutionStatus = 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'

export type NodeExecutionRecord = {
  executionId: string
  nodeId: string
  nodeType: NodeType
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt?: string
  finishedAt?: string
  result?: unknown
  error?: string
}

export type WorkflowExecution = {
  id: string
  workflowId: string
  status: ExecutionStatus
  createdAt: string
  updatedAt?: string
}
