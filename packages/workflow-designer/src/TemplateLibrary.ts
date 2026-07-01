import { WorkflowTemplate } from './IntegrationTypes'

export class TemplateLibrary {
  private templates: Map<string, WorkflowTemplate> = new Map()

  registerTemplate(template: WorkflowTemplate): void {
    this.templates.set(template.id, template)
  }

  getTemplate(id: string): WorkflowTemplate | undefined {
    return this.templates.get(id)
  }

  getAllTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values())
  }

  getTemplatesByCategory(category: string): WorkflowTemplate[] {
    return this.getAllTemplates().filter((t) => t.category === category)
  }

  getTemplatesByTag(tag: string): WorkflowTemplate[] {
    return this.getAllTemplates().filter((t) => t.tags?.includes(tag))
  }

  searchTemplates(query: string): WorkflowTemplate[] {
    const q = query.toLowerCase()
    return this.getAllTemplates().filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
    )
  }

  removeTemplate(id: string): boolean {
    return this.templates.delete(id)
  }
}

export const DEFAULT_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tpl-content-gen',
    name: 'Content Generation Pipeline',
    description: 'Generate, edit, and publish content automatically',
    category: 'content-creation',
    tags: ['ai', 'content', 'multi-step'],
    nodes: [
      { id: 'n1', type: 'ai', label: 'Generate Idea', position: { x: 0, y: 0 }, data: {} },
      { id: 'n2', type: 'ai', label: 'Write Content', position: { x: 200, y: 0 }, data: {} },
      { id: 'n3', type: 'asset', label: 'Save Asset', position: { x: 400, y: 0 }, data: {} }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' }
    ]
  },
  {
    id: 'tpl-social-publish',
    name: 'Social Media Publisher',
    description: 'Publish content to multiple social platforms',
    category: 'social-publishing',
    tags: ['publishing', 'social', 'multi-platform'],
    nodes: [
      { id: 'n1', type: 'asset', label: 'Load Asset', position: { x: 0, y: 0 }, data: {} },
      { id: 'n2', type: 'publishing', label: 'Publish', position: { x: 200, y: 0 }, data: {} }
    ],
    edges: [{ id: 'e1', source: 'n1', target: 'n2' }]
  }
]
