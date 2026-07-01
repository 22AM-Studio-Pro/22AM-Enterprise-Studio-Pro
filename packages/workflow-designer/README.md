# Workflow Designer

> A comprehensive visual workflow builder for designing, validating, and executing complex workflows. Built with React, TypeScript, and ReactFlow.

## Features

✨ **Visual Design**
- Drag-and-drop node palette with 12+ predefined node types
- Real-time canvas rendering with ReactFlow
- Hierarchical and force-directed auto-layout algorithms
- Smooth animations and transitions

🔄 **State Management**
- Zustand-based state management with Immer middleware
- Full undo/redo history tracking
- Real-time synchronization between components
- Efficient change detection

✅ **Validation**
- Circular dependency detection
- Node and edge validation
- Real-time error reporting
- Workflow structure validation

⚡ **Execution**
- Real-time execution tracking
- Progress monitoring per node
- Event streaming support
- Pause/resume/stop controls
- Execution debugger with state inspection

📋 **Import/Export**
- JSON format serialization
- YAML format export
- Template cloning
- Workflow migration

🎨 **UI/UX**
- Command palette (Ctrl+K)
- Keyboard shortcuts (Ctrl+Z, Ctrl+S, Delete)
- Properties panel for node configuration
- Event logging and debugging interface
- Responsive design

🔌 **Extensibility**
- Plugin system with manifest-based registration
- Custom node type support
- API integration layer
- Template library system

## Installation

```bash
npm install @22am/workflow-designer
```

### Peer Dependencies

```bash
npm install react react-dom reactflow zustand
```

## Quick Start

### Basic Usage

```tsx
import React from 'react'
import { WorkflowDesigner } from '@22am/workflow-designer'

function App() {
  return <WorkflowDesigner />
}

export default App
```

### With Execution Tracking

```tsx
import React, { useState } from 'react'
import { WorkflowDesignerWithExecution } from '@22am/workflow-designer'

function App() {
  return <WorkflowDesignerWithExecution />
}

export default App
```

## Core Concepts

### Workflow

A workflow is a DAG (Directed Acyclic Graph) of connected nodes representing a process.

```typescript
type WorkflowDefinition = {
  id: string
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  createdAt: string
  updatedAt: string
}
```

### Node Types

- **AI**: Text/image/voice generation (OpenAI, Gemini, ElevenLabs)
- **Asset**: Load, save, search assets
- **Publishing**: Publish to social platforms, schedule posts
- **Logic**: Conditionals, loops, merge operations
- **Input/Output**: Data flow endpoints

### Store Architecture

#### Designer Store

Manages workflow structure and editing state:

```typescript
const { workflow, addNode, addEdge, undo, redo, save } = useDesignerStore()
```

#### Execution Store

Tracks real-time execution:

```typescript
const { context, isExecuting, progress, startExecution, stopExecution } = useExecutionStore()
```

## Advanced Features

### Validation

```typescript
import { WorkflowValidator } from '@22am/workflow-designer'

const validator = new WorkflowValidator()
const errors = validator.validate(workflow)
errors.forEach(e => console.log(e.message))
```

### Serialization

```typescript
import { WorkflowSerializer } from '@22am/workflow-designer'

// Export to JSON
const json = WorkflowSerializer.export(workflow)

// Export to YAML
const yaml = WorkflowSerializer.exportAsYAML(workflow)

// Download
WorkflowSerializer.downloadJSON(workflow, 'my-workflow.json')
```

### API Integration

```typescript
import { WorkflowAPI } from '@22am/workflow-designer'

const api = new WorkflowAPI('https://api.example.com')
api.setAuthToken('your-token')

const result = await api.saveWorkflow('wf-1', workflow)
const execution = await api.executeWorkflow('wf-1', { input: 'data' })
```

### Template Library

```typescript
import { TemplateLibrary, DEFAULT_TEMPLATES } from '@22am/workflow-designer'

const library = new TemplateLibrary()
DEFAULT_TEMPLATES.forEach(t => library.registerTemplate(t))

const contentTemplates = library.getTemplatesByCategory('content-creation')
const results = library.searchTemplates('social')
```

### Plugin System

```typescript
import { PluginSystem } from '@22am/workflow-designer'

const plugins = new PluginSystem()

const manifest = {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  description: 'Custom plugin',
  author: 'Me',
  entry: 'index.js',
  nodeTypes: ['custom-node']
}

const instance = { customMethod: () => 'result' }
plugins.registerPlugin(manifest, instance)

const result = plugins.callPluginMethod('my-plugin', 'customMethod')
```

### Keyboard Shortcuts

