import type { EventType, EventMap } from './types';

type EventListener<T extends EventType = EventType> = (
  data: EventMap[T]
) => void;

type AnyEventListener = (data: unknown) => void;

interface EventListenerMap {
  [event: string]: AnyEventListener[];
}

export class EventBus {
  private listeners: EventListenerMap = {};
  private onceListeners: EventListenerMap = {};

  on<T extends EventType>(event: T, listener: EventListener<T>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener as AnyEventListener);
  }

  once<T extends EventType>(event: T, listener: EventListener<T>): void {
    if (!this.onceListeners[event]) {
      this.onceListeners[event] = [];
    }
    this.onceListeners[event].push(listener as AnyEventListener);
  }

  off<T extends EventType>(event: T, listener: EventListener<T>): void {
    if (!this.listeners[event]) {
      return;
    }
    const index = this.listeners[event].indexOf(listener as AnyEventListener);
    if (index > -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  emit<T extends EventType>(event: T, data: EventMap[T]): void {
    // Execute regular listeners
    if (this.listeners[event]) {
      for (const listener of this.listeners[event]) {
        try {
          listener(data);
        } catch (error) {
          console.error(
            `Error in event listener for '${event}':`,
            error instanceof Error ? error.message : String(error)
          );
        }
      }
    }

    // Execute once listeners and remove them
    if (this.onceListeners[event]) {
      for (const listener of this.onceListeners[event]) {
        try {
          listener(data);
        } catch (error) {
          console.error(
            `Error in once listener for '${event}':`,
            error instanceof Error ? error.message : String(error)
          );
        }
      }
      delete this.onceListeners[event];
    }
  }

  removeAllListeners(event?: EventType): void {
    if (event) {
      delete this.listeners[event];
      delete this.onceListeners[event];
    } else {
      this.listeners = {};
      this.onceListeners = {};
    }
  }

  listenerCount(event: EventType): number {
    const regularCount = this.listeners[event]?.length || 0;
    const onceCount = this.onceListeners[event]?.length || 0;
    return regularCount + onceCount;
  }
}
