import React, { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const items = [
  { name: 'Dashboard', to: '/' },
  { name: 'Jobs', to: '/jobs' },
  { name: 'Workflows', to: '/workflows' },
  { name: 'Assets', to: '/assets' },
  { name: 'Plugins', to: '/plugins' }
]

export const SidebarItem: React.FC<{ name: string; to: string; index?: number; onKeyNavigate?: (dir: number, idx: number) => void }> = ({ name, to, index = 0, onKeyNavigate }) => {
  const ref = useRef<HTMLAnchorElement | null>(null)

  return (
    <NavLink
      to={to}
      ref={ref}
      className={({ isActive }) =>
        `block py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`
      }
      tabIndex={0}
      onKeyDown={(e) => {
        if (!onKeyNavigate) return
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          onKeyNavigate(1, index)
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          onKeyNavigate(-1, index)
        }
      }}
    >
      {name}
    </NavLink>
  )
}

export const Sidebar: React.FC<{ collapsed?: boolean; onToggle?: () => void }> = ({ collapsed = false, onToggle }) => {
  const [focusIndex, setFocusIndex] = useState(0)
  const location = useLocation()

  useEffect(() => {
    // reset focus when route changes
    setFocusIndex(items.findIndex((i) => i.to === location.pathname) || 0)
  }, [location.pathname])

  const onKeyNavigate = (dir: number, idx: number) => {
    const next = Math.max(0, Math.min(items.length - 1, idx + dir))
    setFocusIndex(next)
    const el = document.querySelectorAll('nav a')[next] as HTMLElement | undefined
    el?.focus()
  }

  return (
    <aside className={`flex flex-col h-full ${collapsed ? 'w-16' : 'w-64'} p-3 border-r border-slate-700 bg-slate-900`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-white font-semibold">22AM</div>
        <button
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="text-slate-400 hover:text-white focus:outline-none"
        >
          ≡
        </button>
      </div>

      <nav className="flex-1 space-y-1" aria-label="Main navigation">
        {items.map((it, i) => (
          <SidebarItem key={it.to} name={it.name} to={it.to} index={i} onKeyNavigate={onKeyNavigate} />
        ))}
      </nav>

      <div className="mt-4 border-t border-slate-700 pt-4 space-y-2">
        <NavLink to="/settings" className={({ isActive }) => `block py-2 px-3 rounded-md ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
          Settings
        </NavLink>
        <a href="#" className="block text-slate-400 text-sm">About</a>
      </div>
    </aside>
  )
}
