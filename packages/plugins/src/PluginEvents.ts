import EventEmitter from 'eventemitter3'

const emitter = new EventEmitter()

// To prevent duplicate subscriptions and memory leaks we track subscribers per token
const subscriberMap = new Map<any, Set<string>>()

export const pluginEvents = {
  on(event: string, listener: (...args: any[]) => void, token?: any) {
    emitter.on(event, listener)
    if (token) {
      const set = subscriberMap.get(token) ?? new Set<string>()
      set.add(event)
      subscriberMap.set(token, set)
    }
    return () => this.off(event, listener)
  },
  off(event: string, listener: (...args: any[]) => void) {
    emitter.off(event, listener)
  },
  emit(event: string, payload: any) {
    emitter.emit(event, payload)
  },
  disposeToken(token: any) {
    const set = subscriberMap.get(token)
    if (!set) return
    for (const ev of set) {
      emitter.removeAllListeners(ev)
    }
    subscriberMap.delete(token)
  }
}
