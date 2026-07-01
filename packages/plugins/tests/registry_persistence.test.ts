import fs from 'fs'
import path from 'path'
import { PluginRegistry } from '../src/PluginRegistry'

const dbPath = path.resolve(__dirname, 'test-data', 'plugins_persist.db')

describe('PluginRegistry persistence', () => {
  it('persists permissions, dependencies, checksum and metadata', () => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
    const reg = new PluginRegistry(dbPath)
    const manifest = { id: 'p1', name: 'P1', version: '1.0.0', entry: 'index.js', permissions: ['filesystem.read'], dependencies: { 'a': '^1.0.0' } }
    reg.register(manifest as any, '/tmp/p1', true)
    const g = reg.get('p1')
    expect(g).toBeDefined()
    expect(g?.permissions).toContain('filesystem.read')
    expect(g?.dependencies).toBeDefined()
    expect(g?.checksum).toBeDefined()
    expect(g?.installedAt).toBeDefined()
    // append metric/error
    reg.appendMetric('p1', { name: 'load_time', value: 123 })
    reg.appendError('p1', { when: new Date().toISOString(), message: 'oops' })
    const g2 = reg.get('p1')
    expect(g2?.metrics?.length).toBeGreaterThan(0)
    expect(g2?.errors?.length).toBeGreaterThan(0)
  })
})
