import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { Persistence } from '../src/persistence'
import { WorkflowImporter } from '../src/importExport/WorkflowImporter'
import { WorkflowExporter } from '../src/importExport/WorkflowExporter'

const tmpDir = path.resolve(__dirname, 'test-data')

describe('import/export', () => {
  const dbPath = path.join(tmpDir, 'importexport.db')
  beforeEach(() => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
  })

  it('imports a valid workflow and exports it', async () => {
    const persistence = new Persistence(dbPath)
    const importer = new WorkflowImporter(persistence)
    const exporter = new WorkflowExporter(persistence)

    const wf = { id: 'imp1', name: 'imp', nodes: [{ id: 't1', type: 'task', task: 'echo', input: { msg: 'x' } }] }
    const file = path.join(tmpDir, 'wf.json')
    fs.writeFileSync(file, JSON.stringify(wf))

    const res = await importer.importFromFile(file)
    expect(res).toHaveProperty('id', 'imp1')

    const out = path.join(tmpDir, 'out.json')
    const exp = await exporter.exportToFile('imp1', out)
    expect(fs.existsSync(out)).toBe(true)

    // re-import exported workflow
    const res2 = await importer.importFromFile(out)
    // should detect duplicate (same checksum)
    expect(res2).toHaveProperty('status')
  })

  it('rejects invalid workflow', async () => {
    const persistence = new Persistence(dbPath)
    const importer = new WorkflowImporter(persistence)
    const badFile = path.join(tmpDir, 'bad.json')
    fs.writeFileSync(badFile, JSON.stringify({ foo: 'bar' }))
    await expect(importer.importFromFile(badFile)).rejects.toThrow()
  })
})
