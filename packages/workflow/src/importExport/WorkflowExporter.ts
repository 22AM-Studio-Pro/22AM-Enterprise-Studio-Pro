import fs from 'fs-extra'
import path from 'path'
import { Persistence } from '../persistence'

export class WorkflowExporter {
  private persistence: Persistence

  constructor(persistence: Persistence) {
    this.persistence = persistence
  }

  async exportToFile(workflowId: string, filePath: string) {
    const wf = this.persistence.getWorkflow(workflowId)
    if (!wf) throw new Error('workflow not found')

    const dir = path.dirname(filePath)
    await fs.ensureDir(dir)
    // include checksum and metadata in export
    const payload = {
      id: wf.id,
      version: wf.version,
      name: wf.name,
      description: wf.description,
      body: wf,
      checksum: (wf as any).checksum ?? this.persistence.computeChecksum(wf)
    }

    await fs.writeFile(filePath, JSON.stringify(wf, null, 2), 'utf-8')
    return { workflowId, filePath }
  }
}
