import { describe, it, expect } from 'vitest'
import { PermissionManager } from '../src/PermissionManager'

describe('PermissionManager', () => {
  it('grants and revokes permissions and lists them', () => {
    const pm = new PermissionManager()
    pm.grantPermission('p1', 'filesystem.read')
    expect(pm.hasPermission('p1', 'filesystem.read')).toBe(true)
    pm.revokePermission('p1', 'filesystem.read')
    expect(pm.hasPermission('p1', 'filesystem.read')).toBe(false)
  })
})
