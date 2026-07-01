import { describe, it, expect } from 'vitest'
import { PluginSandbox } from '../src/PluginSandbox'
import { PermissionManager } from '../src/PermissionManager'

describe('PluginSandbox permission enforcement', () => {
  it('denies filesystem read without permission and allows with permission', async () => {
    const pm = new PermissionManager()
    const pluginId = 'p-sandbox'
    const sb = new PluginSandbox(pluginId, pm)
    await expect(sb.readFile('./nope.txt')).rejects.toThrow(/permission denied/)
    pm.grantPermission(pluginId, 'filesystem.read')
    // create temp file
    const fs = await import('fs')
    fs.writeFileSync('tmp_test_file.txt', 'ok')
    const content = await sb.readFile('tmp_test_file.txt')
    expect(content).toBe('ok')
    fs.unlinkSync('tmp_test_file.txt')
  })
})
