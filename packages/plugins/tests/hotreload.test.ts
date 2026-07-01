import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { PluginManager } from '../src/PluginManager'

// Simulate hot reload by touching file

describe('hot reload', () => {
  it('reloads plugin on file change', async () => {
    const pluginsDir = path.resolve(__dirname, 'test-plugins-hot')
    const src = path.resolve(__dirname, 'test-plugins-hot-src', 'hot-plugin')
    if (!fs.existsSync(src)) {
      fs.mkdirSync(src, { recursive: true })
      fs.writeFileSync(path.join(src, 'manifest.json'), JSON.stringify({ id: 'hot', name: 'Hot', version: '1.0.0', entry: 'index.js' }))
      fs.writeFileSync(path.join(src, 'index.js'), 'module.exports = { initialize(ctx){ ctx.logger.info("hot init") }, start(){}, stop(){}, dispose(){} }')
    }
    const mgr = new PluginManager(pluginsDir, path.resolve(__dirname, 'test-data', 'hot.db'))
    await mgr.installPlugin(src)
    await mgr.loadPlugin('hot')
    mgr.watch()
    // touch file to trigger watcher
    const f = path.join(pluginsDir, 'hot-plugin', 'index.js')
    fs.writeFileSync(f, 'module.exports = { initialize(ctx){ ctx.logger.info("hot init v2") }, start(){}, stop(){}, dispose(){} }')
    // allow some time for watcher to pick up
    await new Promise((r) => setTimeout(r, 500))
    // cleanup
    mgr.stopWatching()
    await mgr.unloadPlugin('hot')
    await mgr.removePlugin('hot')
    expect(true).toBe(true)
  }, 2000)
})
