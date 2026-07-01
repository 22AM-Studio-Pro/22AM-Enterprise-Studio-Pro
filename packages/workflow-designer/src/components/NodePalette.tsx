import React, { useState } from 'react'
import { NODE_PALETTE, NodeFactory } from '../NodePalette'
import { useDesignerStore } from '../DesignerStore'

export const NodePalette: React.FC = () => {
  const { workflow } = useDesignerStore()
  const { addNode } = useDesignerStore()
  const [expandedCategory, setExpandedCategory] = useState<string | null>('AI')

  const categories = ['AI', 'Assets', 'Publishing', 'Logic']

  const onDragStart = (e: React.DragEvent, label: string, type: any) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('application/reactflow', JSON.stringify({ type, label }))
  }

  const handleAddNode = (label: string, type: any) => {
    const node = NodeFactory.createNode(type, label, Math.random() * 500, Math.random() * 500)
    addNode(node)
  }

  return (
    <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>Node Palette</h3>

      {categories.map((category) => {
        const items = NODE_PALETTE.filter((item) => item.category === category)
        const isExpanded = expandedCategory === category

        return (
          <div key={category} style={{ marginBottom: '16px' }}>
            <button
              onClick={() => setExpandedCategory(isExpanded ? null : category)}
              style={{
                width: '100%',
                padding: '8px',
                background: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                textAlign: 'left'
              }}
            >
              {category} {isExpanded ? '▼' : '▶'}
            </button>

            {isExpanded && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((item) => (
                  <div
                    key={item.label}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.label, item.type)}
                    onClick={() => handleAddNode(item.label, item.type)}
                    style={{
                      padding: '8px',
                      background: '#e8f4f8',
                      border: '1px solid #b3e5fc',
                      borderRadius: '4px',
                      cursor: 'grab',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>{item.label}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
