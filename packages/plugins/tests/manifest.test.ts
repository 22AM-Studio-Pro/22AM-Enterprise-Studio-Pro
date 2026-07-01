import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { PluginLoader } from '../src/PluginLoader'

const testPluginDir = path.resolve(__dirname, 'test-plugins', 'hello-plugin')

describe('PluginLoader', () => {
  it('loads plugin manifest and module', async () => {
    const loader = new PluginLoader()
    const res = await loader.loadFromPath(testPluginDir)
    expect(res.manifest.id).toBe('hello')
    expect(res.module).toBeDefined()
  })
})
