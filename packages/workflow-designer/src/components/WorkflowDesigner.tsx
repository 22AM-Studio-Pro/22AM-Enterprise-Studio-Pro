import React, { useState } from 'react'
import { useDesignerStore } from '../DesignerStore'
import { WorkflowCanvas } from './WorkflowCanvas'
import { NodePalette } from './NodePalette'
import { PropertiesPanel } from './PropertiesPanel'
import { Toolbar } from './Toolbar'
import { WorkflowValidator } from '../WorkflowValidator'

interface WorkflowDesignerProps {
  isExecuting?: boolean
  executionProgress?: Map<string, number>
}

export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({ isExecuting = false, executionProgress }) => {
  const { workflow } = useDesignerStore()
  const [showValidation, setShowValidation] = useState(false)

  const validator = new WorkflowValidator()
  const errors = validator.validate(workflow)
  const hasErrors = errors.some((e) => e.severity === 'error')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff' }}>
      <Toolbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <NodePalette />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <WorkflowCanvas isExecuting={isExecuting} executionProgress={executionProgress} />

          {/* Validation banner */}
          {hasErrors && (
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                background: '#ffebee',
                border: '2px solid #c62828',
                borderRadius: '4px',
                padding: '12px',
                maxWidth: '400px',
                fontSize: '12px',
                color: '#c62828',
                cursor: 'pointer',
                zIndex: 10
              }}
              onClick={() => setShowValidation(!showValidation)}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>⚠️ Validation Issues ({errors.length})</div>
              {showValidation && (
                <div>
                  {errors.map((error, idx) => (
                    <div key={idx} style={{ marginBottom: '4px' }}>
                      • {error.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <PropertiesPanel />
      </div>
    </div>
  )
}
