#!/usr/bin/env node

import path from 'path'
import { Persistence } from '../persistence'
import { WorkflowImporter } from '../importExport/WorkflowImporter'
import { WorkflowExporter } from '../importExport/WorkflowExporter'

async function main() {
  const args = process.argv.slice(2)
  const cmd = args[0]
  const dbPath = process.env.WORKFLOW_DB_PATH
  const persistence = new Persistence(dbPath)
  const importer = new WorkflowImporter(persistence)
  const exporter = new WorkflowExporter(persistence)

  try {
    if (cmd === 'import') {
      const file = args[1]
      if (!file) throw new Error('usage: workflow import <file>')
      const res = await importer.importFromFile(file)
      console.log('import result:', res)
    } else if (cmd === 'export') {
      const id = args[1]
      const out = args[2] ?? `./${id}.json`
      if (!id) throw new Error('usage: workflow export <workflowId> [output]')
      const res = await exporter.exportToFile(id, out)
      console.log('exported to', res.filePath)
    } else {
      console.log('usage: workflow <import|export> ...')
    }
  } catch (e: any) {
    console.error('error:', e.message)
    process.exitCode = 1
  }
}

main()
