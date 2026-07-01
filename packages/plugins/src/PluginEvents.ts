import EventEmitter from 'eventemitter3'

export const pluginEvents = new EventEmitter()

export type PluginEventPayloads = {
  'plugin.loaded': { id: string }
  'plugin.unloaded': { id: string }
}
