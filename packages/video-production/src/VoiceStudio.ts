import { ChapterOutline, DirectorRequest, ScenePlan } from './DirectorContext';

export type TTSEmotion = 'neutral' | 'excited' | 'serious' | 'empathetic' | 'inspirational' | 'dramatic';

export type TTSPacing = 'slow' | 'normal' | 'fast';

export interface NarratorProfile {
  id: string;
  name: string;
  language: string;
  accent: string;
  emotion: TTSEmotion;
  pacing: TTSPacing;
  provider: string;
  voiceId: string;
}

export interface PronunciationEntry {
  word: string;
  phoneme: string;
}

export interface VoiceDirective {
  sceneId: string;
  narratorId: string;
  text: string;
  emotion: TTSEmotion;
  pacing: TTSPacing;
  pauseBeforeSeconds: number;
  pauseAfterSeconds: number;
  pronunciationOverrides: PronunciationEntry[];
  ssml: string;
}

export interface RenderedNarration {
  sceneId: string;
  narratorId: string;
  audioPath: string;
  durationSeconds: number;
  language: string;
}

const DEFAULT_NARRATOR: NarratorProfile = {
  id: 'narrator-default',
  name: 'Default Narrator',
  language: 'en',
  accent: 'neutral',
  emotion: 'neutral',
  pacing: 'normal',
  provider: 'elevenlabs',
  voiceId: 'adam',
};

const PAUSE_AFTER_CHAPTER_INTRO = 0.5;
const PAUSE_BETWEEN_SCENES = 0.2;
const WORDS_PER_MINUTE_SLOW = 110;
const WORDS_PER_MINUTE_NORMAL = 140;
const WORDS_PER_MINUTE_FAST = 170;

export class NarratorRegistry {
  private readonly narrators = new Map<string, NarratorProfile>();

  register(narrator: NarratorProfile): void {
    this.narrators.set(narrator.id, narrator);
  }

  resolve(narratorId: string): NarratorProfile {
    return this.narrators.get(narratorId) ?? DEFAULT_NARRATOR;
  }

  listForLanguage(language: string): NarratorProfile[] {
    return [...this.narrators.values()].filter((n) => n.language === language);
  }
}

export class PronunciationDictionary {
  private readonly entries: PronunciationEntry[] = [];

  add(word: string, phoneme: string): void {
    this.entries.push({ word, phoneme });
  }

  lookup(text: string): PronunciationEntry[] {
    const lower = text.toLowerCase();
    return this.entries.filter((entry) => lower.includes(entry.word.toLowerCase()));
  }
}

export class SsmlBuilder {
  build(text: string, emotion: TTSEmotion, pacing: TTSPacing, pronunciations: PronunciationEntry[]): string {
    let processedText = text;
    for (const p of pronunciations) {
      const regex = new RegExp(`\\b${p.word}\\b`, 'gi');
      processedText = processedText.replace(regex, `<phoneme alphabet="ipa" ph="${p.phoneme}">${p.word}</phoneme>`);
    }

    const rate = this.pacingToRate(pacing);
    const pitch = this.emotionToPitch(emotion);

    return `<speak><prosody rate="${rate}" pitch="${pitch}">${processedText}</prosody></speak>`;
  }

  private pacingToRate(pacing: TTSPacing): string {
    const rates: Record<TTSPacing, string> = { slow: 'slow', normal: 'medium', fast: 'fast' };
    return rates[pacing];
  }

  private emotionToPitch(emotion: TTSEmotion): string {
    const pitches: Record<TTSEmotion, string> = {
      neutral: 'medium',
      excited: 'high',
      serious: 'low',
      empathetic: 'medium',
      inspirational: '+5%',
      dramatic: '-10%',
    };
    return pitches[emotion];
  }
}

export class VoiceDirector {
  constructor(
    private readonly registry: NarratorRegistry,
    private readonly dictionary: PronunciationDictionary,
    private readonly ssmlBuilder: SsmlBuilder,
  ) {}

