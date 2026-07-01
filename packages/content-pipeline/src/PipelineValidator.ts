import { PipelineDefinition, PipelineStageDefinition } from './PipelineTypes'

export class PipelineValidator {
  validate(pipeline: PipelineDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!pipeline.id || pipeline.id.trim() === '') errors.push('Pipeline ID is required')
    if (!pipeline.name || pipeline.name.trim() === '') errors.push('Pipeline name is required')
    if (!pipeline.stages || pipeline.stages.length === 0) errors.push('Pipeline must have at least one stage')

    // Validate stage dependencies
    const stageIds = new Set(pipeline.stages.map((s) => s.id))
    for (const stage of pipeline.stages) {
      if (stage.dependencies) {
        for (const dep of stage.dependencies) {
          if (!stageIds.has(dep)) errors.push(`Stage ${stage.id} depends on unknown stage ${dep}`)
        }
      }
    }

    // Check for circular dependencies
    if (this.hasCyclicDependency(pipeline.stages)) {
      errors.push('Pipeline has circular dependencies')
    }

    return { valid: errors.length === 0, errors }
  }

  private hasCyclicDependency(stages: PipelineStageDefinition[]): boolean {
    const visited = new Set<string>()
    const recStack = new Set<string>()

    const dfs = (stageId: string): boolean => {
      visited.add(stageId)
      recStack.add(stageId)

      const stage = stages.find((s) => s.id === stageId)
      if (stage?.dependencies) {
        for (const dep of stage.dependencies) {
          if (!visited.has(dep)) {
            if (dfs(dep)) return true
          } else if (recStack.has(dep)) {
            return true
          }
        }
      }

      recStack.delete(stageId)
      return false
    }

    for (const stage of stages) {
      if (!visited.has(stage.id)) {
        if (dfs(stage.id)) return true
      }
    }

    return false
  }
}
