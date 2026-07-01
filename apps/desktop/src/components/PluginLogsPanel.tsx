import React from 'react'
import type { PluginInfo } from '../stores/pluginStore'

export const PluginLogsPanel: React.FC<{ logs: string[] }> = ({ logs }) => (
  <div className="logs">
    <h4>Logs</h4>
    <div className="logs-list">
      {logs.map((l, i) => <div key={i}><pre>{l}</pre></div>)}
    </div>
  </div>
)
