export type ServiceConfig = {
  name: string
  version: string
  enabled: boolean
  dependencies?: string[]
  config?: Record<string, any>
}

export type ContainerOptions = {
  environment: 'development' | 'production' | 'test'
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  configPath?: string
}

export type ServiceInstance = {
  name: string
  initialize?: () => Promise<void>
  shutdown?: () => Promise<void>
  getStatus?: () => Promise<ServiceStatus>
  [key: string]: any
}

export type ServiceStatus = {
  name: string
  status: 'initializing' | 'ready' | 'degraded' | 'failed'
  uptime: number
  lastError?: string
}

export type EventBusMessage = {
  source: string
  type: string
  payload: any
  timestamp: string
  id: string
}

export type LogEntry = {
  level: 'debug' | 'info' | 'warn' | 'error'
  service: string
  message: string
  data?: any
  timestamp: string
  traceId: string
}
