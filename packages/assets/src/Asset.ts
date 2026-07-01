export type AssetType = 'image' | 'video' | 'audio' | 'document' | 'json' | 'workflow' | 'prompt' | 'ai_output'

export type AssetMetadataRecord = {
  filename: string
  mimeType: string
  size: number
  checksum: string
  hash: string
  dimensions?: { width: number; height: number }
  duration?: number
  fps?: number
  codec?: string
  createdDate: string
  modifiedDate: string
  author?: string
  sourceProvider?: string
  workflowId?: string
  executionId?: string
  tags: string[]
  customMetadata?: Record<string, any>
}

export type Asset = {
  id: string
  folderId?: string
  type: AssetType
  path: string
  metadata: AssetMetadataRecord
  createdAt: string
  updatedAt: string
}
