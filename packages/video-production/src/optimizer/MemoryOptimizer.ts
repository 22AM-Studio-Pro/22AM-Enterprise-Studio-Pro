export interface MemoryBudget {
  maxConcurrentScenes: number;
  maxCacheSizeBytes: number;
  maxAssetPoolSizeBytes: number;
}

export interface BatchPlan {
  batches: string[][];
  batchCount: number;
  scenesPerBatch: number;
}

const DEFAULT_CONCURRENT = 4;
const BYTES_PER_MB = 1_048_576;
const DEFAULT_CACHE_MB = 2048;
const DEFAULT_POOL_MB = 1024;

export class MemoryOptimizer {
  defaultBudget(): MemoryBudget {
    return {
      maxConcurrentScenes: DEFAULT_CONCURRENT,
      maxCacheSizeBytes: DEFAULT_CACHE_MB * BYTES_PER_MB,
      maxAssetPoolSizeBytes: DEFAULT_POOL_MB * BYTES_PER_MB,
    };
  }

  partition(sceneIds: string[], budget: MemoryBudget): BatchPlan {
    const size = budget.maxConcurrentScenes;
    const batches: string[][] = [];
    for (let i = 0; i < sceneIds.length; i += size) {
      batches.push(sceneIds.slice(i, i + size));
    }
    return { batches, batchCount: batches.length, scenesPerBatch: size };
  }

  estimatePeakMemoryBytes(concurrentScenes: number, avgSceneSizeBytes: number): number {
    return concurrentScenes * avgSceneSizeBytes;
  }
}
