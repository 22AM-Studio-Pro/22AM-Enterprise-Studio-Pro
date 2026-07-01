import { describe, it, expect } from 'vitest'
import { PreviewEngine } from '../src/PreviewEngine'
import fs from 'fs-extra'
import path from 'path'

const testDir = path.resolve(__dirname, 'test-previews')

beforeEach(() => {
  if (fs.existsSync(testDir)) fs.removeSync(testDir)
  fs.ensureDirSync(testDir)
})

describe('PreviewEngine', () => {
  it('generates image preview', async () => {
    const engine = new PreviewEngine()
    const testImage = path.join(testDir, 'test.jpg')
    fs.writeFileSync(testImage, Buffer.from('fake image data'))
    const preview = await engine.generatePreview(testImage, 'image/jpeg')
    expect(preview.type).toBe('image')
    expect(preview.mimeType).toBe('image/jpeg')
  })

  it('generates JSON preview', async () => {
    const engine = new PreviewEngine()
    const testJson = path.join(testDir, 'test.json')
    fs.writeFileSync(testJson, JSON.stringify({ test: 'data' }))
    const preview = await engine.generatePreview(testJson, 'application/json')
    expect(preview.type).toBe('json')
    expect(preview.content).toContain('test')
  })

  it('generates text preview', async () => {
    const engine = new PreviewEngine()
    const testText = path.join(testDir, 'test.txt')
    fs.writeFileSync(testText, 'hello world')
    const preview = await engine.generatePreview(testText, 'text/plain')
    expect(preview.type).toBe('text')
  })
})
