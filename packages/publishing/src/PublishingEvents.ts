import EventEmitter from 'eventemitter3'

export const publishingEvents = new EventEmitter()

export type PublishingEventPayloads = {
  'publish.created': { contentId: string; platform: string }
  'publish.started': { contentId: string; platform: string }
  'publish.completed': { contentId: string; platform: string; platformId: string }
  'publish.failed': { contentId: string; platform: string; error: string }
  'publish.cancelled': { contentId: string; platform: string }
  'publish.retry': { contentId: string; platform: string; attempt: number }
  'analytics.updated': { platformId: string; platform: string }
}
