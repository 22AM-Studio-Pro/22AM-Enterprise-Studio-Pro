import React from 'react'

const Icon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

export const StatusCard: React.FC<{ title: string; value: string | number; accent?: React.ReactNode }> = ({ title, value, accent }) => {
  return (
    <div className="p-4 rounded-lg bg-slate-800 text-slate-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-400">{title}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
        </div>
        <div className="ml-4 text-slate-400">{accent ?? <Icon />}</div>
      </div>
    </div>
  )
}
