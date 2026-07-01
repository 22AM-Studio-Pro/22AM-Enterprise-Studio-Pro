import React, { useEffect, useState } from 'react'

export const RecentProjects: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load recent projects from store/API
    setLoading(false)
  }, [])

  if (loading) {
    return <div style={{ padding: '32px', textAlign: 'center' }}>Loading projects...</div>
  }

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ marginBottom: '24px' }}>Recent Projects</h1>
      {projects.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 32px',
            color: '#9ca3af',
            background: '#f9fafb',
            borderRadius: '8px'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <div style={{ fontSize: '18px' }}>No projects yet</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>Create a new workflow to get started</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {projects.map((project: any) => (
            <div
              key={project.id}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{project.name}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{project.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
