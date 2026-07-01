import { nanoid } from 'nanoid'
import { WorkflowNode, NodeType } from './WorkflowTypes'

export type NodePaletteItem = {
  type: NodeType
  label: string
  description: string
  category: 'AI' | 'Assets' | 'Publishing' | 'Logic'
  icon: string
  configurable: boolean
}

export const NODE_PALETTE: NodePaletteItem[] = [
  // AI Nodes
  {
    type: 'ai',
    label: 'Text Generation',
    description: 'Generate text with AI (OpenAI, Gemini)',
    category: 'AI',
    icon: '✨',
    configurable: true
  },
  {
    type: 'ai',
    label: 'Image Generation',
    description: 'Generate images (Runway, Pika)',
    category: 'AI',
    icon: '🖼️',
    configurable: true
  },
  {
    type: 'ai',
    label: 'Voice Generation',
    description: 'Generate speech (ElevenLabs)',
    category: 'AI',
    icon: '🎤',
    configurable: true
  },
  // Asset Nodes
  {
    type: 'asset',
    label: 'Load Asset',
    description: 'Load an asset from library',
    category: 'Assets',
    icon: '📦',
    configurable: true
  },
  {
    type: 'asset',
    label: 'Save Asset',
    description: 'Save output to asset library',
    category: 'Assets',
    icon: '💾',
    configurable: true
  },
  {
    type: 'asset',
    label: 'Search Assets',
    description: 'Search and filter assets',
    category: 'Assets',
    icon: '🔍',
    configurable: true
  },
  // Publishing Nodes
  {
    type: 'publishing',
    label: 'Publish',
    description: 'Publish to social platforms',
    category: 'Publishing',
    icon: '📤',
    configurable: true
  },
  {
    type: 'publishing',
    label: 'Schedule Post',
    description: 'Schedule publishing for later',
    category: 'Publishing',
    icon: '⏰',
    configurable: true
  },
  {
    type: 'publishing',
    label: 'Get Analytics',
    description: 'Fetch platform analytics',
    category: 'Publishing',
    icon: '📊',
    configurable: true
  },
  // Logic Nodes
  {
    type: 'logic',
    label: 'Condition',
    description: 'Conditional branching',
    category: 'Logic',
    icon: '🔀',
    configurable: true
  },
  {
    type: 'logic',
    label: 'Loop',
    description: 'Iterate over items',
    category: 'Logic',
    icon: '🔄',
    configurable: true
  },
  {
    type: 'logic',
    label: 'Merge',
    description: 'Merge multiple branches',
    category: 'Logic',
    icon: '🔗',
    configurable: false
  }
]

export class NodeFactory {
  static createNode(type: NodeType, label: string, x: number = 0, y: number = 0): WorkflowNode {
    return {
      id: nanoid(),
      type,
      label,
      position: { x, y },
      data: {},
      disabled: false
    }
  }

  static getPaletteItem(type: NodeType, label: string): NodePaletteItem | undefined {
    return NODE_PALETTE.find((item) => item.type === type && item.label === label)
  }

  static getPalettesByCategory(category: string): NodePaletteItem[] {
    return NODE_PALETTE.filter((item) => item.category === category)
  }
}
