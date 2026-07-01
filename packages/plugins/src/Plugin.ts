export interface Plugin {
  id: string
  manifest: import('./PluginManifest').PluginManifest
  module?: import('./PluginLifecycle').PluginModule
}
