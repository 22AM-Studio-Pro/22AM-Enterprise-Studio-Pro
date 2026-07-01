import React from 'react'
import type { PluginInfo } from '../stores/pluginStore'

export const PluginCard: React.FC<{ plugin: PluginInfo; onSelect?: (p: PluginInfo) => void }> = ({ plugin, onSelect }) => {
  return (
    <div className="plugin-card" onClick={() => onSelect?.(plugin)}>
      <h3>{plugin.name}</h3>
      <p>{plugin.version} — {plugin.author}</p>
      <p>Status: {plugin.status ?? (plugin.enabled ? 'enabled' : 'disabled')}</p>
    </div>
  )
}
