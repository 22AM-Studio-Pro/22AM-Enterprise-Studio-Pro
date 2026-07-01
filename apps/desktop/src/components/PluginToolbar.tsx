import React from 'react'

export const PluginToolbar: React.FC<{ onInstall?: () => void; onRefresh?: () => void }> = ({ onInstall, onRefresh }) => (
  <div className="toolbar">
    <button onClick={onInstall}>Install</button>
    <button onClick={onRefresh}>Refresh</button>
  </div>
)
