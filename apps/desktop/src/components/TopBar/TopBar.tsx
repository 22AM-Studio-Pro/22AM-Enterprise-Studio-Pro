import React from 'react'
import { useStore } from '../../store/useStore'
import { useEngineQuery } from '../../hooks/useEngineQuery'

export const TopBar: React.FC = () => {
  const engineQuery = useEngineQuery()
  const engine = engineQuery.data
  const [open, setOpen] = React.useState(false)
  const notifications = useStore((s) => s.notifications)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const theme = useStore((s) => s.theme)

  React.useEffect(() => {
    // subscribe to events when component mounts
    let unsub: (() => void) | undefined
    ;(async () => {
      try {
        const listener = await engineQuery.subscribe()
        unsub = listener as any
      } catch (e) {
        // ignore
      }
    })()
    return () => {
      if (unsub) unsub()
    }
  }, [engineQuery])

  const now = new Date()
  const time = now.toLocaleTimeString()

  return (
    <div className="w-full flex items-center justify-between p-3 border-b border-slate-700 bg-slate-900">
      <div className="flex items-center gap-4">
        <div className="text-white font-semibold">22AM Enterprise Studio Pro</div>
        <div className="text-slate-400">Workspace: default</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-300" aria-live="polite">
          <span>Engine:</span>
          {engine ? (
            <span className={`px-2 py-0.5 rounded text-sm ${engine.status === 'running' ? 'bg-emerald-600' : engine.status === 'error' ? 'bg-rose-700' : 'bg-slate-700'}`}>{engine.status}</span>
          ) : (
            <span className="px-2 py-0.5 rounded text-sm bg-slate-700">unknown</span>
          )}
        </div>

        <div>
          <input aria-label="Search" className="rounded bg-slate-800 text-slate-200 placeholder-slate-500 px-2 py-1" placeholder="Search..." />
        </div>

        <div className="text-slate-400">{time}</div>

        <div className="relative">
          <button aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((s) => !s)} className="p-2 rounded hover:bg-slate-800 text-slate-300" title="Notifications">🔔</button>
          {open && <div><div className="absolute right-0 mt-2"><div className="bg-slate-800 rounded p-2 shadow">{notifications.length === 0 ? <div className="text-slate-400">No notifications</div> : notifications.map(n => <div key={n.id} className="text-slate-200">{n.message}</div>)}</div></div></div>}
        </div>

        <button onClick={() => toggleTheme()} aria-label="Toggle theme" className="p-2 rounded hover:bg-slate-800 text-slate-300">{theme === 'dark' ? '🌙' : '☀️'}</button>
      </div>
    </div>
  )
}
