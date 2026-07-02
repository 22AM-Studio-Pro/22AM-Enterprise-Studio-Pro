import { MusicLibrary, MusicMood } from './MusicLibrary';
import { MusicSelector } from './MusicSelector';
import { MusicTimeline, MusicTimelineResult } from './MusicTimeline';
import { AudioDucking, VolumeEnvelope } from './AudioDucking';
import { FadeController } from './FadeController';
import { MusicMixer, MixTrackInput } from './MusicMixer';
import { MusicCache } from './MusicCache';

export interface MusicEngineInput {
  chapters: { id: string; mood?: string }[];
  scenes: { id: string; chapterId: string; startTimeSeconds: number; durationSeconds: number }[];
  totalDurationSeconds: number;
}

export interface MusicEngineOutput {
  timeline: MusicTimelineResult;
  duckingEnvelopes: VolumeEnvelope[];
  mixCommand: { ffmpegCommand: string[]; outputPath: string };
}

const FADE_IN_SECONDS = 1.5;
const FADE_OUT_SECONDS = 2.0;
const BG_VOLUME_DB = -18;
const INTRO_VOLUME_DB = -12;
const CHAPTER_VOLUME_DB = -10;

export class MusicEngine {
  constructor(
    private readonly selector: MusicSelector,
    private readonly timeline: MusicTimeline,
    private readonly ducking: AudioDucking,
    private readonly fader: FadeController,
    private readonly mixer: MusicMixer,
    private readonly cache: MusicCache,
  ) {}

  compose(input: MusicEngineInput): MusicEngineOutput {
    this.timeline.clear();
    const mixInputs: MixTrackInput[] = [];

    const moodHint = (input.chapters[0]?.mood as MusicMood | undefined) ?? 'neutral';
    const intro = this.selector.selectIntro({ mood: moodHint });
    if (intro) {
      this.timeline.addCue({ id: 'intro', trackId: intro.id, role: 'intro', startTimeSeconds: 0, endTimeSeconds: intro.durationSeconds, fadeInSeconds: FADE_IN_SECONDS, fadeOutSeconds: FADE_OUT_SECONDS, volumeDb: INTRO_VOLUME_DB });
      mixInputs.push({ id: 'intro', filePath: intro.filePath, startTimeSeconds: 0, volumeDb: INTRO_VOLUME_DB, filters: [this.fader.buildFadeInFilter(0, FADE_IN_SECONDS), this.fader.buildFadeOutFilter(intro.durationSeconds - FADE_OUT_SECONDS, FADE_OUT_SECONDS)] });
      if (!this.cache.has(intro.id)) this.cache.set(intro.id, intro, intro.filePath);
    }

    const bg = this.selector.selectBackground({ preferLoopable: true });
    if (bg) {
      this.timeline.addCue({ id: 'bg', trackId: bg.id, role: 'background-loop', startTimeSeconds: 0, endTimeSeconds: input.totalDurationSeconds, fadeInSeconds: FADE_IN_SECONDS, fadeOutSeconds: FADE_OUT_SECONDS, volumeDb: BG_VOLUME_DB });
      mixInputs.push({ id: 'bg', filePath: bg.filePath, startTimeSeconds: 0, volumeDb: BG_VOLUME_DB });
    }

    for (const chapter of input.chapters) {
      const chapterMood = (chapter.mood as MusicMood | undefined) ?? 'epic';
      const theme = this.selector.selectChapterTheme(chapterMood);
      const firstScene = input.scenes.find((s) => s.chapterId === chapter.id);
      if (theme && firstScene) {
        const start = firstScene.startTimeSeconds;
        this.timeline.addCue({ id: `chapter-${chapter.id}`, trackId: theme.id, role: 'chapter-theme', startTimeSeconds: start, endTimeSeconds: start + theme.durationSeconds, fadeInSeconds: 0.5, fadeOutSeconds: 1.0, volumeDb: CHAPTER_VOLUME_DB, chapterId: chapter.id });
        mixInputs.push({ id: `chapter-${chapter.id}`, filePath: theme.filePath, startTimeSeconds: start, volumeDb: CHAPTER_VOLUME_DB });
      }
    }

    const outro = this.selector.selectOutro({ mood: 'uplifting' });
    if (outro) {
      const outroStart = Math.max(0, input.totalDurationSeconds - outro.durationSeconds);
      this.timeline.addCue({ id: 'outro', trackId: outro.id, role: 'outro', startTimeSeconds: outroStart, endTimeSeconds: input.totalDurationSeconds, fadeInSeconds: FADE_IN_SECONDS, fadeOutSeconds: FADE_OUT_SECONDS, volumeDb: INTRO_VOLUME_DB });
      mixInputs.push({ id: 'outro', filePath: outro.filePath, startTimeSeconds: outroStart, volumeDb: INTRO_VOLUME_DB, filters: [this.fader.buildFadeInFilter(outroStart, FADE_IN_SECONDS)] });
    }

    const narrationSegments = input.scenes.map((s) => ({ startTimeSeconds: s.startTimeSeconds, durationSeconds: s.durationSeconds }));
    const duckingEnvelopes = this.ducking.generateEnvelopes(narrationSegments);
    const timelineResult = this.timeline.buildResult(input.totalDurationSeconds);
    const mixCommand = this.mixer.buildMixCommand(mixInputs, 'output/music-mix.mp3', input.totalDurationSeconds);

    return { timeline: timelineResult, duckingEnvelopes, mixCommand };
  }

  static createDefault(): MusicEngine {
    const library = new MusicLibrary();
    return new MusicEngine(
      new MusicSelector(library),
      new MusicTimeline(),
      new AudioDucking(),
      new FadeController(),
      new MusicMixer(),
      new MusicCache(),
    );
  }
}
