import { describe, it, expect } from 'vitest'
import { DependencyResolver } from '../src/DependencyResolver'

describe('semver resolution variations', () => {
  it('accepts ^ and ~ and exact ranges', () => {
    const resolver = new DependencyResolver()
    const manifests = [
      { id: 'core', name: 'core', version: '1.2.3' },
      { id: 'pluginA', name: 'A', version: '2.0.0', dependencies: { core: '^1.2.0' } },
      { id: 'pluginB', name: 'B', version: '1.5.0', dependencies: { core: '~1.2.3' } },
      { id: 'pluginC', name: 'C', version: '3.0.0', dependencies: { core: '1.2.3' } }
    ] as any
    const ordered = resolver.resolve(manifests)
    expect(ordered.find((m) => m.id === 'core')).toBeDefined()
  })
})
