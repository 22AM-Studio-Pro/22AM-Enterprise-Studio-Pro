import React from 'react'
import { useExecutionStore } from '../ExecutionStore'

export const ExecutionDebugger: React.FC = () => {
  const { context, nodeStatuses } = useExecutionStore()

  if (!context) {
    return (
      <div style={{ padding: '16px', color: '#9ca3af', textAlign: 'center' }}>
        No execution in progress
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', fontSize: '12px' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Execution Context</div>
        <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '4px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(
            {
              executionId: context.executionId,
              workflowId: context.workflowId,
              state: context.state,
              startTime: context.startTime,
              endTime: context.endTime,
              nodeCount: context.nodeStates.size,
              eventCount: context.events.length,
              outputCount: context.output.size
            },
            null,
            2
          )}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Node Statuses</div>
        {Array.from(nodeStatuses.entries()).map(([nodeId, status]) => (
          <div key={nodeId} style={{ marginBottom: '8px', padding: '8px', background: '#f3f4f6', borderRadius: '4px' }}>
            <div>
              <span style={{ fontWeight: 'bold' }}>{nodeId}:</span> {status.status}
            </div>
            {status.output && <div style={{ color: '#6b7280', marginTop: '4px' }}>Output: {JSON.stringify(status.output).slice(0, 50)}...</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
