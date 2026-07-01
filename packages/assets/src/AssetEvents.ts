import EventEmitter from 'eventemitter3'

export const assetEvents = new EventEmitter()

export type AssetEventPayloads = {
  'asset.created': { assetId: string }
  'asset.updated': { assetId: string }
  'asset.deleted': { assetId: string }
  'asset.imported': { assetId: string; source: string }
  'asset.exported': { assetId: string; destination: string }
  'asset.tagged': { assetId: string; tags: string[] }
  'asset.moved': { assetId: string; folderId: string }
  'asset.duplicated': { assetId: string; duplicateId: string }
}
