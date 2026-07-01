import fs from 'fs-extra'
import path from 'path'
import { Persistence } from '../persistence'
import { validateWorkflow } from '../validator'

export class WorkflowImporter {
  private persistence: Persistence

  constructor(persistence: Persistence) {
    this.persistence = persistence
  }

  async importFromFile(filePath: string) {
    const abs = path.resolve(filePath)
    const exists = await fs.pathExists(abs)
    if (!exists) throw new Error(`file not found: ${abs}`)

    const raw = await fs.readFile(abs, 'utf-8')
    let doc: any
    try {
      doc = JSON.parse(raw)
    } catch (e) {
      throw new Error('invalid JSON')
    }

    // validate
    try {
      validateWorkflow(doc)
    } catch (e: any) {
      throw new Error(`validation failed: ${e.message}`)
    }

    if (!doc.id) throw new Error('workflow must have id')

    // compute checksum
    const checksum = this.persistence.computeChecksum(doc)
    const existing = this.persistence.getWorkflow(doc.id)

    if (existing && existing.checksum && existing.checksum === checksum) {
      return { id: doc.id, status: 'duplicate', message: 'workflow already exists with same checksum' }
    }

    if (existing && existing.checksum && existing.checksum !== checksum) {
      // version upgrade handling: bump patch
      const prevVersion = existing.version ?? '1.0.0'
      const parts = prevVersion.split('.').map((p: string) => parseInt(p, 10) || 0)
      parts[2] = (parts[2] || 0) + 1
      const newVersion = `${parts[0]}.${parts[1]}.${parts[2]}`
      doc.version = newVersion
    }

    // ensure version exists
    if (!doc.version) doc.version = '1.0.0'

    // save (upsert)
    this.persistence.saveWorkflow(doc)

    return { id: doc.id, status: existing ? 'updated' : 'created', checksum }
  }
}
