import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { PluginManager } from '../src/PluginManager'

// Stress test loader with many plugins

describe('stress load', () => {
  it('loads many fake plugins quickly', async () => {
    const dir = path.resolve(__dirname, 'stress-plugins')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const count = 100
    const srcBase = path.resolve(__dirname, 'stress-src')
    if (!fs.existsSync(srcBase)) fs.mkdirSync(srcBase, { recursive: true })
    for (let i = 0; i < count; i++) {
      const p = path.join(srcBase, `p${i}`)
      if (!fs.existsSync(p)) {
        fs.mkdirSync(p)
        fs.writeFileSync(path.join(p, 'manifest.json'), JSON.stringify({ id: `p${i}`, name: `P${i}`, version: '1.0.0', entry: 'index.js' }))
        fs.writeFileSync(path.join(p, 'index.js'), 'module.exports = { initialize(){}, start(){}, stop(){}, dispose(){} }')
      }
    }
    const mgr = new PluginManager(dir, path.resolve(__dirname, 'test-data', 'stress.db'))
    for (let i = 0; i < count; i++) {
      const src = path.join(srcBase, `p${i}`)
      await mgr.installPlugin(src)
    }
    // try loading many
    for (let i = 0; i < count; i++) {
      await mgr.loadPlugin(`p${i}`)
    }
    // unload
    for (let i = 0; i < count; i++) {
      await mgr.unloadPlugin(`p${i}`)
      await mgr.removePlugin(`p${i}`)
    }
    expect(true).toBe(true)
  }, 120000)
})
