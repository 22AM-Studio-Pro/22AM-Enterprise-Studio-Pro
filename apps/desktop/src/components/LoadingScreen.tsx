import React from 'react'

export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-500 border-t-transparent animate-spin" />
        <div className="text-slate-300">{message}</div>
      </div>
    </div>
  )
}
