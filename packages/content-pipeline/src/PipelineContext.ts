import { PipelineExecution, PipelineExecutionState, StageExecution, StageExecutionState } from './PipelineTypes'

export type PipelineContext = {
  execution: PipelineExecution
  variables: Record<string, any>
  assets: Map<string, any>
  providerOutputs: Map<string, any>
  setCancelled: boolean
}

export class PipelineContextManager {
  createContext(execution: PipelineExecution): PipelineContext {
    return {
      execution,
      variables: { ...execution.variables },
      assets: new Map(),
      providerOutputs: new Map(),
      setCancelled: false
    }
  }

  updateExecutionState(ctx: PipelineContext, state: PipelineExecutionState) {
    ctx.execution.state = state
  }

  recordStageExecution(ctx: PipelineContext, stageExecution: StageExecution) {
    ctx.execution.stageExecutions.set(stageExecution.stageId, stageExecution)
  }

  storeAsset(ctx: PipelineContext, key: string, asset: any) {
    ctx.assets.set(key, asset)
  }

  getAsset(ctx: PipelineContext, key: string): any {
    return ctx.assets.get(key)
  }

  storeProviderOutput(ctx: PipelineContext, providerName: string, output: any) {
    ctx.providerOutputs.set(providerName, output)
  }

  getProviderOutput(ctx: PipelineContext, providerName: string): any {
    return ctx.providerOutputs.get(providerName)
  }
}
