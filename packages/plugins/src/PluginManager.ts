import fs from 'fs'
import path from 'path'
import { PluginRegistry } from './PluginRegistry'
import { PluginLoader } from './PluginLoader'
import { Plugin } from './Plugin'
import { PluginContext } from './PluginContext'
import { pluginEvents } from './PluginEvents'

export class PluginManager {
  private pluginsDir: string
  private registry: PluginRegistry
  private loader: PluginLoader
  private loaded: Map<string, Plugin>
  private context: PluginContext

  constructor(pluginsDir?: string, dbPath?: string, context?: PluginContext) {
    this.pluginsDir = pluginsDir ?? path.resolve(process.cwd(), 'plugins')
    this.registry = new PluginRegistry(dbPath)
    this.loader = new PluginLoader()
    this.loaded = new Map()
    this.context = context ?? { logger: console, services: {}, events: pluginEvents }
  }

  async discover(): Promise<string[]> {
    // recursively find plugin folders that contain manifest.json
    const out: string[] = []
    const walk = (p: string) => {
      const entries = fs.readdirSync(p, { withFileTypes: true })
      for (const e of entries) {
        const full = path.join(p, e.name)
        if (e.isDirectory()) {
          if (fs.existsSync(path.join(full, 'manifest.json'))) {
            out.push(full)
          } else {
            walk(full)
          }
        }
      }
    }
    if (fs.existsSync(this.pluginsDir)) walk(this.pluginsDir)
    return out
  }

  async loadPluginFromFolder(folder: string) {
    const res = await this.loader.loadFromPath(folder)
    const manifest = res.manifest
    const mod = res.module
    const plugin: Plugin = { id: manifest.id, manifest, module: mod }

    // lifecycle initialize
    if (plugin.module && typeof plugin.module.initialize === 'function') {
      await plugin.module.initialize(this.context)
    }

    this.loaded.set(manifest.id, plugin)
    this.registry.register(manifest, folder, true)
    this.context.logger.info(`plugin loaded: ${manifest.id}`)
    this.context.events.emit('plugin.loaded', { id: manifest.id })
    return plugin
  }

  async unloadPlugin(id: string) {
    const plugin = this.loaded.get(id)
    if (!plugin) return false
    if (plugin.module && typeof plugin.module.stop === 'function') {
      await plugin.module.stop()
    }
    if (plugin.module && typeof plugin.module.dispose === 'function') {
      await plugin.module.dispose()
    }
    this.loaded.delete(id)
    this.registry.setEnabled(id, false)
    this.context.events.emit('plugin.unloaded', { id })
    return true
  }

  async reloadPlugin(id: string) {
    const info = this.registry.get(id)
    if (!info) throw new Error('plugin not installed')
    await this.unloadPlugin(id)
    return this.loadPluginFromFolder(info.path)
  }

  async installPlugin(folder: string) {
    // copy to plugins dir
    const target = path.join(this.pluginsDir, path.basename(folder))
    await fs.promises.mkdir(this.pluginsDir, { recursive: true })
    await fs.promises.cp(folder, target, { recursive: true })
    const plugin = await this.loadPluginFromFolder(target)
    return plugin
  }

  async removePlugin(id: string) {
    const info = this.registry.get(id)
    if (!info) return false
    await this.unloadPlugin(id)
    await fs.promises.rm(info.path, { recursive: true, force: true })
    this.registry.unregister(id)
    return true
  }

  listRegistered() {
    return this.registry.list()
  }

  getLoaded(id: string) {
    return this.loaded.get(id)
  }
}
