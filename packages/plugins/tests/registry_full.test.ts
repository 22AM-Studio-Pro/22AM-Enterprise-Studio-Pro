import { describe, it, expect } from 'vitest'
import { PluginRegistry } from '../src/PluginRegistry'
import fs from 'fs'
import path from 'path'

const dbPath = path.resolve(__dirname, 'test-data', 'registry_full.db')

describe('registry full persistence', () => {
  it('persists full metadata and can retrieve it', () => {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
    const reg = new PluginRegistry(dbPath)
    const manifest = { id: 'full', name: 'Full', version: '1.0.0', entry: 'index.js', permissions: ['filesystem.read'], dependencies: { a: '^1.0.0' }, author: 'me', description: 'd', license: 'MIT', homepage: 'https://example.com' }
    reg.register(manifest as any, '/tmp/full', true)
    reg.setHealth('full', { ok: true })
    reg.appendMetric('full', { name: 'load_time', value: 10 })
    reg.appendError('full', { when: 'now', message: 'err' })
    const g = reg.get('full')
    expect(g).toBeDefined()
    expect(g?.health).toBeDefined()
    expect(g?.metrics?.length).toBeGreaterThan(0)
    expect(g?.errors?.length).toBeGreaterThan(0)
  })
})
