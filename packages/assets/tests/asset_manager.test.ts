import { describe, it, expect } from 'vitest'
import { AssetManager } from '../src/AssetManager'
import path from 'path'
import fs from 'fs-extra'

const dbPath = path.resolve(__dirname, 'test-data', 'assets.db')

beforeEach(() => {
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
})

describe('AssetManager', () => {
  it('creates and retrieves an asset', () => {
    const mgr = new AssetManager(dbPath)
    const asset = mgr.createAsset('image', '/tmp/test.png', {
      filename: 'test.png',
      mimeType: 'image/png',
      size: 1024,
      checksum: 'abc123',
      hash: 'hash123',
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      tags: ['test']
    })
    expect(asset.id).toBeDefined()
    const retrieved = mgr.getAsset(asset.id)
    expect(retrieved?.metadata.filename).toBe('test.png')
  })

  it('searches assets by filename', () => {
    const mgr = new AssetManager(dbPath)
    mgr.createAsset('image', '/tmp/test1.png', {
      filename: 'test1.png',
      mimeType: 'image/png',
      size: 1024,
      checksum: 'check1',
      hash: 'hash1',
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString()
    })
    mgr.createAsset('video', '/tmp/movie.mp4', {
      filename: 'movie.mp4',
      mimeType: 'video/mp4',
      size: 5000,
      checksum: 'check2',
      hash: 'hash2',
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString()
    })
    const results = mgr.searchAssets('test')
    expect(results.length).toBeGreaterThan(0)
  })

  it('tags and lists tags', () => {
    const mgr = new AssetManager(dbPath)
    const asset = mgr.createAsset('image', '/tmp/test.png', {
      filename: 'test.png',
      mimeType: 'image/png',
      size: 1024,
      checksum: 'check3',
      hash: 'hash3',
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      tags: ['original']
    })
    mgr.tagAsset(asset.id, ['processed', 'ai-generated'])
    const updated = mgr.getAsset(asset.id)
    expect(updated?.metadata.tags?.length).toBeGreaterThan(1)
  })
})
