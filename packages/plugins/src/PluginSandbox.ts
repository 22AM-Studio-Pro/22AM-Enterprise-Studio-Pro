import fs from 'fs/promises'
import path from 'path'
import { PluginPermission } from './PluginPermission'
import { PermissionManager } from './PermissionManager'

export class PluginSandbox {
  private pm: PermissionManager
  private pluginId: string

  constructor(pluginId: string, pm: PermissionManager) {
    this.pm = pm
    this.pluginId = pluginId
  }

  async readFile(filePath: string) {
    if (!this.pm.hasPermission(this.pluginId, PluginPermission.FS_READ)) throw new Error('permission denied: filesystem.read')
    const abs = path.resolve(process.cwd(), filePath)
    return fs.readFile(abs, 'utf-8')
  }

  async writeFile(filePath: string, content: string) {
    if (!this.pm.hasPermission(this.pluginId, PluginPermission.FS_WRITE)) throw new Error('permission denied: filesystem.write')
    const abs = path.resolve(process.cwd(), filePath)
    await fs.mkdir(path.dirname(abs), { recursive: true })
    return fs.writeFile(abs, content, 'utf-8')
  }

  async httpRequest(_opts: any) {
    if (!this.pm.hasPermission(this.pluginId, PluginPermission.NETWORK)) throw new Error('permission denied: network.http')
    // For security and testability, plugins should use a provided http client; here we return a stub
    return { status: 200, body: { ok: true } }
  }
}
