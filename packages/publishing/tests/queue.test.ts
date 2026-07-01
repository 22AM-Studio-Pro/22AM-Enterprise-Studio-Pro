import { describe, it, expect } from 'vitest'
import { PublishingQueue } from '../src/PublishingQueue'
import { PublishingContent } from '../src/PublishingTypes'
import path from 'path'
import fs from 'fs-extra'

const dbPath = path.resolve(__dirname, 'test-data', 'publishing.db')

beforeEach(() => {
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
})

describe('PublishingQueue', () => {
  it('enqueues and dequeues content', () => {
    const queue = new PublishingQueue(dbPath)
    const content: PublishingContent = {
      id: 'post-1',
      platform: 'facebook',
      media: [{ type: 'image', path: '/tmp/image.jpg', mimeType: 'image/jpeg' }],
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString()
    }
    queue.enqueue(content)
    const dequeued = queue.dequeue()
    expect(dequeued?.id).toBe('post-1')
  })

  it('tracks retry attempts', () => {
    const queue = new PublishingQueue(dbPath)
    const content: PublishingContent = {
      id: 'post-1',
      platform: 'facebook',
      media: [{ type: 'image', path: '/tmp/image.jpg', mimeType: 'image/jpeg' }],
      status: 'failed',
      retries: 0,
      createdAt: new Date().toISOString()
    }
    queue.enqueue(content)
    queue.recordRetry('post-1')
    queue.recordRetry('post-1')
    const metrics = queue.getMetrics('post-1')
    expect(metrics?.retries).toBe(2)
  })

  it('respects retry policy', () => {
    const queue = new PublishingQueue(dbPath)
    const content: PublishingContent = {
      id: 'post-1',
      platform: 'facebook',
      media: [{ type: 'image', path: '/tmp/image.jpg', mimeType: 'image/jpeg' }],
      status: 'failed',
      retries: 2,
      createdAt: new Date().toISOString()
    }
    queue.enqueue(content)
    expect(queue.shouldRetry('post-1')).toBe(true)
    queue.recordRetry('post-1')
    expect(queue.shouldRetry('post-1')).toBe(false)
  })
})
