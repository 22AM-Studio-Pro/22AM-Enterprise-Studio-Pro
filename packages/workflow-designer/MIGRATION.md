# Migration Guide

This guide helps you migrate from other workflow builders or upgrade between versions.

## Migrating from Other Platforms

### From Zapier/Make.com

1. **Export** your workflow as JSON from the platform
2. **Map** their node types to our types:
   - Trigger → Input node
   - Action → Logic/AI/Publishing node
   - Filter → Logic conditional
   - Formatter → Asset transformation
3. **Import** into Workflow Designer
4. **Re-configure** authentication and API keys

### From Custom Scripts

1. **Identify** workflow steps in your code
2. **Create nodes** for each step:
   ```typescript
   const nodes = [
     NodeFactory.createNode('ai', 'Text Generation', 0, 0),
     NodeFactory.createNode('asset', 'Save Result', 100, 0)
   ]
   ```
3. **Connect** nodes with edges:
   ```typescript
   const edges = [
     { id: 'e1', source: 'n1', target: 'n2' }
   ]
   ```
4. **Test** in the designer before deployment

## Version Upgrades

### v0.1.0 → v0.2.0

No breaking changes. New features:
- Plugin system
- Template library
- API integration

Update dependencies:
```bash
npm update @22am/workflow-designer
```

## Workflow Format

### v0.1.0 Format

```json
{
  "id": "wf-1",
  "name": "My Workflow",
  "nodes": [...],
  "edges": [...],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

No format changes expected. Workflows will remain backward compatible.

## Template Migration

### Exporting Workflow as Template

```typescript
const template: WorkflowTemplate = {
  id: 'tpl-my-workflow',
  name: 'My Workflow',
  description: 'Description',
  category: 'content-creation',
  nodes: workflow.nodes,
  edges: workflow.edges,
  tags: ['ai', 'publishing'],
  author: 'You',
  version: '1.0.0'
}

library.registerTemplate(template)
```

### Using Templates

```typescript
const template = library.getTemplate('tpl-my-workflow')
const newWorkflow: WorkflowDefinition = {
  id: nanoid(),
  name: 'New Workflow from Template',
  nodes: template.nodes,
  edges: template.edges,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}
```

## Plugin Development

Migrating existing node types to plugins:

```typescript
// Old: Hardcoded node type
const node = NodeFactory.createNode('custom', 'My Node', 0, 0)

// New: Plugin-based node type
const manifest: PluginManifest = {
  id: 'plugin-custom',
  name: 'Custom Plugin',
  version: '1.0.0',
  description: 'My custom nodes',
  author: 'You',
  entry: 'index.js',
  nodeTypes: ['custom']
}

const instance = {
  onNodeCreate: (nodeData) => { /* handle creation */ },
  onNodeExecute: (nodeData) => { /* handle execution */ }
}

plugins.registerPlugin(manifest, instance)
```

## Breaking Changes

None expected in v0.1.0 releases. We follow semantic versioning:
- **Patch** (0.1.1): Bug fixes
- **Minor** (0.2.0): New features, backward compatible
- **Major** (1.0.0): Breaking changes (with migration guide)

## Troubleshooting

### Workflows fail to import

1. Check JSON syntax: `JSON.parse(json)` should not throw
2. Verify required fields: `id`, `name`, `nodes`, `edges`, `createdAt`, `updatedAt`
3. Validate node structure: each must have `id`, `type`, `label`, `position`, `data`

### Execution fails after upgrade

1. Check execution event stream connection
2. Verify API endpoint compatibility
3. Ensure authentication token is valid

### Performance degradation

1. Clear browser cache and local storage
2. Reduce number of nodes in workflow (split into sub-workflows)
3. Check for circular dependencies

## Best Practices

1. **Validate early**: Use `WorkflowValidator` before execution
2. **Use templates**: Standardize common workflows
3. **Name nodes clearly**: Easy to debug and understand
4. **Test incrementally**: Build complex workflows step by step
5. **Monitor execution**: Use event logs and debugger
6. **Version workflows**: Save important workflows as templates
7. **Document custom nodes**: Add metadata to plugin manifests

## Future Compatibility

We commit to:
- ✅ No breaking changes in major versions without notice
- ✅ Automatic migration helpers for deprecations
- ✅ Backward compatibility with old workflow formats
- ✅ Clear upgrade paths between versions

## Getting Help

- **Documentation**: https://github.com/22AM-Studio-Pro/22AM-Enterprise-Studio-Pro/docs
- **Issues**: https://github.com/22AM-Studio-Pro/22AM-Enterprise-Studio-Pro/issues
- **Discussions**: https://github.com/22AM-Studio-Pro/22AM-Enterprise-Studio-Pro/discussions
