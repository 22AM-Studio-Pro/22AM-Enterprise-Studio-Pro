import { ChapterOutline, Storyboard } from './DirectorContext';

export type MusicMood = 'uplifting' | 'epic' | 'calm' | 'tense' | 'neutral' | 'melancholic';

export type MusicSource = 'ai-generated' | 'royalty-free-library' | 'custom';

export interface MusicTrackSpec {
  id: string;
  role: 'intro' | 'outro' | 'background-loop' | 'chapter-theme' | 'transition-sting';
  mood: MusicMood;
  source: MusicSource;
  bpm?: number;
  durationSeconds: number;
  loopable: boolean;
  tags: string[];
}

export interface MusicCuePoint {
  sceneId: string;
  trackId: string;
  startTimeSeconds: number;
  durationSeconds: number;
  fadeInSeconds: number;
  fadeOutSeconds: number;
  volumeDb: number;
  ducked: boolean;
}

export interface MusicSchedule {
  tracks: MusicTrackSpec[];
  cuePoints: MusicCuePoint[];
}

export interface VolumeEnvelope {
  timeSeconds: number;
  volumeDb: number;
}

const DEFAULT_BACKGROUND_VOLUME = -18;
const DUCKED_BACKGROUND_VOLUME = -28;
const FADE_IN_SECONDS = 1.5;
const FADE_OUT_SECONDS = 2.0;

export class MusicLibrary {
  private readonly tracks: MusicTrackSpec[] = [
    {
      id: 'intro-theme-epic',
      role: 'intro',
      mood: 'epic',
      source: 'royalty-free-library',
      bpm: 120,
      durationSeconds: 30,
      loopable: false,
      tags: ['intro', 'epic', 'orchestral'],
    },
    {
      id: 'outro-theme-uplifting',
      role: 'outro',
      mood: 'uplifting',
      source: 'royalty-free-library',
      bpm: 110,
      durationSeconds: 30,
      loopable: false,
      tags: ['outro', 'uplifting', 'resolution'],
    },
    {
      id: 'bg-loop-calm',
      role: 'background-loop',
      mood: 'calm',
      source: 'royalty-free-library',
      bpm: 80,
      durationSeconds: 60,
      loopable: true,
      tags: ['background', 'calm', 'ambient'],
    },
    {
      id: 'bg-loop-tense',
      role: 'background-loop',
      mood: 'tense',
      source: 'royalty-free-library',
      bpm: 130,
      durationSeconds: 60,
      loopable: true,
      tags: ['background', 'tense', 'suspense'],
    },
    {
      id: 'transition-sting-01',
      role: 'transition-sting',
      mood: 'neutral',
      source: 'royalty-free-library',
      bpm: 100,
      durationSeconds: 2,
      loopable: false,
      tags: ['transition', 'sting', 'short'],
    },
    {
      id: 'chapter-theme-epic',
      role: 'chapter-theme',
      mood: 'epic',
      source: 'royalty-free-library',
      bpm: 120,
      durationSeconds: 10,
      loopable: false,
      tags: ['chapter', 'epic', 'reveal'],
    },
    {
      id: 'ai-music-neutral',
      role: 'background-loop',
      mood: 'neutral',
      source: 'ai-generated',
      bpm: 90,
      durationSeconds: 120,
      loopable: true,
      tags: ['ai', 'background', 'neutral'],
    },
  ];

  findByRole(role: MusicTrackSpec['role']): MusicTrackSpec[] {
    return this.tracks.filter((track) => track.role === role);
  }

  findByMood(mood: MusicMood): MusicTrackSpec[] {
    return this.tracks.filter((track) => track.mood === mood);
  }

  findById(id: string): MusicTrackSpec | undefined {
    return this.tracks.find((track) => track.id === id);
  }

  all(): MusicTrackSpec[] {
    return [...this.tracks];
  }
}

export class VolumeDucker {
  generateEnvelope(cuePoints: MusicCuePoint[]): VolumeEnvelope[] {
    return cuePoints.flatMap((cue) => [
      { timeSeconds: cue.startTimeSeconds, volumeDb: cue.ducked ? DUCKED_BACKGROUND_VOLUME : DEFAULT_BACKGROUND_VOLUME },
      {
        timeSeconds: cue.startTimeSeconds + cue.fadeInSeconds,
        volumeDb: cue.ducked ? DUCKED_BACKGROUND_VOLUME : DEFAULT_BACKGROUND_VOLUME,
      },
      {
        timeSeconds: cue.startTimeSeconds + cue.durationSeconds - cue.fadeOutSeconds,
        volumeDb: cue.ducked ? DUCKED_BACKGROUND_VOLUME : DEFAULT_BACKGROUND_VOLUME,
      },
      {
        timeSeconds: cue.startTimeSeconds + cue.durationSeconds,
        volumeDb: DEFAULT_BACKGROUND_VOLUME,
      },
    ]);
  }
}

