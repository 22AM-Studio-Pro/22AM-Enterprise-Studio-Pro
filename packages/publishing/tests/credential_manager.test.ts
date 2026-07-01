import { describe, it, expect } from 'vitest'
import { PublishingCredentialManager } from '../src/PublishingCredentialManager'

describe('PublishingCredentialManager', () => {
  it('saves and retrieves credentials', () => {
    const mgr = new PublishingCredentialManager()
    mgr.saveCredential('facebook', 'accessToken', 'token123')
    const token = mgr.getCredential('facebook', 'accessToken')
    expect(token).toBe('token123')
  })

  it('deletes credentials', () => {
    const mgr = new PublishingCredentialManager()
    mgr.saveCredential('facebook', 'accessToken', 'token123')
    mgr.deleteCredential('facebook', 'accessToken')
    expect(mgr.getCredential('facebook', 'accessToken')).toBeUndefined()
  })

  it('checks credential existence', () => {
    const mgr = new PublishingCredentialManager()
    expect(mgr.hasCredentials('facebook')).toBe(false)
    mgr.saveCredential('facebook', 'accessToken', 'token123')
    expect(mgr.hasCredentials('facebook')).toBe(true)
  })
})
