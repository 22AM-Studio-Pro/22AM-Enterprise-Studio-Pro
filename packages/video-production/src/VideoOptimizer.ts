import { ScenePlan, Storyboard } from './DirectorContext';
import { RenderCheckpoint, RenderJob } from './RenderFarm';

export interface AssetCacheEntry {
  assetId: string;
  path: string;
  sizeBytes: number;
  lastUsedAt: number;
  hitCount: number;
}

export interface SceneCacheEntry {
  sceneId: string;
  renderPath: string;
  hash: string;
  cachedAt: number;
}

export interface MemoryBudget {
  maxConcurrentScenes: number;
  maxCacheSizeBytes: number;
  maxAssetPoolSizeBytes: number;
}

export interface EncodingProfile {
  preset: 'ultrafast' | 'fast' | 'medium' | 'slow';
  crf: number;
  videoBitrate?: string;
  audioBitrate?: string;
  resolution?: '1080p' | '720p' | '4k';
  hwAcceleration: boolean;
}

export interface OptimizedRenderPlan {
  batches: ScenePlan[][];
  cachedSceneIds: string[];
  reusableAssets: AssetCacheEntry[];
  encodingProfile: EncodingProfile;
  estimatedSizeBytes: number;
}

export interface CrashRecoveryState {
  lastCheckpointAt: number;
  completedSceneIds: string[];
  pendingSceneIds: string[];
  failedSceneIds: string[];
}

const BYTES_PER_MB = 1_048_576;
const DEFAULT_MAX_CACHE_MB = 2048;
const DEFAULT_ASSET_POOL_MB = 1024;
const DEFAULT_CONCURRENT_SCENES = 4;

export class AssetCache {
  private readonly cache = new Map<string, AssetCacheEntry>();
  private totalSizeBytes = 0;

  constructor(private readonly maxSizeBytes: number = DEFAULT_MAX_CACHE_MB * BYTES_PER_MB) {}

  store(assetId: string, path: string, sizeBytes: number): void {
    if (this.cache.has(assetId)) {
      const existing = this.cache.get(assetId)!;
      existing.hitCount += 1;
      existing.lastUsedAt = Date.now();
      return;
    }

    this.evictIfNeeded(sizeBytes);

    this.cache.set(assetId, {
      assetId,
      path,
      sizeBytes,
      lastUsedAt: Date.now(),
      hitCount: 1,
    });
    this.totalSizeBytes += sizeBytes;
  }

  get(assetId: string): AssetCacheEntry | undefined {
    const entry = this.cache.get(assetId);
    if (entry) {
      entry.lastUsedAt = Date.now();
      entry.hitCount += 1;
    }
    return entry;
  }

  evictLRU(): void {
    let oldest: AssetCacheEntry | undefined;
    for (const entry of this.cache.values()) {
      if (!oldest || entry.lastUsedAt < oldest.lastUsedAt) {
        oldest = entry;
      }
    }
    if (oldest) {
      this.totalSizeBytes -= oldest.sizeBytes;
      this.cache.delete(oldest.assetId);
    }
  }

  private evictIfNeeded(incomingSizeBytes: number): void {
    while (this.totalSizeBytes + incomingSizeBytes > this.maxSizeBytes && this.cache.size > 0) {
      this.evictLRU();
    }
  }

  all(): AssetCacheEntry[] {
    return [...this.cache.values()];
  }
}

export class SceneCache {
  private readonly cache = new Map<string, SceneCacheEntry>();

  store(sceneId: string, renderPath: string, hash: string): void {
    this.cache.set(sceneId, { sceneId, renderPath, hash, cachedAt: Date.now() });
  }

  get(sceneId: string): SceneCacheEntry | undefined {
    return this.cache.get(sceneId);
  }

  has(sceneId: string): boolean {
    return this.cache.has(sceneId);
  }

  invalidate(sceneId: string): void {
    this.cache.delete(sceneId);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}

export class MemoryOptimizer {
  partitionIntoBatches(scenes: ScenePlan[], budget: MemoryBudget): ScenePlan[][] {
    const batches: ScenePlan[][] = [];
    const batchSize = budget.maxConcurrentScenes;

    for (let i = 0; i < scenes.length; i += batchSize) {
      batches.push(scenes.slice(i, i + batchSize));
    }

    return batches;
  }

