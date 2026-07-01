import React from 'react'

export const NotificationsPanel: React.FC<{ items: { id: string; message: string }[] }> = ({ items }) => {
  if (!items || items.length === 0) return null
  return (
    <div className="absolute right-4 top-12 w-80 bg-slate-800 rounded-lg shadow p-2" role="region" aria-label="Notifications">
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="text-sm text-slate-200">{it.message}</li>
        ))}
      </ul>
    </div>
  )
}
