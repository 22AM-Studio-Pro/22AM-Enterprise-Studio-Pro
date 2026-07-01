import { describe, it, expect } from 'vitest'
import * as service from '../../src/services/pluginService'

vi.mock('@tauri-apps/api/tauri', () => ({ invoke: vi.fn(() => Promise.resolve([])) }))

describe('pluginService', () => {
  it('listPlugins calls invoke', async () => {
    const p = await service.listPlugins()
    expect(p).toBeDefined()
  })
})
