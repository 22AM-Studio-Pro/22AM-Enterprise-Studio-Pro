import EventEmitter from 'eventemitter3'

export const pipelineEvents = new EventEmitter()

export type PipelineEventPayloads = {
  'pipeline.created': { pipelineId: string }
  'pipeline.started': { executionId: string }
  'pipeline.paused': { executionId: string }
  'pipeline.resumed': { executionId: string }
  'pipeline.completed': { executionId: string }
  'pipeline.failed': { executionId: string; error: string }
  'pipeline.cancelled': { executionId: string }
  'stage.started': { executionId: string; stageId: string }
  'stage.completed': { executionId: string; stageId: string }
  'stage.failed': { executionId: string; stageId: string; error: string }
  'stage.retried': { executionId: string; stageId: string; attempt: number }
}
