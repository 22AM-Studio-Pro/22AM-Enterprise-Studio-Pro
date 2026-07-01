import { describe, it, expect } from 'vitest'
import { CacheManager } from '../src/CacheManager'
import path from 'path'
import fs from 'fs-extra'

const cacheDir = path.resolve(__dirname, 'test-cache')

beforeEach(() => {
  if (fs.existsSync(cacheDir)) fs.removeSync(cacheDir)
})

describe('CacheManager', () => {
  it('sets and gets cache entries', () => {
    const mgr = new CacheManager(cacheDir)
    mgr.set('key1', 'value1')
    expect(mgr.has('key1')).toBe(true)
    const val = mgr.get('key1')
    expect(val?.toString()).toBe('value1')
  })

  it('deletes cache entries', () => {
    const mgr = new CacheManager(cacheDir)
    mgr.set('key1', 'value1')
    mgr.delete('key1')
    expect(mgr.has('key1')).toBe(false)
  })

  it('clears entire cache', () => {
    const mgr = new CacheManager(cacheDir)
    mgr.set('key1', 'value1')
    mgr.set('key2', 'value2')
    mgr.clear()
    expect(mgr.has('key1')).toBe(false)
    expect(mgr.has('key2')).toBe(false)
  })
})
