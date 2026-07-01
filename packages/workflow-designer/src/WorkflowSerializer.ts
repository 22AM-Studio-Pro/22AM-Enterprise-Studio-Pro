import { WorkflowDefinition } from './WorkflowTypes'

export class WorkflowSerializer {
  static export(workflow: WorkflowDefinition): string {
    return JSON.stringify(workflow, null, 2)
  }

  static import(json: string): WorkflowDefinition {
    const parsed = JSON.parse(json)
    // Validate structure
    if (!parsed.id || !parsed.nodes || !parsed.edges) {
      throw new Error('Invalid workflow format')
    }
    return parsed
  }

  static exportAsYAML(workflow: WorkflowDefinition): string {
    const lines: string[] = []
    lines.push(`id: ${workflow.id}`)
    lines.push(`name: ${workflow.name}`)
    lines.push(`description: ${workflow.description || ''}`)
    lines.push(`nodes:`)

    for (const node of workflow.nodes) {
      lines.push(`  - id: ${node.id}`)
      lines.push(`    type: ${node.type}`)
      lines.push(`    label: ${node.label}`)
      lines.push(`    position: [${node.position.x}, ${node.position.y}]`)
    }

    lines.push(`edges:`)
    for (const edge of workflow.edges) {
      lines.push(`  - id: ${edge.id}`)
      lines.push(`    source: ${edge.source}`)
      lines.push(`    target: ${edge.target}`)
    }

    return lines.join('\n')
  }

  static downloadJSON(workflow: WorkflowDefinition, filename?: string) {
    const json = this.export(workflow)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `${workflow.name}.workflow.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  static downloadYAML(workflow: WorkflowDefinition, filename?: string) {
    const yaml = this.exportAsYAML(workflow)
    const blob = new Blob([yaml], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `${workflow.name}.workflow.yaml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
