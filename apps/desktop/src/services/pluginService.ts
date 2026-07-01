import { invoke } from '@tauri-apps/api/tauri'
import type { PluginInfo } from '../stores/pluginStore'

export async function listPlugins(): Promise<PluginInfo[]> {
  return invoke('plugins_list') as Promise<PluginInfo[]>
}

export async function getPluginDetails(id: string): Promise<PluginInfo> {
  return invoke('plugin_details', { id }) as Promise<PluginInfo>
}

export async function installPluginFromPath(path: string) {
  return invoke('plugin_install', { path })
}

export async function removePlugin(id: string) {
  return invoke('plugin_remove', { id })
}

export async function enablePlugin(id: string) {
  return invoke('plugin_enable', { id })
}

export async function disablePlugin(id: string) {
  return invoke('plugin_disable', { id })
}

export async function reloadPlugin(id: string) {
  return invoke('plugin_reload', { id })
}

export async function pluginLogs(id: string) {
  return invoke('plugin_logs', { id })
}
