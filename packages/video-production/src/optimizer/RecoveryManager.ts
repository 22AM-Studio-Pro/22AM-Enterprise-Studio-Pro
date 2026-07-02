import { CheckpointManager } from './CheckpointManager';

export type RenderJobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface RenderJobRecord {
  jobId: string;
  sceneId: string;
  status: RenderJobStatus;
  error?: string;
}

export interface RecoveryPlan {
  jobId: string;
  toRetry: string[];
  completed: string[];
  failed: string[];
}

export class RecoveryManager {
  constructor(private readonly checkpoints: CheckpointManager) {}

  buildRecoveryPlan(jobId: string, allJobs: RenderJobRecord[]): RecoveryPlan {
    const completedIds = this.checkpoints.getCompletedSceneIds(jobId);
    const toRetry: string[] = [];
    const completed: string[] = [];
    const failed: string[] = [];

    for (const job of allJobs) {
      if (completedIds.has(job.sceneId)) {
        completed.push(job.sceneId);
      } else if (job.status === 'failed') {
        failed.push(job.sceneId);
        toRetry.push(job.sceneId);
      } else {
        toRetry.push(job.sceneId);
      }
    }

    return { jobId, toRetry, completed, failed };
  }

  filterForResume(jobs: RenderJobRecord[], plan: RecoveryPlan): RenderJobRecord[] {
    const retrySet = new Set(plan.toRetry);
    return jobs.filter((j) => retrySet.has(j.sceneId));
  }
}
