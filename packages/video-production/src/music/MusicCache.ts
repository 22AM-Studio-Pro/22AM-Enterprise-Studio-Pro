import { MusicTrack } from './MusicLibrary';

export interface MusicCacheEntry {
  track: MusicTrack;
  resolvedPath: string;
  cachedAt: number;
  ttlMs: number;
}

const DEFAULT_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export class MusicCache {
  private readonly cache = new Map<string, MusicCacheEntry>();

  set(trackId: string, track: MusicTrack, resolvedPath: string, ttlMs = DEFAULT_TTL_MS): void {
    this.cache.set(trackId, { track, resolvedPath, cachedAt: Date.now(), ttlMs });
  }

  get(trackId: string): MusicCacheEntry | undefined {
    const entry = this.cache.get(trackId);
    if (!entry) return undefined;
    if (Date.now() - entry.cachedAt > entry.ttlMs) {
      this.cache.delete(trackId);
      return undefined;
    }
    return entry;
  }

  has(trackId: string): boolean {
    return this.get(trackId) !== undefined;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
