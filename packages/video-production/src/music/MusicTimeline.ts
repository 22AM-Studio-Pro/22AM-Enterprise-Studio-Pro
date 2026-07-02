export interface MusicCuePoint {
  id: string;
  trackId: string;
  role: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  fadeInSeconds: number;
  fadeOutSeconds: number;
  volumeDb: number;
  sceneId?: string;
  chapterId?: string;
}

export interface MusicTimelineResult {
  cuePoints: MusicCuePoint[];
  totalDurationSeconds: number;
}

export class MusicTimeline {
  private cuePoints: MusicCuePoint[] = [];

  addCue(cue: MusicCuePoint): void {
    this.cuePoints.push(cue);
  }

  buildResult(totalDurationSeconds: number): MusicTimelineResult {
    const sorted = [...this.cuePoints].sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
    return { cuePoints: sorted, totalDurationSeconds };
  }

  clear(): void {
    this.cuePoints = [];
  }

  getOverlapping(timeSeconds: number): MusicCuePoint[] {
    return this.cuePoints.filter((c) => c.startTimeSeconds <= timeSeconds && c.endTimeSeconds >= timeSeconds);
  }
}
