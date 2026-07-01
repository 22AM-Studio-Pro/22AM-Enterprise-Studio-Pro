import React, { useEffect } from 'react'
import { useDesignerStore } from '../DesignerStore'

export const useKeyboardShortcuts = () => {
  const { undo, redo, canUndo, canRedo, save, workflow, reset } = useDesignerStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey

      // Ctrl/Cmd + Z: Undo
      if (ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo()) undo()
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if ((ctrlKey && e.key === 'z' && e.shiftKey) || (ctrlKey && e.key === 'y')) {
        e.preventDefault()
        if (canRedo()) redo()
      }

      // Ctrl/Cmd + S: Save
      if (ctrlKey && e.key === 's') {
        e.preventDefault()
        save()
      }

      // Ctrl/Cmd + A: Select all (prevent browser default)
      if (ctrlKey && e.key === 'a') {
        e.preventDefault()
      }

      // Delete: Delete selected node/edge
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedNodeId, selectedEdgeId, deleteNode, deleteEdge } = useDesignerStore.getState()
        if (selectedNodeId) {
          e.preventDefault()
          deleteNode(selectedNodeId)
        } else if (selectedEdgeId) {
          e.preventDefault()
          deleteEdge(selectedEdgeId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, canUndo, canRedo, save])
}
