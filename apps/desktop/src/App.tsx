import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Jobs } from './pages/Jobs'
import { Workflows } from './pages/Workflows'
import { Assets } from './pages/Assets'
import { Plugins } from './pages/Plugins'
import { Settings } from './pages/Settings'
import { ErrorBoundary } from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/workflows" element={<Workflows />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}
