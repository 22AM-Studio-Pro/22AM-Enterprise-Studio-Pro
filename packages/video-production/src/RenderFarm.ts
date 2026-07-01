import { RenderQueueItem } from './TimelineBuilder';

export interface RenderCommand {
  executable: 'ffmpeg';
  args: string[];
}

export interface RenderJob {
  id: string;
  queueItemId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  command: RenderCommand;
}

export interface RenderCheckpoint {
  sceneId: string;
  completedAt: number;
  outputPath: string;
}

export interface RenderProgress {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  percent: number;
}

export class FFmpegOrchestrator {
  buildSceneCommand(sceneId: string, outputPath: string): RenderCommand {
    return {
      executable: 'ffmpeg',
      args: ['-hwaccel', 'auto', '-i', `${sceneId}.mp4`, '-c:v', 'h264_nvenc', outputPath],
    };
  }

  buildMergeCommand(concatFilePath: string, outputPath: string): RenderCommand {
    return {
      executable: 'ffmpeg',
      args: ['-f', 'concat', '-safe', '0', '-i', concatFilePath, '-c', 'copy', outputPath],
    };
  }

  buildEncodeCommand(inputPath: string, outputPath: string): RenderCommand {
    return {
      executable: 'ffmpeg',
      args: ['-i', inputPath, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', outputPath],
    };
  }
}

export class RenderFarm {
  constructor(private readonly orchestrator: FFmpegOrchestrator) {}

  createJobs(renderQueue: RenderQueueItem[]): RenderJob[] {
    return renderQueue.map((item) => ({
      id: `job-${item.id}`,
      queueItemId: item.id,
      status: 'queued',
      progress: 0,
      command: this.orchestrator.buildSceneCommand(item.sceneId, `renders/${item.sceneId}.mp4`),
    }));
  }

  runJobs(jobs: RenderJob[]): { jobs: RenderJob[]; checkpoints: RenderCheckpoint[]; progress: RenderProgress } {
    const checkpoints: RenderCheckpoint[] = [];

    const completedJobs = jobs.map((job) => {
      const updated: RenderJob = {
        ...job,
        status: 'completed',
        progress: 100,
      };

      checkpoints.push({
        sceneId: job.queueItemId,
        completedAt: Date.now(),
        outputPath: `renders/${job.queueItemId}.mp4`,
      });

      return updated;
    });

    const progress = this.calculateProgress(completedJobs);

    return { jobs: completedJobs, checkpoints, progress };
  }

  resumeFromCheckpoints(jobs: RenderJob[], checkpoints: RenderCheckpoint[]): RenderJob[] {
    const completedIds = new Set(checkpoints.map((checkpoint) => checkpoint.sceneId));

    return jobs.map((job) =>
      completedIds.has(job.queueItemId)
        ? {
            ...job,
            status: 'completed',
            progress: 100,
          }
        : job,
    );
  }

  private calculateProgress(jobs: RenderJob[]): RenderProgress {
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter((job) => job.status === 'completed').length;
    const failedJobs = jobs.filter((job) => job.status === 'failed').length;
    const percent = totalJobs === 0 ? 0 : Math.round((completedJobs / totalJobs) * 100);

    return {
      totalJobs,
      completedJobs,
      failedJobs,
      percent,
    };
  }
}
