import React from 'react'
import { LogLine } from '../../store/useStore'

export const RecentLogs: React.FC<{ logs: LogLine[] }> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-4 text-slate-400">No logs yet. Waiting for engine activity.</div>
    )
  }

  return (
    <div className="p-2 space-y-2 max-h-48 overflow-auto">
      {logs.slice(-50).map((l) => (
        <div key={l.id} className="text-xs text-slate-300">
          <span className="text-slate-500 mr-2">[{new Date(l.timestamp).toLocaleTimeString()}]</span>
          <span className={l.level === 'error' ? 'text-rose-400' : l.level === 'warn' ? 'text-amber-400' : 'text-slate-300'}>{l.message}</span>
        </div>
      ))}
    </div>
  )
}
