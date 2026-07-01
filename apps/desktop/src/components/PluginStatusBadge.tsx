import React from 'react'
import type { PluginInfo } from '../stores/pluginStore'

export const PluginStatusBadge: React.FC<{ enabled: boolean }> = ({ enabled }) => (
  <span className={`badge ${enabled ? 'badge-enabled' : 'badge-disabled'}`}>{enabled ? 'Enabled' : 'Disabled'}</span>
)
