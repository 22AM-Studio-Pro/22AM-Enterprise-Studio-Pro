export type PluginLifecycle = 'initialize' | 'start' | 'stop' | 'dispose'

export type PluginModule = {
  initialize?: (context: any) => Promise<void> | void
  start?: () => Promise<void> | void
  stop?: () => Promise<void> | void
  dispose?: () => Promise<void> | void
}
