export interface ResearchCacheEntry<T> {
  key: string;
  value: T;
  createdAt: number;
  ttlMs: number;
  hitCount: number;
}

export interface ResearchCacheStats {
  size: number;
  hits: number;
  misses: number;
  writes: number;
  evictions: number;
}

const DEFAULT_TTL_MS = 6 * 60 * 60 * 1000;

export class ResearchCache<T> {
  private readonly store = new Map<string, ResearchCacheEntry<T>>();
  private stats: ResearchCacheStats = {
    size: 0,
    hits: 0,
    misses: 0,
    writes: 0,
    evictions: 0,
  };

  constructor(private readonly defaultTtlMs = DEFAULT_TTL_MS) {}

  static normalizeKeyPart(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
  }

  static buildKey(parts: Array<string | number | undefined>): string {
    return parts
      .filter((part): part is string | number => part !== undefined)
      .map((part) => ResearchCache.normalizeKeyPart(String(part)))
      .join('|');
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);

    if (!entry) {
      this.stats.misses += 1;
      return undefined;
    }

    if (Date.now() - entry.createdAt > entry.ttlMs) {
      this.store.delete(key);
      this.stats.misses += 1;
      this.stats.evictions += 1;
      this.stats.size = this.store.size;
      return undefined;
    }

    entry.hitCount += 1;
    this.stats.hits += 1;
    return entry.value;
  }

  set(key: string, value: T, ttlMs = this.defaultTtlMs): void {
    this.store.set(key, {
      key,
      value,
      createdAt: Date.now(),
      ttlMs,
      hitCount: 0,
    });
    this.stats.writes += 1;
    this.stats.size = this.store.size;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.store.clear();
    this.stats.size = 0;
  }

  getStats(): ResearchCacheStats {
    return { ...this.stats };
  }
}
