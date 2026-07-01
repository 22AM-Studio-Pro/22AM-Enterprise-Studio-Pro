import React from 'react'
import type { PluginInfo } from '../stores/pluginStore'

export const PluginPermissionList: React.FC<{ permissions?: string[] }> = ({ permissions }) => (
  <ul>
    {(permissions ?? []).map((p) => <li key={p}>{p}</li>)}
  </ul>
)
