export interface SceneCacheEntry {
  sceneId: string;
  renderPath: string;
  contentHash: string;
  cachedAt: number;
  sizeBytes: number;
}

export class SceneCache {
  private readonly cache = new Map<string, SceneCacheEntry>();

  store(sceneId: string, renderPath: string, contentHash: string, sizeBytes: number): void {
    this.cache.set(sceneId, { sceneId, renderPath, contentHash, cachedAt: Date.now(), sizeBytes });
  }

  get(sceneId: string): SceneCacheEntry | undefined {
    return this.cache.get(sceneId);
  }

  has(sceneId: string): boolean {
    return this.cache.has(sceneId);
  }

  isValid(sceneId: string, contentHash: string): boolean {
    const entry = this.cache.get(sceneId);
    return entry?.contentHash === contentHash;
  }

  invalidate(sceneId: string): void {
    this.cache.delete(sceneId);
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  totalSizeBytes(): number {
    return [...this.cache.values()].reduce((sum, e) => sum + e.sizeBytes, 0);
  }

  size(): number {
    return this.cache.size;
  }
}
