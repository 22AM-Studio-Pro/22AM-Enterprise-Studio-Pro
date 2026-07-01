import fs from 'fs'
import path from 'path'

export default function ensureDirs() {
  const d = path.resolve(process.cwd(), 'packages/plugins/data')
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
}
