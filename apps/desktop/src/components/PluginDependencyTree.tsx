import React from 'react'
import type { PluginInfo } from '../stores/pluginStore'

export const PluginDependencyTree: React.FC<{ dependencies?: string[] }> = ({ dependencies }) => (
  <ul>
    {(dependencies ?? []).map((d) => <li key={d}>{d}</li>)}
  </ul>
)
