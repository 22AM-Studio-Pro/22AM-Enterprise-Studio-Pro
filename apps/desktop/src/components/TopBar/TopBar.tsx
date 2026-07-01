import React from 'react'

export const TopBar: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-between p-3 border-b border-slate-700 bg-slate-900">
      <div className="flex items-center gap-4">
        <div className="text-white font-semibold">22AM Enterprise Studio Pro</div>
        <div className="text-slate-400">Workspace: default</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-slate-300">Engine: <span className="text-emerald-400">Unknown</span></div>
        <div>
          <input className="rounded bg-slate-800 text-slate-200 placeholder-slate-500 px-2 py-1" placeholder="Search..." />
        </div>
        <button className="p-2 rounded hover:bg-slate-800 text-slate-300">🔔</button>
        <button className="p-2 rounded hover:bg-slate-800 text-slate-300">🌓</button>
      </div>
    </div>
  )
}
