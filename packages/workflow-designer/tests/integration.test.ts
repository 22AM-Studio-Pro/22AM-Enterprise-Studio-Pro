import { describe, it, expect } from 'vitest'
import { WorkflowAPI } from '../src/WorkflowAPI'
import { TemplateLibrary, DEFAULT_TEMPLATES } from '../src/TemplateLibrary'
import { PluginSystem } from '../src/PluginSystem'

describe('TemplateLibrary', () => {
  it('registers and retrieves templates', () => {
    const library = new TemplateLibrary()
    library.registerTemplate(DEFAULT_TEMPLATES[0])
    const template = library.getTemplate(DEFAULT_TEMPLATES[0].id)
    expect(template).toEqual(DEFAULT_TEMPLATES[0])
  })

  it('searches templates by category', () => {
    const library = new TemplateLibrary()
    DEFAULT_TEMPLATES.forEach((t) => library.registerTemplate(t))
    const contentTemplates = library.getTemplatesByCategory('content-creation')
    expect(contentTemplates.length).toBeGreaterThan(0)
  })

  it('searches templates by query', () => {
    const library = new TemplateLibrary()
    DEFAULT_TEMPLATES.forEach((t) => library.registerTemplate(t))
    const results = library.searchTemplates('social')
    expect(results.length).toBeGreaterThan(0)
  })
})

describe('PluginSystem', () => {
  it('registers and retrieves plugins', () => {
    const system = new PluginSystem()
    const manifest = {
      id: 'plugin-1',
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'A test plugin',
      author: 'Test',
      entry: 'index.js'
    }
    const instance = { testMethod: () => 'test' }
    system.registerPlugin(manifest, instance)
    const plugin = system.getPlugin('plugin-1')
    expect(plugin?.manifest.id).toBe('plugin-1')
  })

  it('calls plugin methods', () => {
    const system = new PluginSystem()
    const manifest = {
      id: 'plugin-1',
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'A test plugin',
      author: 'Test',
      entry: 'index.js'
    }
    const instance = { testMethod: (arg: string) => `result: ${arg}` }
    system.registerPlugin(manifest, instance)
    const result = system.callPluginMethod('plugin-1', 'testMethod', 'hello')
    expect(result).toBe('result: hello')
  })
})