  createDirectives(
    scenes: ScenePlan[],
    chapters: ChapterOutline[],
    request: DirectorRequest,
    narratorId = DEFAULT_NARRATOR.id,
  ): VoiceDirective[] {
    const chapterFirstSceneIds = new Set(
      chapters.map((chapter) => scenes.find((scene) => scene.chapterId === chapter.id)?.id).filter(Boolean),
    );

    return scenes.map((scene) => {
      const narrator = this.registry.resolve(narratorId);
      const isChapterOpener = chapterFirstSceneIds.has(scene.id);
      const emotion = this.resolveEmotion(request.tone, scene.sceneNumber);
      const pacing = this.resolvePacing(scene.durationSeconds, scene.narration);
      const pronunciations = this.dictionary.lookup(scene.narration);
      const ssml = this.ssmlBuilder.build(scene.narration, emotion, pacing, pronunciations);

      return {
        sceneId: scene.id,
        narratorId: narrator.id,
        text: scene.narration,
        emotion,
        pacing,
        pauseBeforeSeconds: isChapterOpener ? PAUSE_AFTER_CHAPTER_INTRO : PAUSE_BETWEEN_SCENES,
        pauseAfterSeconds: PAUSE_BETWEEN_SCENES,
        pronunciationOverrides: pronunciations,
        ssml,
      };
    });
  }

  private resolveEmotion(tone: string, sceneNumber: number): TTSEmotion {
    const toneMap: Record<string, TTSEmotion> = {
      inspirational: 'inspirational',
      dramatic: 'dramatic',
      serious: 'serious',
      educational: 'neutral',
      empathetic: 'empathetic',
      exciting: 'excited',
    };
    const mapped = toneMap[tone.toLowerCase()];
    if (mapped) return mapped;
    return sceneNumber % 4 === 0 ? 'excited' : 'neutral';
  }

  private resolvePacing(durationSeconds: number, narration: string): TTSPacing {
    const wordCount = narration.split(' ').filter((w) => w.length > 0).length;
    const wpm = (wordCount / durationSeconds) * 60;

    if (wpm < WORDS_PER_MINUTE_SLOW) return 'slow';
    if (wpm > WORDS_PER_MINUTE_FAST) return 'fast';
    return 'normal';
  }
}

export class NarrationRenderer {
  render(directive: VoiceDirective): RenderedNarration {
    const wordCount = directive.text.split(' ').filter((w) => w.length > 0).length;
    const wpmMap: Record<TTSPacing, number> = {
      slow: WORDS_PER_MINUTE_SLOW,
      normal: WORDS_PER_MINUTE_NORMAL,
      fast: WORDS_PER_MINUTE_FAST,
    };
    const wpm = wpmMap[directive.pacing];
    const durationSeconds = (wordCount / wpm) * 60 + directive.pauseBeforeSeconds + directive.pauseAfterSeconds;

    return {
      sceneId: directive.sceneId,
      narratorId: directive.narratorId,
      audioPath: `narration/${directive.sceneId}.mp3`,
      durationSeconds,
      language: 'en',
    };
  }

  renderBatch(directives: VoiceDirective[]): RenderedNarration[] {
    return directives.map((directive) => this.render(directive));
  }
}

export class VoiceStudio {
  constructor(
    readonly registry: NarratorRegistry,
    readonly dictionary: PronunciationDictionary,
    private readonly director: VoiceDirector,
    private readonly renderer: NarrationRenderer,
  ) {}

  produce(
    scenes: ScenePlan[],
    chapters: ChapterOutline[],
    request: DirectorRequest,
    narratorId?: string,
  ): RenderedNarration[] {
    const directives = this.director.createDirectives(scenes, chapters, request, narratorId);
    return this.renderer.renderBatch(directives);
  }

  static createDefault(): VoiceStudio {
    const registry = new NarratorRegistry();
    registry.register(DEFAULT_NARRATOR);
    const dictionary = new PronunciationDictionary();
    const ssmlBuilder = new SsmlBuilder();
    const director = new VoiceDirector(registry, dictionary, ssmlBuilder);
    const renderer = new NarrationRenderer();
    return new VoiceStudio(registry, dictionary, director, renderer);
  }
}
