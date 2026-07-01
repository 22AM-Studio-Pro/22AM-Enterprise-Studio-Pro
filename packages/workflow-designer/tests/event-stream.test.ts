import { describe, it, expect, beforeEach } from 'vitest'
import { ExecutionEventStream } from '../src/ExecutionEventStream'
import { ExecutionEvent } from '../src/ExecutionTypes'

describe('ExecutionEventStream', () => {
  let stream: ExecutionEventStream

  beforeEach(() => {
    stream = new ExecutionEventStream()
  })

  it('queues events when disconnected', () => {
    const event: ExecutionEvent = {
      id: 'evt-1',
      nodeId: 'n1',
      timestamp: new Date().toISOString(),
      type: 'start'
    }

    stream.send(event)
    // Event should be queued since not connected
    expect(stream['eventQueue'].length).toBe(1)
  })

  it('emits event to listeners', (done) => {
    const event: ExecutionEvent = {
      id: 'evt-1',
      nodeId: 'n1',
      timestamp: new Date().toISOString(),
      type: 'start'
    }

    let receivedEvent: any = null
    stream.onEvent((evt) => {
      receivedEvent = evt
    })

    stream.emit('event', event)
    setTimeout(() => {
      expect(receivedEvent).toEqual(event)
      done()
    }, 10)
  })
})
