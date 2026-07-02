import { ScenePlan } from './DirectorContext';
import { SceneComposition } from './SceneGenerator';

export type TrackType = 'video' | 'narration' | 'music' | 'subtitle' | 'overlay' | 'animation';

export interface TimelineClip {
  id: string;
  sceneId: string;
  trackType: TrackType;
  startTimeSeconds: number;
  durationSeconds: number;
  content: string;
}

export interface TimelineTrack {
  id: string;
  type: TrackType;
  clips: TimelineClip[];
}

export interface MasterTimeline {
  tracks: TimelineTrack[];
  totalDurationSeconds: number;
}

export interface RenderQueueItem {
  id: string;
  sceneId: string;
  startTimeSeconds: number;
  durationSeconds: number;
  trackBindings: TrackType[];
}

export class TimelineBuilder {
  build(scenes: ScenePlan[], compositions: SceneComposition[]): { timeline: MasterTimeline; renderQueue: RenderQueueItem[] } {
    const compositionMap = new Map(compositions.map((composition) => [composition.sceneId, composition]));
    const tracks: TimelineTrack[] = [
      { id: 'track-video', type: 'video', clips: [] },
      { id: 'track-narration', type: 'narration', clips: [] },
      { id: 'track-music', type: 'music', clips: [] },
      { id: 'track-subtitle', type: 'subtitle', clips: [] },
      { id: 'track-overlay', type: 'overlay', clips: [] },
      { id: 'track-animation', type: 'animation', clips: [] },
    ];

    const renderQueue: RenderQueueItem[] = scenes.map((scene) => ({
      id: `render-${scene.id}`,
      sceneId: scene.id,
      startTimeSeconds: scene.startTimeSeconds ?? 0,
      durationSeconds: scene.durationSeconds,
      trackBindings: ['video', 'narration', 'music', 'subtitle', 'overlay', 'animation'],
    }));

    for (const scene of scenes) {
      const start = scene.startTimeSeconds ?? 0;
      const composition = compositionMap.get(scene.id);

      tracks[0].clips.push({
        id: `clip-video-${scene.id}`,
        sceneId: scene.id,
        trackType: 'video',
        startTimeSeconds: start,
        durationSeconds: scene.durationSeconds,
        content: composition?.background ?? scene.assetType,
      });
      tracks[1].clips.push({
        id: `clip-narration-${scene.id}`,
        sceneId: scene.id,
        trackType: 'narration',
        startTimeSeconds: start,
        durationSeconds: scene.durationSeconds,
        content: scene.narration,
      });
      tracks[2].clips.push({
        id: `clip-music-${scene.id}`,
        sceneId: scene.id,
        trackType: 'music',
        startTimeSeconds: start,
        durationSeconds: scene.durationSeconds,
        content: scene.musicCue,
      });
      tracks[3].clips.push({
        id: `clip-subtitle-${scene.id}`,
        sceneId: scene.id,
        trackType: 'subtitle',
        startTimeSeconds: start,
        durationSeconds: scene.durationSeconds,
        content: scene.subtitles.join(' '),
      });
      tracks[4].clips.push({
        id: `clip-overlay-${scene.id}`,
        sceneId: scene.id,
        trackType: 'overlay',
        startTimeSeconds: start,
        durationSeconds: scene.durationSeconds,
        content: composition?.lowerThirds?.join(' | ') ?? '',
      });
      tracks[5].clips.push({
        id: `clip-animation-${scene.id}`,
        sceneId: scene.id,
        trackType: 'animation',
        startTimeSeconds: start,
        durationSeconds: scene.durationSeconds,
        content: scene.effects.join(', '),
      });
    }

    const totalDurationSeconds = scenes.reduce((total, scene) => total + scene.durationSeconds, 0);

    return {
      timeline: {
        tracks,
        totalDurationSeconds,
      },
      renderQueue,
    };
  }
}