export class MusicScheduler {
  constructor(private readonly library: MusicLibrary) {}

  schedule(storyboard: Storyboard, chapters: ChapterOutline[]): MusicSchedule {
    const tracks: MusicTrackSpec[] = [];
    const cuePoints: MusicCuePoint[] = [];
    const usedTrackIds = new Set<string>();

    const introTrack = this.library.findByRole('intro')[0];
    const outroTrack = this.library.findByRole('outro')[0];
    const bgTrack = this.library.findByRole('background-loop')[0];
    const transitionSting = this.library.findByRole('transition-sting')[0];
    const chapterTheme = this.library.findByRole('chapter-theme')[0];

    for (const track of [introTrack, outroTrack, bgTrack, transitionSting, chapterTheme]) {
      if (track && !usedTrackIds.has(track.id)) {
        tracks.push(track);
        usedTrackIds.add(track.id);
      }
    }

    const totalDuration = storyboard.estimatedRuntimeSeconds;

    if (introTrack) {
      cuePoints.push({
        sceneId: storyboard.scenes[0]?.id ?? 'intro',
        trackId: introTrack.id,
        startTimeSeconds: 0,
        durationSeconds: introTrack.durationSeconds,
        fadeInSeconds: FADE_IN_SECONDS,
        fadeOutSeconds: FADE_OUT_SECONDS,
        volumeDb: DEFAULT_BACKGROUND_VOLUME + 6,
        ducked: false,
      });
    }

    if (outroTrack) {
      const outroStart = Math.max(0, totalDuration - outroTrack.durationSeconds);
      const lastScene = storyboard.scenes[storyboard.scenes.length - 1];
      cuePoints.push({
        sceneId: lastScene?.id ?? 'outro',
        trackId: outroTrack.id,
        startTimeSeconds: outroStart,
        durationSeconds: outroTrack.durationSeconds,
        fadeInSeconds: FADE_IN_SECONDS,
        fadeOutSeconds: FADE_OUT_SECONDS,
        volumeDb: DEFAULT_BACKGROUND_VOLUME + 6,
        ducked: false,
      });
    }

    if (bgTrack) {
      cuePoints.push({
        sceneId: 'background',
        trackId: bgTrack.id,
        startTimeSeconds: 0,
        durationSeconds: totalDuration,
        fadeInSeconds: FADE_IN_SECONDS,
        fadeOutSeconds: FADE_OUT_SECONDS,
        volumeDb: DEFAULT_BACKGROUND_VOLUME,
        ducked: true,
      });
    }

    for (const chapter of chapters) {
      const firstScene = storyboard.scenes.find((scene) => scene.chapterId === chapter.id);
      if (firstScene && chapterTheme) {
        cuePoints.push({
          sceneId: firstScene.id,
          trackId: chapterTheme.id,
          startTimeSeconds: firstScene.startTimeSeconds ?? 0,
          durationSeconds: chapterTheme.durationSeconds,
          fadeInSeconds: 0.5,
          fadeOutSeconds: 1.0,
          volumeDb: DEFAULT_BACKGROUND_VOLUME + 8,
          ducked: false,
        });
      }

      if (transitionSting) {
        const lastScene = [...storyboard.scenes].reverse().find((scene) => scene.chapterId === chapter.id);
        if (lastScene) {
          const stingStart = (lastScene.startTimeSeconds ?? 0) + lastScene.durationSeconds - transitionSting.durationSeconds;
          cuePoints.push({
            sceneId: lastScene.id,
            trackId: transitionSting.id,
            startTimeSeconds: Math.max(0, stingStart),
            durationSeconds: transitionSting.durationSeconds,
            fadeInSeconds: 0,
            fadeOutSeconds: 0,
            volumeDb: DEFAULT_BACKGROUND_VOLUME + 10,
            ducked: false,
          });
        }
      }
    }

    return { tracks, cuePoints };
  }
}

export class MusicEngine {
  constructor(
    readonly library: MusicLibrary,
    private readonly scheduler: MusicScheduler,
    private readonly ducker: VolumeDucker,
  ) {}

  compose(storyboard: Storyboard, chapters: ChapterOutline[]): { schedule: MusicSchedule; envelopes: VolumeEnvelope[] } {
    const schedule = this.scheduler.schedule(storyboard, chapters);
    const envelopes = this.ducker.generateEnvelope(schedule.cuePoints);
    return { schedule, envelopes };
  }

  static createDefault(): MusicEngine {
    const library = new MusicLibrary();
    const scheduler = new MusicScheduler(library);
    const ducker = new VolumeDucker();
    return new MusicEngine(library, scheduler, ducker);
  }
}
