import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import { WorkflowDefinition, WorkflowNode, WorkflowEdge } from './WorkflowTypes'

export type DesignerState = {
  workflow: WorkflowDefinition
  selectedNodeId: string | null
  selectedEdgeId: string | null
  history: WorkflowDefinition[]
  historyIndex: number
  isDirty: boolean

  // Actions
  setWorkflow: (workflow: WorkflowDefinition) => void
  updateWorkflow: (updates: Partial<WorkflowDefinition>) => void
  addNode: (node: WorkflowNode) => void
  updateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void
  deleteNode: (nodeId: string) => void
  addEdge: (edge: WorkflowEdge) => void
  updateEdge: (edgeId: string, updates: Partial<WorkflowEdge>) => void
  deleteEdge: (edgeId: string) => void
  selectNode: (nodeId: string | null) => void
  selectEdge: (edgeId: string | null) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  save: () => void
  reset: () => void
}

const createInitialWorkflow = (): WorkflowDefinition => ({
  id: nanoid(),
  name: 'Untitled Workflow',
  description: '',
  nodes: [],
  edges: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

export const useDesignerStore = create<DesignerState>(
  immer((set, get) => ({
    workflow: createInitialWorkflow(),
    selectedNodeId: null,
    selectedEdgeId: null,
    history: [createInitialWorkflow()],
    historyIndex: 0,
    isDirty: false,

    setWorkflow: (workflow) =>
      set((state) => {
        state.workflow = workflow
        state.history = [workflow]
        state.historyIndex = 0
        state.isDirty = false
      }),

    updateWorkflow: (updates) =>
      set((state) => {
        state.workflow = { ...state.workflow, ...updates, updatedAt: new Date().toISOString() }
        state.isDirty = true
      }),

    addNode: (node) =>
      set((state) => {
        state.workflow.nodes.push(node)
        state.workflow.updatedAt = new Date().toISOString()
        state.isDirty = true
      }),

    updateNode: (nodeId, updates) =>
      set((state) => {
        const node = state.workflow.nodes.find((n) => n.id === nodeId)
        if (node) {
          Object.assign(node, updates)
          state.workflow.updatedAt = new Date().toISOString()
          state.isDirty = true
        }
      }),

    deleteNode: (nodeId) =>
      set((state) => {
        state.workflow.nodes = state.workflow.nodes.filter((n) => n.id !== nodeId)
        state.workflow.edges = state.workflow.edges.filter((e) => e.source !== nodeId && e.target !== nodeId)
        if (state.selectedNodeId === nodeId) state.selectedNodeId = null
        state.workflow.updatedAt = new Date().toISOString()
        state.isDirty = true
      }),

    addEdge: (edge) =>
      set((state) => {
        state.workflow.edges.push(edge)
        state.workflow.updatedAt = new Date().toISOString()
        state.isDirty = true
      }),

    updateEdge: (edgeId, updates) =>
      set((state) => {
        const edge = state.workflow.edges.find((e) => e.id === edgeId)
        if (edge) {
          Object.assign(edge, updates)
          state.workflow.updatedAt = new Date().toISOString()
          state.isDirty = true
        }
      }),

    deleteEdge: (edgeId) =>
      set((state) => {
        state.workflow.edges = state.workflow.edges.filter((e) => e.id !== edgeId)
        if (state.selectedEdgeId === edgeId) state.selectedEdgeId = null
        state.workflow.updatedAt = new Date().toISOString()
        state.isDirty = true
      }),

    selectNode: (nodeId) =>
      set((state) => {
        state.selectedNodeId = nodeId
        state.selectedEdgeId = null
      }),

    selectEdge: (edgeId) =>
      set((state) => {
        state.selectedEdgeId = edgeId
        state.selectedNodeId = null
      }),

    undo: () =>
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex -= 1
          state.workflow = state.history[state.historyIndex]
        }
      }),

    redo: () =>
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex += 1
          state.workflow = state.history[state.historyIndex]
        }
      }),

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    save: () =>
      set((state) => {
        state.history = state.history.slice(0, state.historyIndex + 1)
        state.history.push(state.workflow)
        state.historyIndex = state.history.length - 1
        state.isDirty = false
      }),

    reset: () =>
      set((state) => {
        state.workflow = createInitialWorkflow()
        state.selectedNodeId = null
        state.selectedEdgeId = null
        state.history = [createInitialWorkflow()]
        state.historyIndex = 0
        state.isDirty = false
      })
  }))
)
