import { v4 as uuidv4 } from 'uuid'
import { EventBusMessage, LogEntry } from './types'
import { EventEmitter } from 'events'

export class UnifiedLogger {
  private traceId: string
  private logEntries: LogEntry[] = []
  private logLevel: 'debug' | 'info' | 'warn' | 'error'
  private emitter: EventEmitter

  constructor(logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info', emitter?: EventEmitter) {
    this.traceId = uuidv4()
    this.logLevel = logLevel
    this.emitter = emitter || new EventEmitter()
  }

  debug(service: string, message: string, data?: any): void {
    this.log('debug', service, message, data)
  }

  info(service: string, message: string, data?: any): void {
    this.log('info', service, message, data)
  }

  warn(service: string, message: string, data?: any): void {
    this.log('warn', service, message, data)
  }

  error(service: string, message: string, data?: any): void {
    this.log('error', service, message, data)
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', service: string, message: string, data?: any): void {
    const levelIndex = { debug: 0, info: 1, warn: 2, error: 3 }
    if (levelIndex[level] < levelIndex[this.logLevel]) return

    const entry: LogEntry = {
      level,
      service,
      message,
      data,
      timestamp: new Date().toISOString(),
      traceId: this.traceId
    }

    this.logEntries.push(entry)
    console.log(`[${entry.level.toUpperCase()}] ${entry.service}: ${entry.message}`, data || '')
    this.emitter.emit('log', entry)
  }

  getTraceId(): string {
    return this.traceId
  }

  getLogs(): LogEntry[] {
    return this.logEntries
  }

  setTraceId(traceId: string): void {
    this.traceId = traceId
  }
}

export class UnifiedErrorHandler {
  private errors: Map<string, Error[]> = new Map()
  private logger: UnifiedLogger
  private emitter: EventEmitter

  constructor(logger: UnifiedLogger, emitter?: EventEmitter) {
    this.logger = logger
    this.emitter = emitter || new EventEmitter()
  }

  handle(service: string, error: Error, context?: any): void {
    const errors = this.errors.get(service) || []
    errors.push(error)
    this.errors.set(service, errors)

    this.logger.error(service, `Error: ${error.message}`, { context, stack: error.stack })
    this.emitter.emit('error', { service, error, context, timestamp: new Date().toISOString() })
  }

  getErrors(service?: string): Error[] {
    if (service) return this.errors.get(service) || []
    return Array.from(this.errors.values()).flat()
  }

  clearErrors(service?: string): void {
    if (service) {
      this.errors.delete(service)
    } else {
      this.errors.clear()
    }
  }
}

export class EventBus extends EventEmitter {
  private logger: UnifiedLogger
  private messageHistory: EventBusMessage[] = []

  constructor(logger: UnifiedLogger) {
    super()
    this.logger = logger
  }

  publish(source: string, type: string, payload: any): void {
    const message: EventBusMessage = {
      source,
      type,
      payload,
      timestamp: new Date().toISOString(),
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`
    }

    this.messageHistory.push(message)
    this.emit(type, message)
    this.logger.debug(source, `Event published: ${type}`, { messageId: message.id })
  }

  subscribe(type: string, listener: (message: EventBusMessage) => void): void {
    this.on(type, listener)
  }

  unsubscribe(type: string, listener: (message: EventBusMessage) => void): void {
    this.off(type, listener)
  }

  getHistory(type?: string): EventBusMessage[] {
    if (type) return this.messageHistory.filter((m) => m.type === type)
    return this.messageHistory
  }
}
