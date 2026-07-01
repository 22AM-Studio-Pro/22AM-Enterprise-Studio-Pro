export type PluginManifest = {
  id: string
  name: string
  version: string
  author?: string
  description?: string
  license?: string
  homepage?: string
  entry: string
  permissions?: string[]
  dependencies?: Record<string, string>
  minimumAppVersion?: string
  maximumAppVersion?: string
}
