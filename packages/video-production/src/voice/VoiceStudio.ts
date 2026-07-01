import { VoiceManager } from './VoiceManager';
import { VoiceCache } from './VoiceCache';
import { VoiceTimeline, VoiceTimelineResult } from './VoiceTimeline';
import { VoiceNormalizer } from './VoiceNormalizer';
import { PronunciationDictionary } from './PronunciationDictionary';
import { EmotionController } from './EmotionController';
import { SpeechPacing } from './SpeechPacing';
import { SubtitleGenerator, SubtitleTrack } from './SubtitleGenerator';
import { AudioBuffer, VoiceProviderName } from './VoiceProvider';

export interface SceneNarrationRequest {
  sceneId: string;
  chapterId: string;
  narration: string;
  tone: string;
  language: string;
  durationSeconds: number;
  startTimeSeconds: number;
}

export interface RenderedScene {
  sceneId: string;
  chapterId: string;
  audioBuffer: AudioBuffer;
  language: string;
  durationSeconds: number;
  narrationPath: string;
}

export interface VoiceStudioResult {
  renderedScenes: RenderedScene[];
  timeline: VoiceTimelineResult;
  subtitleTrack: SubtitleTrack;
  totalDurationSeconds: number;
}

export interface VoiceStudioOptions {
  providerName?: VoiceProviderName;
  voiceId?: string;
  useCache?: boolean;
  normalize?: boolean;
  subtitleFormat?: 'srt' | 'vtt' | 'json';
}

const DEFAULT_VOICE_ID = 'adam';

export class VoiceStudio {
  constructor(
    private readonly manager: VoiceManager,
    private readonly cache: VoiceCache,
    private readonly timeline: VoiceTimeline,
    private readonly normalizer: VoiceNormalizer,
    private readonly pronunciation: PronunciationDictionary,
    private readonly emotion: EmotionController,
    private readonly pacing: SpeechPacing,
    private readonly subtitleGen: SubtitleGenerator,
  ) {}

  async renderScene(req: SceneNarrationRequest, opts: VoiceStudioOptions = {}): Promise<RenderedScene> {
    const providerName = opts.providerName ?? this.manager.selectProviderForLanguage(req.language);
    const voiceId = opts.voiceId ?? DEFAULT_VOICE_ID;
    const detectedEmotion = this.emotion.detectFromTone(req.tone);
    const emotionProfile = this.emotion.getProfile(detectedEmotion);
    const pacingOpts = this.pacing.fitToTarget(req.narration, req.durationSeconds);
    const paced = this.pacing.processText(req.narration, pacingOpts);
    const synthesisOptions = {
      voiceId,
      language: req.language,
      emotion: detectedEmotion,
      speakingRate: emotionProfile.speakingRateMultiplier * (pacingOpts.wordsPerMinute ?? 140),
      ssml: true,
    };

    const cachedBuffer = (opts.useCache ?? true) ? this.cache.get(paced.ssmlText, synthesisOptions) : undefined;
    let buffer = cachedBuffer;

    if (!buffer) {
      const textToSynthesize = this.pronunciation.applyToSsml(paced.ssmlText);
      buffer = await this.manager.synthesize(textToSynthesize, synthesisOptions, providerName);
      if (opts.useCache ?? true) {
        this.cache.set(paced.ssmlText, synthesisOptions, buffer);
      }
    }

    const normalizedBuffer = (opts.normalize ?? true) ? this.normalizer.normalize(buffer) : buffer;

    return {
      sceneId: req.sceneId,
      chapterId: req.chapterId,
      audioBuffer: normalizedBuffer,
      language: req.language,
      durationSeconds: normalizedBuffer.durationSeconds,
      narrationPath: `narration/${req.language}/${req.sceneId}.mp3`,
    };
  }

  async renderBatch(scenes: SceneNarrationRequest[], opts: VoiceStudioOptions = {}): Promise<VoiceStudioResult> {
    const renderedScenes = await Promise.all(scenes.map((scene) => this.renderScene(scene, opts)));
    const timelineInput = renderedScenes.map((rs) => ({
      id: rs.sceneId,
      chapterId: rs.chapterId,
      durationSeconds: rs.durationSeconds,
      startTimeSeconds: scenes.find((s) => s.sceneId === rs.sceneId)?.startTimeSeconds ?? 0,
    }));
    const timelineResult = this.timeline.build(timelineInput, opts.subtitleFormat ? scenes[0]?.language : 'en');

    const subtitleInput = scenes.map((scene) => ({
      id: scene.sceneId,
      narration: scene.narration,
      startTimeSeconds: scene.startTimeSeconds,
      durationSeconds: scene.durationSeconds,
    }));
    const subtitleTrack = this.subtitleGen.generateBatch(subtitleInput);

    return {
      renderedScenes,
      timeline: timelineResult,
      subtitleTrack,
      totalDurationSeconds: timelineResult.totalDurationSeconds,
    };
  }

  static createDefault(): VoiceStudio {
    return new VoiceStudio(
      new VoiceManager(),
      new VoiceCache(),
      new VoiceTimeline(),
      new VoiceNormalizer(),
      new PronunciationDictionary(),
      new EmotionController(),
      new SpeechPacing(),
      new SubtitleGenerator(),
    );
  }
}
