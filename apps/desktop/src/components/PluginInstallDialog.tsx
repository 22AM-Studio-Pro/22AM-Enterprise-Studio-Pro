import React from 'react'

export const PluginInstallDialog: React.FC<{ open: boolean; onClose: () => void; onInstall: (path: string) => void }> = ({ open, onClose, onInstall }) => {
  if (!open) return null
  let input: HTMLInputElement | null = null
  return (
    <div className="dialog">
      <h3>Install Plugin</h3>
      <input ref={(r) => (input = r)} placeholder="Path to plugin folder" />
      <button onClick={() => { if (input) onInstall(input.value) }}>Install</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  )
}
