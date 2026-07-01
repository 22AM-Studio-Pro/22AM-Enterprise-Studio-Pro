export interface Checkpoint {
  id: string;
  sceneId: string;
  outputPath: string;
  completedAt: number;
  durationSeconds: number;
  sizeBytes: number;
}

export interface CheckpointIndex {
  jobId: string;
  checkpoints: Checkpoint[];
  lastUpdatedAt: number;
}

export class CheckpointManager {
  private readonly indexes = new Map<string, CheckpointIndex>();

  createIndex(jobId: string): void {
    this.indexes.set(jobId, { jobId, checkpoints: [], lastUpdatedAt: Date.now() });
  }

  save(jobId: string, sceneId: string, outputPath: string, durationSeconds: number, sizeBytes: number): Checkpoint {
    let index = this.indexes.get(jobId);
    if (!index) {
      this.createIndex(jobId);
      index = this.indexes.get(jobId)!;
    }

    const checkpoint: Checkpoint = {
      id: `cp-${sceneId}-${Date.now()}`,
      sceneId,
      outputPath,
      completedAt: Date.now(),
      durationSeconds,
      sizeBytes,
    };

    index.checkpoints.push(checkpoint);
    index.lastUpdatedAt = Date.now();
    return checkpoint;
  }

  getCompletedSceneIds(jobId: string): Set<string> {
    const index = this.indexes.get(jobId);
    if (!index) return new Set();
    return new Set(index.checkpoints.map((cp) => cp.sceneId));
  }

  getIndex(jobId: string): CheckpointIndex | undefined {
    return this.indexes.get(jobId);
  }

  clear(jobId: string): void {
    this.indexes.delete(jobId);
  }

  serialize(jobId: string): string {
    const index = this.indexes.get(jobId);
    return index ? JSON.stringify(index, null, 2) : '{}';
  }

  deserialize(data: string): CheckpointIndex {
    return JSON.parse(data) as CheckpointIndex;
  }
}
