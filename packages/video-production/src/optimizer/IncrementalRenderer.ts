import { SceneCache } from './SceneCache';

export interface IncrementalPlan {
  toRender: string[];
  cached: string[];
  cacheHitRate: number;
}

export class IncrementalRenderer {
  constructor(private readonly sceneCache: SceneCache) {}

  plan(sceneIds: string[], contentHashes: Map<string, string>): IncrementalPlan {
    const toRender: string[] = [];
    const cached: string[] = [];

    for (const id of sceneIds) {
      const hash = contentHashes.get(id);
      if (hash && this.sceneCache.isValid(id, hash)) {
        cached.push(id);
      } else {
        toRender.push(id);
      }
    }

    const cacheHitRate = sceneIds.length === 0 ? 0 : cached.length / sceneIds.length;
    return { toRender, cached, cacheHitRate };
  }

  markRendered(sceneId: string, renderPath: string, contentHash: string, sizeBytes: number): void {
    this.sceneCache.store(sceneId, renderPath, contentHash, sizeBytes);
  }
}
