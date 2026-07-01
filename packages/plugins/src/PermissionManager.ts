import fs from 'fs-extra'
import path from 'path'
import { PluginPermission } from './PluginPermission'
import { PluginManifest } from './PluginManifest'

export class PermissionManager {
  private permissions: Map<string, Set<string>>
  private registrySave: (id: string, perms: string[]) => void

  constructor(registrySaver?: (id: string, perms: string[]) => void) {
    this.permissions = new Map()
    this.registrySave = registrySaver ?? (() => {})
  }

  requestPermission(pluginId: string, permission: string) {
    // In this simple model, request does not auto-grant. Return false if not yet granted.
    return this.hasPermission(pluginId, permission)
  }

  grantPermission(pluginId: string, permission: string) {
    const set = this.permissions.get(pluginId) ?? new Set<string>()
    set.add(permission)
    this.permissions.set(pluginId, set)
    this.registrySave(pluginId, Array.from(set))
  }

  revokePermission(pluginId: string, permission: string) {
    const set = this.permissions.get(pluginId)
    if (!set) return
    set.delete(permission)
    this.registrySave(pluginId, Array.from(set))
  }

  hasPermission(pluginId: string, permission: PluginPermission | string) {
    const set = this.permissions.get(pluginId)
    if (!set) return false
    return set.has(permission as string)
  }

  listPermissions(pluginId: string) {
    const set = this.permissions.get(pluginId)
    return set ? Array.from(set) : []
  }

  loadFromManifest(manifest: PluginManifest) {
    // load initial permissions from manifest
    if (!manifest.permissions) return
    this.permissions.set(manifest.id, new Set(manifest.permissions))
  }
}
