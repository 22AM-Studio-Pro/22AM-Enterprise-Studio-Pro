import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { PluginRegistry } from '../src/PluginRegistry'

const dbPath = path.resolve(__dirname, 'test-data', 'plugins.db')

describe('PluginRegistry', () => {
  it('registers and lists plugins', () => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
    const reg = new PluginRegistry(dbPath)
    const manifest = { id: 'a', name: 'A', version: '1.0.0', entry: 'index.js' }
    reg.register(manifest as any, '/tmp/a', true)
    const list = reg.list()
    expect(list.length).toBeGreaterThan(0)
    const g = reg.get('a')
    expect(g).toBeDefined()
    reg.unregister('a')
    const g2 = reg.get('a')
    expect(g2).toBeUndefined()
  })
})
