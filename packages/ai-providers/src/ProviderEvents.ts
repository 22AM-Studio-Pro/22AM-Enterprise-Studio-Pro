import EventEmitter from 'eventemitter3'

export const providerEvents = new EventEmitter()

export type ProviderEventPayloads = {
  'provider.registered': { name: string }
  'provider.unregistered': { name: string }
}
