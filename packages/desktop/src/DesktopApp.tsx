import React from 'react'
import { useDesktopStore } from '../store/DesktopStore'
import { Dashboard } from '../pages/Dashboard'
import { RecentProjects } from '../pages/RecentProjects'
import { GlobalNotifications } from '../components/GlobalNotifications'
import { LoadingOverlay } from '../components/LoadingOverlay'
import { ErrorBoundary } from '../components/ErrorBoundary'

export const DesktopApp: React.FC = () => {
  const { session, setTheme, toggleSidebar, setLastVisitedTab, loading } = useDesktopStore()
  const [currentPage, setCurrentPage] = React.useState<string>(session.lastVisitedTab || 'dashboard')

  const pages: Record<string, React.ComponentType> = {
    dashboard: Dashboard,
    projects: RecentProjects
  }

  const CurrentPage = pages[currentPage] || Dashboard

  return (
    <ErrorBoundary>
      <div
        style={{
          display: 'flex',
          height: '100vh',
          background: session.theme === 'dark' ? '#1f2937' : '#f9fafb',
          color: session.theme === 'dark' ? '#fff' : '#000'
        }}
      >
        {/* Sidebar */}
        {!session.sidebarCollapsed && (
          <div
            style={{
              width: '250px',
              background: session.theme === 'dark' ? '#111827' : '#ffffff',
              borderRight: '1px solid #e5e7eb',
              padding: '16px',
              overflowY: 'auto'
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '24px' }}>22AM Studio</div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'dashboard', label: '📊 Dashboard' },
                { id: 'projects', label: '📁 Projects' },
                { id: 'designer', label: '🎨 Designer' },
                { id: 'execution', label: '⚡ Executions' },
                { id: 'settings', label: '⚙️ Settings' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id)
                    setLastVisitedTab(item.id)
                  }}
                  style={{
                    padding: '12px',
                    background: currentPage === item.id ? '#3b82f6' : 'transparent',
                    color: currentPage === item.id ? 'white' : 'inherit',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Top Bar */}
          <div
            style={{
              background: session.theme === 'dark' ? '#111827' : '#ffffff',
              borderBottom: '1px solid #e5e7eb',
              padding: '16px 32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <button
              onClick={toggleSidebar}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ☰
            </button>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button
                onClick={() => setTheme(session.theme === 'light' ? 'dark' : 'light')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                {session.theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>

          {/* Page Content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <CurrentPage />
          </div>
        </div>
      </div>

      {/* Global Components */}
      <GlobalNotifications />
      <LoadingOverlay show={loading.isLoading} progress={loading.progress} message={loading.message} />
    </ErrorBoundary>
  )
}
