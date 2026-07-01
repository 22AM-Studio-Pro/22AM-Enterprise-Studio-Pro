import React from 'react'
import { useDesktopStore } from '../store/DesktopStore'

interface DashboardWidgetProps {
  title: string
  icon: string
  data?: any
  isLoading?: boolean
  onAction?: () => void
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ title, icon, data, isLoading, onAction }) => {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        cursor: onAction ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s'
      }}
      onClick={onAction}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <span style={{ fontWeight: 'bold' }}>{title}</span>
      </div>
      {isLoading ? (
        <div style={{ color: '#9ca3af' }}>Loading...</div>
      ) : (
        <div style={{ fontSize: '12px', color: '#6b7280' }}>{JSON.stringify(data || {})}</div>
      )}
    </div>
  )
}

export const Dashboard: React.FC = () => {
  const { dashboardWidgets, loading } = useDesktopStore()

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ marginBottom: '24px' }}>Dashboard</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}
      >
        <DashboardWidget
          title="Recent Workflows"
          icon="📋"
          data={{ count: 5 }}
          onAction={() => console.log('Navigate to workflows')}
        />
        <DashboardWidget title="Active Executions" icon="⚡" data={{ count: 0 }} />
        <DashboardWidget title="Assets Generated" icon="🖼️" data={{ count: 42 }} />
        <DashboardWidget title="Published Posts" icon="📤" data={{ count: 18 }} />
        <DashboardWidget title="System Status" icon="🟢" data={{ status: 'Healthy' }} />
        <DashboardWidget title="Storage Usage" icon="💾" data={{ used: '2.3 GB / 10 GB' }} />
      </div>
    </div>
  )
}
