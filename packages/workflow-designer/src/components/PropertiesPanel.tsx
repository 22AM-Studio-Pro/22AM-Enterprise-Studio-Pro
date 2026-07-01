import React from 'react'
import { useDesignerStore } from '../DesignerStore'
import { WorkflowValidator } from '../WorkflowValidator'

export const PropertiesPanel: React.FC = () => {
  const { workflow, selectedNodeId, selectedEdgeId, updateNode, updateWorkflow } = useDesignerStore()

  const selectedNode = workflow.nodes.find((n) => n.id === selectedNodeId)
  const selectedEdge = workflow.edges.find((e) => e.id === selectedEdgeId)

  const handleWorkflowNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateWorkflow({ name: e.target.value })
  }

  const handleNodeLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedNode) {
      updateNode(selectedNode.id, { label: e.target.value })
    }
  }

  const handleNodeDataChange = (key: string, value: any) => {
    if (selectedNode) {
      updateNode(selectedNode.id, { data: { ...selectedNode.data, [key]: value } })
    }
  }

  const validator = new WorkflowValidator()
  const errors = validator.validate(workflow)

  return (
    <div style={{ width: '300px', borderLeft: '1px solid #ccc', padding: '16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>Properties</h3>

      {/* Workflow properties */}
      {!selectedNodeId && !selectedEdgeId && (
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Workflow Name</label>
          <input
            type="text"
            value={workflow.name}
            onChange={handleWorkflowNameChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />

          {/* Validation errors */}
          {errors.length > 0 && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#ffebee', borderRadius: '4px', fontSize: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#c62828' }}>Validation Issues</div>
              {errors.map((error, idx) => (
                <div key={idx} style={{ marginBottom: '4px', color: '#c62828' }}>
                  • {error.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Node properties */}
      {selectedNode && (
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Node Type</label>
          <div style={{ marginBottom: '16px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>{selectedNode.type}</div>

          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Label</label>
          <input
            type="text"
            value={selectedNode.label}
            onChange={handleNodeLabelChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
              marginBottom: '16px'
            }}
          />

          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Position</label>
          <div style={{ fontSize: '12px', color: '#666' }}>
            X: {Math.round(selectedNode.position.x)}, Y: {Math.round(selectedNode.position.y)}
          </div>

          {/* Node-specific data */}
          {selectedNode.type === 'ai' && (
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>AI Provider</label>
              <select
                value={selectedNode.data.provider || ''}
                onChange={(e) => handleNodeDataChange('provider', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  marginBottom: '16px'
                }}
              >
                <option value="">Select Provider</option>
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
                <option value="elevenLabs">ElevenLabs</option>
              </select>
            </div>
          )}

          {selectedNode.type === 'publishing' && (
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Platforms</label>
              {['facebook', 'youtube', 'tiktok', 'instagram', 'linkedin'].map((platform) => (
                <div key={platform} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    id={platform}
                    checked={(selectedNode.data.platforms || []).includes(platform)}
                    onChange={(e) => {
                      const platforms = selectedNode.data.platforms || []
                      if (e.target.checked) {
                        handleNodeDataChange('platforms', [...platforms, platform])
                      } else {
                        handleNodeDataChange('platforms', platforms.filter((p: string) => p !== platform))
                      }
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  <label htmlFor={platform} style={{ cursor: 'pointer', textTransform: 'capitalize' }}>
                    {platform}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edge properties */}
      {selectedEdge && (
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Connection</label>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
            {selectedEdge.source} → {selectedEdge.target}
          </div>
        </div>
      )}
    </div>
  )
}
