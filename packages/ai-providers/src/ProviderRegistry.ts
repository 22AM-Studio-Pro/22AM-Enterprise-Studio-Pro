import { AIProvider } from './AIProvider'

export class ProviderRegistry {
  private providers: Map<string, AIProvider>

  constructor() {
    this.providers = new Map()
  }

  register(name: string, provider: AIProvider) {
    if (this.providers.has(name)) throw new Error('provider already registered: ' + name)
    this.providers.set(name, provider)
  }

  unregister(name: string) {
    this.providers.delete(name)
  }

  get(name: string): AIProvider | undefined {
    return this.providers.get(name)
  }

  list(): string[] {
    return Array.from(this.providers.keys())
  }
}
