import React from 'react'

export const StatusIndicator: React.FC<{ status: 'unknown' | 'running' | 'stopped' | 'error' }> = ({ status }) => {
  const color = status === 'running' ? 'bg-emerald-400' : status === 'stopped' ? 'bg-slate-400' : status === 'error' ? 'bg-rose-500' : 'bg-yellow-400'
  const label = status === 'running' ? 'Running' : status === 'stopped' ? 'Stopped' : status === 'error' ? 'Error' : 'Unknown'

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`inline-block w-3 h-3 rounded-full ${color}`} />
      <span className="text-sm text-slate-300">{label}</span>
    </div>
  )
}
