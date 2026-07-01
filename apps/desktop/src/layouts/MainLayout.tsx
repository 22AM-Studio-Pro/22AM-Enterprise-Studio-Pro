import React from 'react'
import { Sidebar } from '../components/Sidebar/Sidebar'
import { TopBar } from '../components/TopBar/TopBar'

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((s) => !s)} />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  )
}
