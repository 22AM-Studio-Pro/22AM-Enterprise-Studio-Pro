import { describe, it, expect } from 'vitest'
import { MetadataExtractor } from '../src/MetadataExtractor'

describe('MetadataExtractor', () => {
  it('extracts image metadata', () => {
    const extractor = new MetadataExtractor()
    const meta = extractor.extractMetadata('/tmp/test.jpg', 'image/jpeg')
    expect(meta.dimensions).toBeDefined()
    expect(meta.dimensions?.width).toBeGreaterThan(0)
  })

  it('extracts video metadata', () => {
    const extractor = new MetadataExtractor()
    const meta = extractor.extractMetadata('/tmp/test.mp4', 'video/mp4')
    expect(meta.duration).toBeDefined()
    expect(meta.fps).toBeDefined()
    expect(meta.codec).toBeDefined()
  })

  it('extracts audio metadata', () => {
    const extractor = new MetadataExtractor()
    const meta = extractor.extractMetadata('/tmp/test.mp3', 'audio/mpeg')
    expect(meta.duration).toBeDefined()
    expect(meta.channels).toBeDefined()
    expect(meta.sampleRate).toBeDefined()
  })
})
