import React, { useCallback } from 'react'
import { useDesignerStore } from '../DesignerStore'
import { CanvasLayoutEngine } from '../CanvasLayoutEngine'

export const Toolbar: React.FC = () => {
  const { workflow, isDirty, canUndo, canRedo, undo, redo, save } = useDesignerStore()

  const handleAutoLayout = useCallback(() => {
    const engine = new CanvasLayoutEngine()
    const positions = engine.layoutHierarchical(workflow.nodes, workflow.edges)

    for (const node of workflow.nodes) {
      const pos = positions.get(node.id)
      if (pos) {
        node.position = pos
      }
    }
  }, [workflow])

  const handleSave = useCallback(() => {
    save()
    // In real app, would trigger API call to persist
  }, [save])

  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #ccc',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        background: '#fafafa'
      }}
    >
      <button
        onClick={undo}
        disabled={!canUndo()}
        title="Undo (Ctrl+Z)"
        style={{
          padding: '8px 12px',
          background: canUndo() ? '#007bff' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: canUndo() ? 'pointer' : 'not-allowed',
          fontSize: '12px'
        }}
      >
        ↶ Undo
      </button>

      <button
        onClick={redo}
        disabled={!canRedo()}
        title="Redo (Ctrl+Y)"
        style={{
          padding: '8px 12px',
          background: canRedo() ? '#007bff' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: canRedo() ? 'pointer' : 'not-allowed',
          fontSize: '12px'
        }}
      >
        ↷ Redo
      </button>

      <div style={{ width: '1px', height: '24px', background: '#ccc' }} />

      <button
        onClick={handleAutoLayout}
        title="Auto-layout nodes"
        style={{
          padding: '8px 12px',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        📐 Auto Layout
      </button>

      <button
        onClick={handleSave}
        title="Save workflow (Ctrl+S)"
        style={{
          padding: '8px 12px',
          background: isDirty ? '#ff6b6b' : '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        💾 Save {isDirty ? '*' : ''}
      </button>

      <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
        Nodes: {workflow.nodes.length} | Connections: {workflow.edges.length}
      </div>
    </div>
  )
}
