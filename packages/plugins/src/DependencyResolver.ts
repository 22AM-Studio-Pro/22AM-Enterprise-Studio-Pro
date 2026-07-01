import semver from 'semver'
import { PluginManifest } from './PluginManifest'

export class DependencyResolver {
  // manifests: array of plugin manifests discovered
  resolve(manifests: PluginManifest[]) {
    // build map
    const map = new Map<string, PluginManifest>()
    for (const m of manifests) {
      if (map.has(m.id)) throw new Error('duplicate plugin id: ' + m.id)
      map.set(m.id, m)
    }

    // validate dependencies exist and semver ranges
    for (const m of manifests) {
      if (!m.dependencies) continue
      for (const [depId, range] of Object.entries(m.dependencies)) {
        const dep = map.get(depId)
        if (!dep) throw new Error(`missing dependency ${depId} for plugin ${m.id}`)
        if (!semver.satisfies(dep.version, range)) throw new Error(`version mismatch for ${depId} required ${range} but found ${dep.version}`)
      }
    }

    // detect cycles via DFS
    const visited = new Set<string>()
    const inStack = new Set<string>()
    const order: string[] = []

    const dfs = (id: string) => {
      if (inStack.has(id)) throw new Error('dependency cycle detected at ' + id)
      if (visited.has(id)) return
      visited.add(id)
      inStack.add(id)
      const m = map.get(id)!
      if (m.dependencies) {
        for (const depId of Object.keys(m.dependencies)) {
          dfs(depId)
        }
      }
      inStack.delete(id)
      order.push(id)
    }

    for (const id of map.keys()) {
      if (!visited.has(id)) dfs(id)
    }

    // order provides load order: dependencies first
    return order.map((id) => map.get(id)!)
  }
}
