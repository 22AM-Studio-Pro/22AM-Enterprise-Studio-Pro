import { describe, it, expect } from 'vitest'
import { ThumbnailGenerator } from '../src/ThumbnailGenerator'
import fs from 'fs-extra'
import path from 'path'

const testDir = path.resolve(__dirname, 'test-thumbnails')

beforeEach(() => {
  if (fs.existsSync(testDir)) fs.removeSync(testDir)
  fs.ensureDirSync(testDir)
})

describe('ThumbnailGenerator', () => {
  it('generates image thumbnail', async () => {
    const gen = new ThumbnailGenerator(testDir)
    const testImage = path.join(testDir, 'test.jpg')
    fs.writeFileSync(testImage, Buffer.from('fake image data'))
    const thumbPath = await gen.generateImageThumbnail(testImage)
    expect(fs.existsSync(thumbPath)).toBe(true)
  })

  it('generates video thumbnail', async () => {
    const gen = new ThumbnailGenerator(testDir)
    const testVideo = path.join(testDir, 'test.mp4')
    fs.writeFileSync(testVideo, Buffer.from('fake video data'))
    const thumbPath = await gen.generateVideoThumbnail(testVideo)
    expect(fs.existsSync(thumbPath)).toBe(true)
  })

  it('generates audio waveform', async () => {
    const gen = new ThumbnailGenerator(testDir)
    const testAudio = path.join(testDir, 'test.mp3')
    fs.writeFileSync(testAudio, Buffer.from('fake audio data'))
    const waveformPath = await gen.generateAudioWaveform(testAudio)
    expect(fs.existsSync(waveformPath)).toBe(true)
  })
})
