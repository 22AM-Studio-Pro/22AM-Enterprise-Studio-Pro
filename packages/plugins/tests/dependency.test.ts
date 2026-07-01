import { describe, it, expect } from 'vitest'
import { DependencyResolver } from '../src/DependencyResolver'

describe('DependencyResolver', () => {
  it('resolves simple dependency order', () => {
    const resolver = new DependencyResolver()
    const manifests = [
      { id: 'a', name: 'A', version: '1.0.0' },
      { id: 'b', name: 'B', version: '1.0.0', dependencies: { a: '^1.0.0' } }
    ] as any
    const ordered = resolver.resolve(manifests)
    expect(ordered[0].id).toBe('a')
    expect(ordered[1].id).toBe('b')
  })

  it('detects missing dependency', () => {
    const resolver = new DependencyResolver()
    const manifests = [ { id: 'a', name: 'A', version: '1.0.0', dependencies: { x: '^1.0.0' } } ] as any
    expect(() => resolver.resolve(manifests)).toThrow()
  })

  it('detects cycles', () => {
    const resolver = new DependencyResolver()
    const manifests = [
      { id: 'a', name: 'A', version: '1.0.0', dependencies: { b: '^1.0.0' } },
      { id: 'b', name: 'B', version: '1.0.0', dependencies: { a: '^1.0.0' } }
    ] as any
    expect(() => resolver.resolve(manifests)).toThrow(/cycle/)
  })
})
