import React from 'react'
import { useExecutionStore } from '../ExecutionStore'

export const ExecutionEventLog: React.FC = () => {
  const { context } = useExecutionStore()

  if (!context || context.events.length === 0) {
    return (
      <div style={{ padding: '16px', color: '#9ca3af', textAlign: 'center', fontSize: '12px' }}>
        No events yet
      </div>
    )
  }

  return (
    <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '12px', fontFamily: 'monospace' }}>
      {context.events.map((event) => (
        <div key={event.id} style={{ padding: '8px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '8px' }}>
          <span style={{ color: '#9ca3af', minWidth: '80px' }}>{new Date(event.timestamp).toLocaleTimeString()}</span>
          <span
            style={{
              color:
                event.type === 'error' ? '#ef4444' : event.type === 'complete' ? '#10b981' : event.type === 'start' ? '#3b82f6' : '#6b7280',
              fontWeight: 'bold',
              minWidth: '70px'
            }}
          >
            {event.type.toUpperCase()}
          </span>
          <span style={{ color: '#374151' }}>{event.nodeId}</span>
          {event.error && <span style={{ color: '#ef4444' }}>Error: {event.error}</span>}
        </div>
      ))}
    </div>
  )
}
