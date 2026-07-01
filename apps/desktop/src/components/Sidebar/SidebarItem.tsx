import React from 'react'
import { useNavigate } from 'react-router-dom'

export const SidebarItem: React.FC<{ name: string; to: string; index?: number; onKeyNavigate?: (dir: number, idx: number) => void }> = ({ name, to, index = 0, onKeyNavigate }) => {
  // switch to use button with navigate for accessibility
  const navigate = useNavigate()
  const ref = React.useRef<HTMLButtonElement | null>(null)

  return (
    <button
      ref={ref}
      onClick={() => navigate(to)}
      className={`w-full text-left block py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600 text-slate-300 hover:bg-slate-800`}
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
      aria-label={name}
    >
      {name}
    </button>
  )
}
