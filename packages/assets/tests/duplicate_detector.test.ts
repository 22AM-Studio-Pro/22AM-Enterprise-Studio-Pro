import { describe, it, expect } from 'vitest'
import { DuplicateDetector } from '../src/DuplicateDetector'

describe('DuplicateDetector', () => {
  it('detects by SHA256 checksum', () => {
    const detector = new DuplicateDetector()
    const hash1 = detector.detectBySHA256('test.txt', {
      readFileSync: () => Buffer.from('test content')
    })
    expect(hash1).toBeDefined()
    expect(hash1.length).toBe(64) // SHA256 hex is 64 chars
  })
})
