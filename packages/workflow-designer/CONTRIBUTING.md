# Workflow Designer - Contributing Guide

Thanks for your interest in contributing to Workflow Designer!

## Development Setup

```bash
# Clone the repository
git clone https://github.com/22AM-Studio-Pro/22AM-Enterprise-Studio-Pro.git
cd 22AM-Enterprise-Studio-Pro

# Install dependencies
npm install

# Navigate to the package
cd packages/workflow-designer

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Code Style

We use:
- **TypeScript** for type safety
- **ESLint** for linting
- **Prettier** for formatting
- **Vitest** for testing

```bash
npm run lint
npm run format
```

## Adding Features

### 1. New Node Type

Add to `NodePalette.ts`:

```typescript
export const NODE_PALETTE: NodePaletteItem[] = [
  // ...
  {
    type: 'custom',
    label: 'Custom Node',
    description: 'My custom node',
    category: 'Logic',
    icon: '⚙️',
    configurable: true
  }
]
```

### 2. New Store Action

Extend `DesignerStore.ts` with Zustand:

```typescript
export type DesignerState = {
  // ...
  myNewAction: () => void
}

export const useDesignerStore = create<DesignerState>(
  immer((set) => ({
    // ...
    myNewAction: () =>
      set((state) => {
        // Immer mutation syntax
        state.someProperty = newValue
      })
  }))
)
```

### 3. New Component

Create in `components/`:

```typescript
import React from 'react'

interface MyComponentProps {
  // ...
}

export const MyComponent: React.FC<MyComponentProps> = (props) => {
  return <div>My Component</div>
}
```

Export from `components/index.ts`:

```typescript
export { MyComponent } from './MyComponent'
```

### 4. New Plugin

Create plugin manifest and instance:

```typescript
const manifest: PluginManifest = {
  id: 'plugin-mine',
  name: 'My Plugin',
  version: '1.0.0',
  description: 'Does something cool',
  author: 'You',
  entry: 'index.js',
  nodeTypes: ['custom-node'],
  permissions: ['workflow:read', 'workflow:execute']
}

const instance = {
  onNodeCreate: (data) => { /* ... */ },
  onNodeExecute: (data) => { /* ... */ },
  onWorkflowComplete: () => { /* ... */ }
}
```

## Testing

Always add tests for new features:

```typescript
import { describe, it, expect } from 'vitest'

describe('MyFeature', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = myFunction(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

Run tests:

```bash
npm run test
npm run test:watch
```

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Make** your changes with tests
4. **Commit** with meaningful messages: `git commit -m "feat: add my feature"`
5. **Push** to your fork: `git push origin feature/my-feature`
6. **Open** a Pull Request with description
7. **Address** review feedback
8. **Merge** when approved

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style
- `refactor:` Refactoring
- `perf:` Performance
- `test:` Tests
- `chore:` Build/deps

Examples:
```
feat: add node validation
fix: prevent circular dependencies
docs: update API reference
```

## File Structure

When adding new features, maintain this structure:

```
├── src/
│   ├── MyFeatureTypes.ts        # Type definitions
│   ├── MyFeature.ts             # Main logic
│   ├── components/
│   │   └── MyComponent.tsx      # UI component
│   └── hooks/
│       └── useMyFeature.ts      # Custom hook
├── tests/
│   ├── myfeature.test.ts        # Unit tests
│   └── mycomponent.test.ts      # Component tests
└── README.md                     # Feature docs
```

## Performance Guidelines

1. **Memoize** React components when appropriate:
   ```typescript
   export const MyComponent = React.memo(({ prop }) => { /* ... */ })
   ```

2. **Use** Zustand selectors to prevent unnecessary re-renders:
   ```typescript
   const selectedNode = useDesignerStore((state) => state.selectedNodeId)
   ```

3. **Batch** state updates:
   ```typescript
   const { addNode, addEdge } = useDesignerStore()
   addNode(node)
   addEdge(edge)
   store.save() // Only updates once
   ```

4. **Virtualize** large lists in the UI

5. **Lazy load** heavy features

## Documentation

Update documentation when adding features:

1. **README.md**: High-level overview
2. **MIGRATION.md**: Breaking changes
3. **Code comments**: Complex logic
4. **Type definitions**: JSDoc comments

```typescript
/**
 * Validates a workflow for common issues.
 * @param workflow - The workflow to validate
 * @returns Array of validation errors
 */
export function validate(workflow: WorkflowDefinition): ValidationError[] {
  // ...
}
```

## Debugging

Useful debugging techniques:

```typescript
// Log state changes
useDesignerStore.subscribe(
  (state) => console.log('State:', state),
  (state) => state.workflow
)

// Inspect execution
const { context } = useExecutionStore()
console.log('Execution:', context)

// Debug event stream
stream.onEvent((event) => console.log('Event:', event))
```

## Common Issues

### Tests fail after changes

```bash
npm run test -- --no-coverage
npm run test:watch
```

### Build fails

```bash
rm -rf dist node_modules
npm install
npm run build
```

### Type errors

```bash
npm run type-check
```

## Questions?

Open a discussion: https://github.com/22AM-Studio-Pro/22AM-Enterprise-Studio-Pro/discussions

## License

By contributing, you agree your code will be licensed under MIT.
