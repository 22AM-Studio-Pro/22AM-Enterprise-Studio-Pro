import { AssetRepository } from './AssetRepository'
import { DuplicateDetector } from './DuplicateDetector'
import { assetEvents } from './AssetEvents'
import { Asset, AssetMetadataRecord, AssetType } from './Asset'
import { v4 as uuidv4 } from 'crypto'

export class AssetManager {
  private repository: AssetRepository
  private duplicateDetector: DuplicateDetector

  constructor(dbPath?: string) {
    this.repository = new AssetRepository(dbPath)
    this.duplicateDetector = new DuplicateDetector()
  }

  createAsset(type: AssetType, filePath: string, metadata: Partial<AssetMetadataRecord>, folderId?: string): Asset {
    const id = uuidv4().toString().substring(0, 8)
    const now = new Date().toISOString()
    const asset: Asset = {
      id,
      folderId,
      type,
      path: filePath,
      metadata: {
        filename: metadata.filename ?? 'unknown',
        mimeType: metadata.mimeType ?? 'application/octet-stream',
        size: metadata.size ?? 0,
        checksum: metadata.checksum ?? '',
        hash: metadata.hash ?? '',
        dimensions: metadata.dimensions,
        duration: metadata.duration,
        fps: metadata.fps,
        codec: metadata.codec,
        createdDate: metadata.createdDate ?? now,
        modifiedDate: metadata.modifiedDate ?? now,
        author: metadata.author,
        sourceProvider: metadata.sourceProvider,
        workflowId: metadata.workflowId,
        executionId: metadata.executionId,
        tags: metadata.tags ?? [],
        customMetadata: metadata.customMetadata
      },
      createdAt: now,
      updatedAt: now
    }
    this.repository.createAsset(asset)
    assetEvents.emit('asset.created', { assetId: id })
    return asset
  }

  getAsset(id: string): Asset | undefined {
    return this.repository.getAsset(id)
  }

  listAssets(folderId?: string) {
    return this.repository.listAssets(folderId)
  }

  searchAssets(query: string) {
    return this.repository.searchAssets(query)
  }

  deleteAsset(id: string) {
    this.repository.deleteAsset(id)
    assetEvents.emit('asset.deleted', { assetId: id })
  }

  tagAsset(assetId: string, tags: string[]) {
    const asset = this.repository.getAsset(assetId)
    if (asset) {
      asset.metadata.tags = [...new Set([...asset.metadata.tags, ...tags])]
      assetEvents.emit('asset.tagged', { assetId, tags })
    }
  }

  findDuplicate(assetId: string): string | undefined {
    const asset = this.repository.getAsset(assetId)
    if (!asset) return undefined
    return this.duplicateDetector.findDuplicate(asset.metadata.checksum, this.repository)
  }
}
