import fs from 'fs'
import path from 'path'
import chokidar from 'chokidar'
import { PluginRegistry } from './PluginRegistry'
import { PluginLoader } from './PluginLoader'
import { Plugin } from './Plugin'
import { PluginContext } from './PluginContext'
import { pluginEvents } from './PluginEvents'
import { PermissionManager } from './PermissionManager'
import { DependencyResolver } from './DependencyResolver'

export class PluginManager {
  private pluginsDir: string
  private registry: PluginRegistry
  private loader: PluginLoader
  private loaded: Map<string, Plugin>
  private context: PluginContext
  private pm: PermissionManager
  private resolver: DependencyResolver
  private watcher?: chokidar.FSWatcher

  constructor(pluginsDir?: string, dbPath?: string, context?: PluginContext) {
    this.pluginsDir = pluginsDir ?? path.resolve(process.cwd(), 'plugins')
    this.registry = new PluginRegistry(dbPath)
    this.loader = new PluginLoader()
    this.loaded = new Map()
    this.context = context ?? { logger: console, services: {}, events: pluginEvents }
    this.pm = new PermissionManager((id, perms) => this.registry.setPermissions(id, perms))
    this.resolver = new DependencyResolver()
  }

  async discoverManifests() {
    const folders: string[] = []
    const walk = (p: string) => {
      const entries = fs.readdirSync(p, { withFileTypes: true })
      for (const e of entries) {
        const full = path.join(p, e.name)
        if (e.isDirectory()) {
          if (fs.existsSync(path.join(full, 'manifest.json'))) folders.push(full)
          else walk(full)
        }
      }
    }
    if (fs.existsSync(this.pluginsDir)) walk(this.pluginsDir)
    const manifests = [] as any[]
    for (const f of folders) {
      try {
        const r = await this.loader.loadFromPath(f)
        manifests.push({ manifest: r.manifest, path: f })
      } catch (e) {
        this.context.logger.error('failed to load manifest from ' + f + ': ' + (e as Error).message)
      }
    }
    return manifests
  }

  async installPlugin(folder: string) {
    this.context.logger.info('plugin.installing')
    pluginEvents.emit('plugin.installing', { folder })
    const target = path.join(this.pluginsDir, path.basename(folder))
    await fs.promises.mkdir(this.pluginsDir, { recursive: true })
    await fs.promises.cp(folder, target, { recursive: true })
    const res = await this.loader.loadFromPath(target)
    this.registry.register(res.manifest, target, false)
    this.pm.loadFromManifest(res.manifest)
    pluginEvents.emit('plugin.installed', { id: res.manifest.id })
    return res.manifest
  }

  async loadAll() {
    const manifests = await this.discoverManifests()
    const mDocs = manifests.map((m) => m.manifest)
    // validate dependency graph and get load order
    const ordered = this.resolver.resolve(mDocs)
    for (const m of ordered) {
      // skip disabled
      const info = this.registry.get(m.id)
      if (info && !info.enabled) continue
      await this.loadPlugin(m.id)
    }
  }

  async loadPlugin(id: string) {
    const info = this.registry.get(id)
    if (!info) throw new Error('plugin not installed')
    // dependency verification already performed at install/discover
    const res = await this.loader.loadFromPath(info.path)
    const plugin: Plugin = { id: res.manifest.id, manifest: res.manifest, module: res.module }
    // load permissions
    this.pm.loadFromManifest(res.manifest)
    // initialize within try/catch to isolate plugin failures
    try {
      if (plugin.module && typeof plugin.module.initialize === 'function') {
        await plugin.module.initialize(this.context)
      }
      this.loaded.set(plugin.id, plugin)
      this.registry.setEnabled(plugin.id, true)
      this.context.events.emit('plugin.loaded', { id: plugin.id })
      this.context.logger.info('plugin.loaded: ' + plugin.id)
    } catch (e) {
      this.context.logger.error('plugin failed to initialize: ' + plugin.id + ' ' + (e as Error).message)
      this.context.events.emit('plugin.failed', { id: plugin.id, error: (e as Error).message })
      throw e
    }
    return plugin
  }

  async unloadPlugin(id: string) {
    const plugin = this.loaded.get(id)
    if (!plugin) return false
    try {
      if (plugin.module && typeof plugin.module.stop === 'function') await plugin.module.stop()
      if (plugin.module && typeof plugin.module.dispose === 'function') await plugin.module.dispose()
    } catch (e) {
      this.context.logger.error('error during plugin stop/dispose: ' + (e as Error).message)
    }
    this.loaded.delete(id)
    this.registry.setEnabled(id, false)
    this.context.events.emit('plugin.unloaded', { id })
    return true
  }

  async reloadPlugin(id: string) {
    const info = this.registry.get(id)
    if (!info) throw new Error('plugin not installed')
    // preserve minimal state if plugin exposes save/restore - not implemented now
    try {
      await this.unloadPlugin(id)
      const p = await this.loadPlugin(id)
      pluginEvents.emit('plugin.updated', { id })
      return p
    } catch (e) {
      // rollback: try to load previous version if available
      this.context.logger.error('reload failed, attempt rollback: ' + (e as Error).message)
      try {
        await this.loadPlugin(id)
      } catch (er) {
        this.context.logger.error('rollback failed: ' + (er as Error).message)
      }
      throw e
    }
  }

  async removePlugin(id: string) {
    const info = this.registry.get(id)
    if (!info) return false
    await this.unloadPlugin(id)
    await fs.promises.rm(info.path, { recursive: true, force: true })
    this.registry.unregister(id)
    pluginEvents.emit('plugin.removed', { id })
    return true
  }

  // auto-reload by watching plugin folders
  watch() {
    if (!fs.existsSync(this.pluginsDir)) return
    if (this.watcher) return
    this.watcher = chokidar.watch(this.pluginsDir, { ignoreInitial: true, depth: 3 })
    this.watcher.on('all', async (ev, p) => {
      this.context.logger.info(`watch ${ev} ${p}`)
      // try to find plugin id by folder
      const manifests = await this.discoverManifests()
      for (const m of manifests) {
        if (p.startsWith(m.path)) {
          try {
            await this.reloadPlugin(m.manifest.id)
            this.context.logger.info('hot-reloaded ' + m.manifest.id)
          } catch (e) {
            this.context.logger.error('hot-reload failed for ' + m.manifest.id + ': ' + (e as Error).message)
          }
          break
        }
      }
    })
  }

  stopWatching() {
    if (!this.watcher) return
    this.watcher.close()
    this.watcher = undefined
  }

  listRegistered() {
    return this.registry.list()
  }
}
