import { ServiceInstance, ServiceConfig, ContainerOptions, ServiceStatus } from './types'
import { UnifiedLogger, UnifiedErrorHandler, EventBus } from './logging'
import { EventEmitter } from 'events'

export class DependencyContainer {
  private services: Map<string, ServiceInstance> = new Map()
  private configs: Map<string, ServiceConfig> = new Map()
  private logger: UnifiedLogger
  private errorHandler: UnifiedErrorHandler
  private eventBus: EventBus
  private emitter: EventEmitter
  private initialized = false
  private options: ContainerOptions

  constructor(options: ContainerOptions) {
    this.options = options
    this.emitter = new EventEmitter()
    this.logger = new UnifiedLogger(options.logLevel, this.emitter)
    this.errorHandler = new UnifiedErrorHandler(this.logger, this.emitter)
    this.eventBus = new EventBus(this.logger)
  }

  register(config: ServiceConfig, instance: ServiceInstance): void {
    if (this.initialized) {
      throw new Error('Cannot register services after container initialization')
    }

    this.configs.set(config.name, config)
    this.services.set(config.name, instance)
    this.logger.info('container', `Service registered: ${config.name}`)
  }

  get(name: string): ServiceInstance | undefined {
    return this.services.get(name)
  }

  async initialize(): Promise<void> {
    this.logger.info('container', 'Starting container initialization')
    const initOrder = this.resolveDependencyOrder()

    for (const serviceName of initOrder) {
      const service = this.services.get(serviceName)
      const config = this.configs.get(serviceName)

      if (!config?.enabled) {
        this.logger.info('container', `Skipping disabled service: ${serviceName}`)
        continue
      }

      try {
        this.logger.info('container', `Initializing service: ${serviceName}`)
        if (service?.initialize) {
          await service.initialize()
        }
        this.logger.info('container', `Service initialized: ${serviceName}`)
        this.eventBus.publish('container', 'service:initialized', { service: serviceName })
      } catch (error) {
        this.errorHandler.handle('container', error as Error, { service: serviceName })
        throw error
      }
    }

    this.initialized = true
    this.logger.info('container', 'Container initialization complete')
    this.eventBus.publish('container', 'initialized', {})
  }

  async shutdown(): Promise<void> {
    this.logger.info('container', 'Starting graceful shutdown')
    const shutdownOrder = Array.from(this.services.keys()).reverse()

    for (const serviceName of shutdownOrder) {
      const service = this.services.get(serviceName)
      try {
        this.logger.info('container', `Shutting down service: ${serviceName}`)
        if (service?.shutdown) {
          await service.shutdown()
        }
        this.logger.info('container', `Service shutdown: ${serviceName}`)
        this.eventBus.publish('container', 'service:shutdown', { service: serviceName })
      } catch (error) {
        this.errorHandler.handle('container', error as Error, { service: serviceName })
      }
    }

    this.logger.info('container', 'Shutdown complete')
  }

  private resolveDependencyOrder(): string[] {
    const visited = new Set<string>()
    const order: string[] = []

    const visit = (name: string, visiting = new Set<string>()): void => {
      if (visited.has(name)) return
      if (visiting.has(name)) throw new Error(`Circular dependency detected: ${name}`)

      visiting.add(name)
      const config = this.configs.get(name)

      if (config?.dependencies) {
        for (const dep of config.dependencies) {
          visit(dep, visiting)
        }
      }

      visiting.delete(name)
      visited.add(name)
      order.push(name)
    }

    for (const serviceName of this.services.keys()) {
      visit(serviceName)
    }

    return order
  }

  async getStatus(): Promise<ServiceStatus[]> {
    const statuses: ServiceStatus[] = []

    for (const [name, service] of this.services) {
      try {
        if (service.getStatus) {
          const status = await service.getStatus()
          statuses.push(status)
        }
      } catch (error) {
        statuses.push({
          name,
          status: 'failed',
          uptime: 0,
          lastError: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return statuses
  }

  getLogger(): UnifiedLogger {
    return this.logger
  }

  getErrorHandler(): UnifiedErrorHandler {
    return this.errorHandler
  }

  getEventBus(): EventBus {
    return this.eventBus
  }

  on(event: string, listener: (...args: any[]) => void): void {
    this.emitter.on(event, listener)
  }

  off(event: string, listener: (...args: any[]) => void): void {
    this.emitter.off(event, listener)
  }
}