  selectEncodingProfile(storyboard: Storyboard): EncodingProfile {
    const totalMinutes = storyboard.estimatedRuntimeSeconds / 60;

    if (totalMinutes >= 60) {
      return { preset: 'fast', crf: 23, resolution: '1080p', hwAcceleration: true };
    }

    if (totalMinutes >= 30) {
      return { preset: 'medium', crf: 20, resolution: '1080p', hwAcceleration: true };
    }

    return { preset: 'slow', crf: 18, resolution: '1080p', hwAcceleration: false };
  }

  estimateOutputSizeBytes(storyboard: Storyboard, profile: EncodingProfile): number {
    const bitrateKbps = profile.crf <= 18 ? 8000 : profile.crf <= 22 ? 5000 : 3500;
    const durationSeconds = storyboard.estimatedRuntimeSeconds;
    return Math.round((bitrateKbps * 1000 * durationSeconds) / 8);
  }
}

export class CrashRecoveryManager {
  buildRecoveryState(jobs: RenderJob[], checkpoints: RenderCheckpoint[]): CrashRecoveryState {
    const completedIds = new Set(checkpoints.map((cp) => cp.sceneId));
    const failedIds = new Set(jobs.filter((job) => job.status === 'failed').map((job) => job.queueItemId));

    return {
      lastCheckpointAt: checkpoints.reduce((max, cp) => Math.max(max, cp.completedAt), 0),
      completedSceneIds: [...completedIds],
      pendingSceneIds: jobs
        .filter((job) => job.status === 'queued' || job.status === 'running')
        .map((job) => job.queueItemId),
      failedSceneIds: [...failedIds],
    };
  }

  filterPendingJobs(jobs: RenderJob[], state: CrashRecoveryState): RenderJob[] {
    const completedSet = new Set(state.completedSceneIds);
    return jobs.filter((job) => !completedSet.has(job.queueItemId));
  }
}

export class IncrementalRenderer {
  selectScenesForIncremental(scenes: ScenePlan[], sceneCache: SceneCache): { toRender: ScenePlan[]; cached: string[] } {
    const toRender: ScenePlan[] = [];
    const cached: string[] = [];

    for (const scene of scenes) {
      if (sceneCache.has(scene.id)) {
        cached.push(scene.id);
      } else {
        toRender.push(scene);
      }
    }

    return { toRender, cached };
  }
}

export class VideoOptimizer {
  constructor(
    private readonly assetCache: AssetCache,
    private readonly sceneCache: SceneCache,
    private readonly memoryOptimizer: MemoryOptimizer,
    private readonly crashRecovery: CrashRecoveryManager,
    private readonly incrementalRenderer: IncrementalRenderer,
  ) {}

  buildOptimizedPlan(storyboard: Storyboard, budget: MemoryBudget): OptimizedRenderPlan {
    const { toRender, cached } = this.incrementalRenderer.selectScenesForIncremental(storyboard.scenes, this.sceneCache);
    const batches = this.memoryOptimizer.partitionIntoBatches(toRender, budget);
    const encodingProfile = this.memoryOptimizer.selectEncodingProfile(storyboard);
    const estimatedSizeBytes = this.memoryOptimizer.estimateOutputSizeBytes(storyboard, encodingProfile);

    return {
      batches,
      cachedSceneIds: cached,
      reusableAssets: this.assetCache.all(),
      encodingProfile,
      estimatedSizeBytes,
    };
  }

  recoverFromCrash(jobs: RenderJob[], checkpoints: RenderCheckpoint[]): CrashRecoveryState {
    return this.crashRecovery.buildRecoveryState(jobs, checkpoints);
  }

  resumeJobs(jobs: RenderJob[], state: CrashRecoveryState): RenderJob[] {
    return this.crashRecovery.filterPendingJobs(jobs, state);
  }

  defaultBudget(): MemoryBudget {
    return {
      maxConcurrentScenes: DEFAULT_CONCURRENT_SCENES,
      maxCacheSizeBytes: DEFAULT_MAX_CACHE_MB * BYTES_PER_MB,
      maxAssetPoolSizeBytes: DEFAULT_ASSET_POOL_MB * BYTES_PER_MB,
    };
  }

  static createDefault(): VideoOptimizer {
    return new VideoOptimizer(
      new AssetCache(),
      new SceneCache(),
      new MemoryOptimizer(),
      new CrashRecoveryManager(),
      new IncrementalRenderer(),
    );
  }
}
