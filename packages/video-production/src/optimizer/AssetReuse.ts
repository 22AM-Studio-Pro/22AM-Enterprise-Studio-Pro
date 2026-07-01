export interface AssetRecord {
  assetId: string;
  contentHash: string;
  filePath: string;
  sizeBytes: number;
  refCount: number;
}

export class AssetReuse {
  private readonly assets = new Map<string, AssetRecord>();

  register(assetId: string, contentHash: string, filePath: string, sizeBytes: number): AssetRecord {
    const existing = this.findByHash(contentHash);
    if (existing) {
      existing.refCount++;
      return existing;
    }
    const record: AssetRecord = { assetId, contentHash, filePath, sizeBytes, refCount: 1 };
    this.assets.set(assetId, record);
    return record;
  }

  findByHash(contentHash: string): AssetRecord | undefined {
    return [...this.assets.values()].find((a) => a.contentHash === contentHash);
  }

  release(assetId: string): void {
    const record = this.assets.get(assetId);
    if (!record) return;
    record.refCount--;
    if (record.refCount <= 0) this.assets.delete(assetId);
  }

  deduplicatedPaths(): Map<string, string> {
    const map = new Map<string, string>();
    const seen = new Map<string, string>();
    for (const record of this.assets.values()) {
      const canonical = seen.get(record.contentHash);
      if (canonical) {
        map.set(record.assetId, canonical);
      } else {
        seen.set(record.contentHash, record.filePath);
        map.set(record.assetId, record.filePath);
      }
    }
    return map;
  }

  totalSavedBytes(): number {
    const seen = new Map<string, number>();
    let saved = 0;
    for (const record of this.assets.values()) {
      if (seen.has(record.contentHash)) {
        saved += record.sizeBytes;
      } else {
        seen.set(record.contentHash, record.sizeBytes);
      }
    }
    return saved;
  }
}
