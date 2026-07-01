export type PluginContext = {
  logger: { info: (s: string) => void; warn: (s: string) => void; error: (s: string) => void }
  services: Record<string, unknown>
  events: import('./PluginEvents').pluginEvents
}
