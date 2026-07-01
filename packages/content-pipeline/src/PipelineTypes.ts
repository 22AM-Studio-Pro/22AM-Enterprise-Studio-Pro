export type PipelineStageType =
  | 'prompt'
  | 'script_generation'
  | 'fact_check'
  | 'voice_generation'
  | 'image_generation'
  | 'video_generation'
  | 'subtitle_generation'
  | 'timeline_assembly'
  | 'rendering'
  | 'asset_storage'
  | 'publishing_queue'
  | 'custom'

export type PipelineExecutionMode = 'sequential' | 'parallel'

export type PipelineStageDefinition = {
  id: string
  type: PipelineStageType
  name: string
  description?: string
  enabled: boolean
  config?: Record<string, any>
  dependencies?: string[]
  timeout?: number
  retryPolicy?: { maxAttempts: number; backoffMs: number }
  errorHandling?: 'fail' | 'skip' | 'continue'
}

export type PipelineDefinition = {
  id: string
  name: string
  description?: string
  stages: PipelineStageDefinition[]
  mode: PipelineExecutionMode
  variables?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export type PipelineExecutionState = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'

export type StageExecutionState = 'pending' | 'running' | 'completed' | 'failed' | 'retried' | 'skipped'

export type StageExecution = {
  stageId: string
  state: StageExecutionState
  startedAt?: string
  completedAt?: string
  duration?: number
  output?: any
  error?: string
  retries: number
}

export type PipelineExecution = {
  id: string
  pipelineId: string
  state: PipelineExecutionState
  startedAt?: string
  completedAt?: string
  duration?: number
  stageExecutions: Map<string, StageExecution>
  variables: Record<string, any>
  checkpointId?: string
  error?: string
  createdAt: string
}
