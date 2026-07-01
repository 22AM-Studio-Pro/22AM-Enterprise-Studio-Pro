import React from 'react'

export const EmptyState: React.FC<{ title?: string; description?: string }> = ({ title = 'No data', description = "There's nothing to show right now." }) => {
  return (
    <div className="w-full p-6 rounded-lg bg-slate-800 text-slate-200">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  )
}
