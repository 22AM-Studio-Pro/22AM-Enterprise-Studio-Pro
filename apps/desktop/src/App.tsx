import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'

function Dashboard() { return <div>Dashboard</div> }
function Jobs() { return <div>Jobs</div> }
function Workflows() { return <div>Workflows</div> }
function Assets() { return <div>Assets</div> }
function Plugins() { return <div>Plugins</div> }
function Settings() { return <div>Settings</div> }

export default function App(){
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 p-4 border-r dark:border-slate-700">
        <nav className="space-y-2">
          <Link to="/">Dashboard</Link>
          <Link to="/jobs">Jobs</Link>
          <Link to="/workflows">Workflows</Link>
          <Link to="/assets">Assets</Link>
          <Link to="/plugins">Plugins</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/jobs" element={<Jobs/>} />
          <Route path="/workflows" element={<Workflows/>} />
          <Route path="/assets" element={<Assets/>} />
          <Route path="/plugins" element={<Plugins/>} />
          <Route path="/settings" element={<Settings/>} />
        </Routes>
      </main>
    </div>
  )
}
