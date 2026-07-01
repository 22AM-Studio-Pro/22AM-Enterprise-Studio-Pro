import { describe, it, expect, beforeEach } from 'vitest';
import { VoiceCache } from '../voice/VoiceCache';
import { AudioBuffer, VoiceSynthesisOptions } from '../voice/VoiceProvider';

function mockBuffer(durationSeconds = 5, sizeBytes = 80000): AudioBuffer {
  return { data: new Uint8Array(0), durationSeconds, sampleRate: 44100, channels: 1, format: 'mp3', sizeBytes };
}

const opts: VoiceSynthesisOptions = { voiceId: 'adam', language: 'en', emotion: 'neutral', speakingRate: 140 };

describe('VoiceCache', () => {
  let cache: VoiceCache;

  beforeEach(() => {
    cache = new VoiceCache(100, 10 * 1024 * 1024); // 100 entries, 10 MB
  });

  it('returns undefined for a cache miss', () => {
    expect(cache.get('hello world', opts)).toBeUndefined();
  });

  it('stores and retrieves a buffer', () => {
    const buffer = mockBuffer();
    cache.set('hello world', opts, buffer);
    const result = cache.get('hello world', opts);
    expect(result).toBeDefined();
    expect(result?.durationSeconds).toBe(5);
  });

  it('reports a miss in stats when entry is absent', () => {
    cache.get('not there', opts);
    expect(cache.getStats().misses).toBe(1);
    expect(cache.getStats().hits).toBe(0);
  });

  it('reports a hit in stats when entry is present', () => {
    cache.set('hello', opts, mockBuffer());
    cache.get('hello', opts);
    expect(cache.getStats().hits).toBe(1);
  });

  it('has() returns false when not cached', () => {
    expect(cache.has('not cached', opts)).toBe(false);
  });

  it('has() returns true when cached', () => {
    cache.set('cached text', opts, mockBuffer());
    expect(cache.has('cached text', opts)).toBe(true);
  });

  it('deletes an entry', () => {
    cache.set('to delete', opts, mockBuffer());
    cache.delete('to delete', opts);
    expect(cache.has('to delete', opts)).toBe(false);
  });

  it('clears all entries', () => {
    cache.set('a', opts, mockBuffer());
    cache.set('b', opts, mockBuffer());
    cache.clear();
    expect(cache.getStats().size).toBe(0);
    expect(cache.getStats().totalSizeBytes).toBe(0);
  });

  it('evicts LRU entry when max size is exceeded', () => {
    const smallCache = new VoiceCache(2, 1 * 1024 * 1024);
    smallCache.set('a', opts, mockBuffer(5, 600 * 1024)); // 600 KB
    smallCache.set('b', opts, mockBuffer(5, 600 * 1024)); // 600 KB — triggers eviction
    expect(smallCache.getStats().evictions).toBeGreaterThan(0);
  });

  it('evicts when maxEntries is exceeded', () => {
    const tinyCache = new VoiceCache(2, 50 * 1024 * 1024);
    tinyCache.set('a', opts, mockBuffer());
    tinyCache.set('b', opts, mockBuffer());
    tinyCache.set('c', opts, mockBuffer()); // should evict 'a'
    expect(tinyCache.getStats().evictions).toBeGreaterThan(0);
    expect(tinyCache.getStats().size).toBeLessThanOrEqual(2);
  });

  it('tracks totalSizeBytes correctly', () => {
    cache.set('x', opts, mockBuffer(5, 40000));
    expect(cache.getStats().totalSizeBytes).toBe(40000);
    cache.set('y', opts, mockBuffer(5, 60000));
    expect(cache.getStats().totalSizeBytes).toBe(100000);
  });

  it('does not double-count when overwriting same key', () => {
    cache.set('text', opts, mockBuffer(5, 40000));
    cache.set('text', opts, mockBuffer(5, 50000)); // overwrite
    expect(cache.getStats().totalSizeBytes).toBe(50000);
  });

  it('respects TTL and treats expired entries as misses', async () => {
    const ttlMs = 10; // 10 ms TTL
    cache.set('expire', opts, mockBuffer(), ttlMs);
    await new Promise((r) => setTimeout(r, 20));
    expect(cache.get('expire', opts)).toBeUndefined();
    expect(cache.getStats().misses).toBeGreaterThan(0);
  });

  it('buildKey produces a stable string', () => {
    const key1 = VoiceCache.buildKey({ text: 'hello', voiceId: 'adam', language: 'en' });
    const key2 = VoiceCache.buildKey({ text: 'hello', voiceId: 'adam', language: 'en' });
    expect(key1).toBe(key2);
  });

  it('buildKey differs for different voiceId', () => {
    const key1 = VoiceCache.buildKey({ text: 'hello', voiceId: 'adam', language: 'en' });
    const key2 = VoiceCache.buildKey({ text: 'hello', voiceId: 'rachel', language: 'en' });
    expect(key1).not.toBe(key2);
  });
});
