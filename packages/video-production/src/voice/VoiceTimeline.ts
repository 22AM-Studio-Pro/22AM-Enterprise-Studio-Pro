export interface TimelineEntry {
  sceneId: string;
  chapterId: string;
  narrationPath: string;
  startTimeSeconds: number;
  durationSeconds: number;
  language: string;
}

export interface ChapterSyncPoint {
  chapterId: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  sceneIds: string[];
}

export interface VoiceTimelineResult {
  entries: TimelineEntry[];
  chapterSyncPoints: ChapterSyncPoint[];
  totalDurationSeconds: number;
}

export class VoiceTimeline {
  build(
    scenes: { id: string; chapterId: string; durationSeconds: number; startTimeSeconds?: number }[],
    language = 'en',
  ): VoiceTimelineResult {
    let cursor = 0;
    const entries: TimelineEntry[] = [];
    const chapterMap = new Map<string, ChapterSyncPoint>();

    for (const scene of scenes) {
      const start = scene.startTimeSeconds ?? cursor;
      const entry: TimelineEntry = {
        sceneId: scene.id,
        chapterId: scene.chapterId,
        narrationPath: `narration/${language}/${scene.id}.mp3`,
        startTimeSeconds: start,
        durationSeconds: scene.durationSeconds,
        language,
      };
      entries.push(entry);

      const sync = chapterMap.get(scene.chapterId) ?? {
        chapterId: scene.chapterId,
        startTimeSeconds: start,
        endTimeSeconds: start,
        sceneIds: [],
      };
      sync.endTimeSeconds = start + scene.durationSeconds;
      sync.sceneIds.push(scene.id);
      chapterMap.set(scene.chapterId, sync);

      cursor = start + scene.durationSeconds;
    }

    return {
      entries,
      chapterSyncPoints: [...chapterMap.values()],
      totalDurationSeconds: cursor,
    };
  }

  getChapterOffset(chapterId: string, result: VoiceTimelineResult): number {
    return result.chapterSyncPoints.find((cp) => cp.chapterId === chapterId)?.startTimeSeconds ?? 0;
  }
}
