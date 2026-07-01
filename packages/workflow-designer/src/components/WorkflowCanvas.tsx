import React, { useCallback, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useDesignerStore } from '../DesignerStore'
import { nanoid } from 'nanoid'
import { WorkflowNode as WorkflowNodeType } from '../WorkflowTypes'

interface WorkflowCanvasProps {
  isExecuting?: boolean
  executionProgress?: Map<string, number>
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ isExecuting = false, executionProgress }) => {
  const { workflow, addNode, addEdge: addWorkflowEdge, deleteNode, deleteEdge, selectNode, selectEdge } = useDesignerStore()

  // Convert workflow nodes/edges to ReactFlow format
  const nodes: Node[] = workflow.nodes.map((node) => ({
    id: node.id,
    data: {
      label: node.label,
      progress: executionProgress?.get(node.id) || 0,
      isExecuting: isExecuting && executionProgress?.has(node.id)
    },
    position: node.position,
    type: node.type === 'logic' ? 'default' : node.type
  }))

  const edges: Edge[] = workflow.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: isExecuting
  }))

  const [rfNodes, setNodes, onNodesChange] = useNodesState(nodes)
  const [rfEdges, setEdges, onEdgesChange] = useEdgesState(edges)

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = {
        id: nanoid(),
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle
      }
      addWorkflowEdge(edge)
      setEdges((eds) => addEdge(connection, eds))
    },
    [addWorkflowEdge, setEdges]
  )

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectNode(node.id)
    },
    [selectNode]
  )

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      selectEdge(edge.id)
    },
    [selectEdge]
  )

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      for (const node of deleted) {
        deleteNode(node.id)
      }
    },
    [deleteNode]
  )

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      for (const edge of deleted) {
        deleteEdge(edge.id)
      }
    },
    [deleteEdge]
  )

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  )
}
