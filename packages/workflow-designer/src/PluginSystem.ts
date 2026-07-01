import { PluginManifest, Plugin } from './IntegrationTypes'

export class PluginSystem {
  private plugins: Map<string, Plugin> = new Map()
  private nodeTypeRegistry: Map<string, any> = new Map()

  registerPlugin(manifest: PluginManifest, instance: any): boolean {
    try {
      const plugin: Plugin = {
        manifest,
        instance,
        enabled: true
      }

      this.plugins.set(manifest.id, plugin)

      // Register custom node types
      if (manifest.nodeTypes) {
        for (const nodeType of manifest.nodeTypes) {
          this.nodeTypeRegistry.set(nodeType, instance)
        }
      }

      return true
    } catch (error) {
      console.error(`Failed to register plugin ${manifest.id}:`, error)
      return false
    }
  }

  unregisterPlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return false

    if (plugin.manifest.nodeTypes) {
      for (const nodeType of plugin.manifest.nodeTypes) {
        this.nodeTypeRegistry.delete(nodeType)
      }
    }

    return this.plugins.delete(pluginId)
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  enablePlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      plugin.enabled = true
      return true
    }
    return false
  }

  disablePlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      plugin.enabled = false
      return true
    }
    return false
  }

  getNodeType(nodeType: string): any {
    return this.nodeTypeRegistry.get(nodeType)
  }

  callPluginMethod(pluginId: string, method: string, ...args: any[]): any {
    const plugin = this.plugins.get(pluginId)
    if (!plugin || !plugin.enabled) {
      throw new Error(`Plugin ${pluginId} not found or disabled`)
    }

    if (typeof plugin.instance[method] !== 'function') {
      throw new Error(`Method ${method} not found in plugin ${pluginId}`)
    }

    return plugin.instance[method](...args)
  }
}