```typescript
import { useKeyboardShortcuts } from '@22am/workflow-designer'

function MyComponent() {
  useKeyboardShortcuts()
  // Ctrl/Cmd + Z: Undo
  // Ctrl/Cmd + Shift + Z: Redo
  // Ctrl/Cmd + S: Save
  // Delete: Delete selected node/edge
}
```

### Command Palette

```tsx
import { CommandPalette } from '@22am/workflow-designer'

const commands = [
  {
    id: 'save',
    label: 'Save Workflow',
    category: 'File',
    shortcut: 'Ctrl+S',
    action: () => { /* save logic */ }
  }
]

<CommandPalette commands={commands} />
```

## Execution Flow

1. **Start** → Initialize execution context
2. **Node Execution** → Process each node sequentially or in parallel
3. **Progress Updates** → Real-time progress tracking
4. **Event Streaming** → WebSocket or polling-based event delivery
5. **Completion** → Store outputs and execution history

## Component API

### WorkflowDesigner

Main visual editor component.

```tsx
<WorkflowDesigner isExecuting={false} executionProgress={new Map()} />
```

### WorkflowCanvas

ReactFlow-based canvas for nodes and edges.

```tsx
<WorkflowCanvas isExecuting={false} executionProgress={new Map()} />
```

### NodePalette

Draggable node templates.

```tsx
<NodePalette />
```

### PropertiesPanel

Node and workflow property editor.

```tsx
<PropertiesPanel />
```

### Toolbar

Edit controls (undo, redo, auto-layout, save).

```tsx
<Toolbar />
```

### ExecutionPanel

Execution controls and status.

```tsx
<ExecutionPanel onStart={() => {}} onStop={() => {}} />
```

### ExecutionEventLog

Real-time event viewer.

```tsx
<ExecutionEventLog />
```

### ExecutionDebugger

Execution state inspector.

```tsx
<ExecutionDebugger />
```

## Data Flow

```
User Input
    ↓
Designer Store (Zustand + Immer)
    ↓
┌─────────────────┬─────────────────────┐
│  Nodes & Edges  │  History & Selection │
└─────────────────┴─────────────────────┘
    ↓
Components (Canvas, Palette, Properties)
    ↓
Execution Store (if running)
    ↓
API / WebSocket
    ↓
Backend Workflow Engine
```

## Testing

```bash
npm run test
```

Test suites included:
- `validator.test.ts` - Workflow validation
- `store.test.ts` - State management
- `layout.test.ts` - Canvas layout algorithms
- `serializer.test.ts` - JSON/YAML export
- `event-stream.test.ts` - Event streaming
- `execution.test.ts` - Execution tracking
- `integration.test.ts` - API and plugins

## Architecture

### Directory Structure

```
src/
├── WorkflowTypes.ts          # Type definitions
├── ExecutionTypes.ts         # Execution types
├── IntegrationTypes.ts       # API/plugin types
├── DesignerStore.ts          # Workflow state (Zustand)
├── ExecutionStore.ts         # Execution state
├── WorkflowValidator.ts      # Validation logic
├── WorkflowSerializer.ts     # Import/export
├── CanvasLayoutEngine.ts     # Layout algorithms
├── ExecutionEventStream.ts   # WebSocket handling
├── WorkflowAPI.ts            # Backend API client
├── TemplateLibrary.ts        # Template management
├── PluginSystem.ts           # Plugin framework
├── NodePalette.ts            # Node definitions
├── hooks/
│   └── useKeyboardShortcuts.ts
├── components/
│   ├── WorkflowDesigner.tsx
│   ├── WorkflowCanvas.tsx
│   ├── NodePalette.tsx
│   ├── PropertiesPanel.tsx
│   ├── Toolbar.tsx
│   ├── CommandPalette.tsx
│   ├── ExecutionOverlay.tsx
│   ├── ExecutionPanel.tsx
│   ├── ExecutionEventLog.tsx
│   ├── ExecutionDebugger.tsx
│   └── WorkflowDesignerWithExecution.tsx
└── index.ts                  # Main exports
```

## Performance Considerations

- **Zustand + Immer**: Efficient immutable updates with automatic batching
- **React Flow**: GPU-accelerated canvas rendering
- **Memoization**: Components memoized to prevent unnecessary re-renders
- **Event Streaming**: Batched updates to reduce network overhead
- **Layout Engine**: Incremental layout calculations

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

## Contributing

Contributions welcome! Please follow the existing code style and add tests for new features.

## Support

For issues and questions, please visit: https://github.com/22AM-Studio-Pro/22AM-Enterprise-Studio-Pro
