import { AudioBuffer, VoiceSynthesisOptions } from './VoiceProvider';

export interface CacheKey {
  text: string;
  voiceId: string;
  language: string;
  emotion?: string;
  speakingRate?: number;
}

export interface CacheEntry {
  key: string;
  buffer: AudioBuffer;
  createdAt: number;
  hitCount: number;
  ttlMs: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  evictions: number;
  totalSizeBytes: number;
}

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_MAX_ENTRIES = 1000;
const DEFAULT_MAX_SIZE_BYTES = 512 * 1024 * 1024; // 512 MB

export class VoiceCache {
  private readonly cache = new Map<string, CacheEntry>();
  private stats: CacheStats = { size: 0, hits: 0, misses: 0, evictions: 0, totalSizeBytes: 0 };

  constructor(
    private readonly maxEntries = DEFAULT_MAX_ENTRIES,
    private readonly maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
    private readonly defaultTtlMs = DEFAULT_TTL_MS,
  ) {}

  static buildKey(key: CacheKey): string {
    return [key.text.slice(0, 64), key.voiceId, key.language, key.emotion ?? '', String(key.speakingRate ?? 140)].join('|');
  }

  static buildKeyFromOptions(text: string, options: VoiceSynthesisOptions): string {
    return VoiceCache.buildKey({
      text,
      voiceId: options.voiceId,
      language: options.language,
      emotion: options.emotion,
      speakingRate: options.speakingRate,
    });
  }

  get(text: string, options: VoiceSynthesisOptions): AudioBuffer | undefined {
    const key = VoiceCache.buildKeyFromOptions(text, options);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    if (Date.now() - entry.createdAt > entry.ttlMs) {
      this.evict(key, entry);
      this.stats.misses++;
      return undefined;
    }

    entry.hitCount++;
    this.stats.hits++;
    return entry.buffer;
  }

  set(text: string, options: VoiceSynthesisOptions, buffer: AudioBuffer, ttlMs?: number): void {
    const key = VoiceCache.buildKeyFromOptions(text, options);

    if (this.cache.has(key)) {
      const old = this.cache.get(key)!;
      this.stats.totalSizeBytes -= old.buffer.sizeBytes;
    } else {
      this.evictIfNeeded(buffer.sizeBytes);
    }

    this.cache.set(key, {
      key,
      buffer,
      createdAt: Date.now(),
      hitCount: 0,
      ttlMs: ttlMs ?? this.defaultTtlMs,
    });

    this.stats.size = this.cache.size;
    this.stats.totalSizeBytes += buffer.sizeBytes;
  }

  has(text: string, options: VoiceSynthesisOptions): boolean {
    return this.get(text, options) !== undefined;
  }

  delete(text: string, options: VoiceSynthesisOptions): void {
    const key = VoiceCache.buildKeyFromOptions(text, options);
    const entry = this.cache.get(key);
    if (entry) this.evict(key, entry);
  }

  clear(): void {
    this.cache.clear();
    this.stats = { size: 0, hits: 0, misses: 0, evictions: this.stats.evictions, totalSizeBytes: 0 };
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private evict(key: string, entry: CacheEntry): void {
    this.cache.delete(key);
    this.stats.totalSizeBytes -= entry.buffer.sizeBytes;
    this.stats.size = this.cache.size;
    this.stats.evictions++;
  }

  private evictIfNeeded(incomingSizeBytes: number): void {
    while (
      (this.cache.size >= this.maxEntries || this.stats.totalSizeBytes + incomingSizeBytes > this.maxSizeBytes) &&
      this.cache.size > 0
    ) {
      this.evictLRU();
    }
  }

  private evictLRU(): void {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;
    for (const [key, entry] of this.cache) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      const entry = this.cache.get(oldestKey)!;
      this.evict(oldestKey, entry);
    }
  }
}
