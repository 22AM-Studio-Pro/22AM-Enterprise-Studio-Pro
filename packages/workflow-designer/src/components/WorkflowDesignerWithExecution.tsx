import React, { useState } from 'react'
import { WorkflowDesigner } from './WorkflowDesigner'
import { ExecutionEventLog } from './ExecutionEventLog'
import { ExecutionDebugger } from './ExecutionDebugger'
import { useExecutionStore } from '../ExecutionStore'

type TabType = 'designer' | 'logs' | 'debugger'

interface WorkflowDesignerWithExecutionProps {
  initialWorkflow?: any
}

export const WorkflowDesignerWithExecution: React.FC<WorkflowDesignerWithExecutionProps> = ({ initialWorkflow }) => {
  const [activeTab, setActiveTab] = useState<TabType>('designer')
  const { isExecuting } = useExecutionStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          background: '#fafafa'
        }}
      >
        {(['designer', 'logs', 'debugger'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: activeTab === tab ? 'white' : 'transparent',
              borderBottom: activeTab === tab ? '2px solid #007bff' : 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              color: activeTab === tab ? '#007bff' : '#6b7280'
            }}
          >
            {tab === 'designer' && '🎨 Designer'}
            {tab === 'logs' && '📋 Event Logs'}
            {tab === 'debugger' && '🐛 Debugger'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'hidden', background: 'white' }}>
        {activeTab === 'designer' && <WorkflowDesigner isExecuting={isExecuting} />}
        {activeTab === 'logs' && <ExecutionEventLog />}
        {activeTab === 'debugger' && <ExecutionDebugger />}
      </div>
    </div>
  )
}
