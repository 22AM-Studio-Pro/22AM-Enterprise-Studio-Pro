import { describe, it, expect, beforeEach } from 'vitest'
import { PluginManager } from '../src/PluginManager'
import fs from 'fs'
import path from 'path'

const pluginsDir = path.resolve(__dirname, 'test-plugins')

beforeEach(() => {
  // ensure test plugins dir exists
  if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true })
})

describe('PluginManager lifecycle', () => {
  it('installs, loads, unloads and removes a plugin', async () => {
    const src = path.resolve(__dirname, 'test-plugins-src', 'hello-plugin')
    const folder = path.resolve(pluginsDir, 'hello-plugin')
    // ensure source plugin exists
    if (!fs.existsSync(src)) {
      fs.mkdirSync(src, { recursive: true })
      fs.writeFileSync(path.join(src, 'manifest.json'), JSON.stringify({ id: 'hello', name: 'Hello', version: '1.0.0', entry: 'index.js' }))
      fs.writeFileSync(path.join(src, 'index.js'), 'module.exports = { initialize(ctx){ ctx.logger.info("hi") }, start(){}, stop(){}, dispose(){} }')
    }

    const mgr = new PluginManager(pluginsDir, path.resolve(__dirname, 'test-data', 'pm.db'))
    // install copies into pluginsDir
    const installed = await mgr.installPlugin(src)
    expect(installed.id).toBe('hello')
    // load
    const p = await mgr.loadPlugin('hello')
    expect(p).toBeDefined()
    // unload
    const ok = await mgr.unloadPlugin('hello')
    expect(ok).toBe(true)
    // remove
    const rem = await mgr.removePlugin('hello')
    expect(rem).toBe(true)
  })
})
