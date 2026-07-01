import { describe, it, expect } from 'vitest'
import { PluginEvents } from '../src/PluginEvents'

// PluginEvents exposes object with on/off/emit/ disposeToken; adapt import
import { pluginEvents } from '../src/PluginEvents'

describe('plugin events', () => {
  it('registers and disposes token subscriptions', () => {
    const token = {}
    let called = false
    const off = pluginEvents.on('plugin.test', () => { called = true }, token)
    pluginEvents.emit('plugin.test', { ok: true })
    expect(called).toBe(true)
    pluginEvents.disposeToken(token)
    called = false
    pluginEvents.emit('plugin.test', { ok: true })
    expect(called).toBe(false)
  })
})
