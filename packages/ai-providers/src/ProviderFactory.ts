import { AIProvider } from './AIProvider'
import { ProviderRegistry } from './ProviderRegistry'

export class ProviderFactory {
  private registry: ProviderRegistry

  constructor(registry: ProviderRegistry) {
    this.registry = registry
  }

  create(name: string): AIProvider {
    const p = this.registry.get(name)
    if (!p) throw new Error('provider not found: ' + name)
    return p
  }
}
