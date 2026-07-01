import { describe, it, expect, beforeEach } from 'vitest';
import { VoiceManager } from '../voice/VoiceManager';
import { EmotionController } from '../voice/EmotionController';
import { SpeechPacing } from '../voice/SpeechPacing';
import { VoiceStudio } from '../voice/VoiceStudio';
import { VoiceTimeline } from '../voice/VoiceTimeline';
import { VoiceNormalizer } from '../voice/VoiceNormalizer';
import { PronunciationDictionary } from '../voice/PronunciationDictionary';

describe('VoiceManager', () => {
  let manager: VoiceManager;

  beforeEach(() => {
    manager = new VoiceManager();
  });

  it('resolves the default elevenlabs provider', () => {
    const provider = manager.resolve('elevenlabs');
    expect(provider.name).toBe('elevenlabs');
  });

  it('selects a provider for a given language', () => {
    const name = manager.selectProviderForLanguage('en');
    expect(typeof name).toBe('string');
  });

  it('synthesizes audio and returns a buffer with duration > 0', async () => {
    const buffer = await manager.synthesize('Hello world. This is a test narration.', {
      voiceId: 'adam',
      language: 'en',
    });
    expect(buffer.durationSeconds).toBeGreaterThan(0);
    expect(buffer.format).toBe('mp3');
  });

  it('falls back to next provider when primary fails', async () => {
    manager.setPrimary('elevenlabs');
    manager.setFallbackChain(['openai', 'google']);
    const buffer = await manager.synthesize('Test narration text.', { voiceId: 'adam', language: 'en' });
    expect(buffer.durationSeconds).toBeGreaterThan(0);
  });

  it('lists voices for a language', async () => {
    const voices = await manager.listVoices('en', 'elevenlabs');
    expect(voices.length).toBeGreaterThan(0);
    expect(voices[0].language).toBe('en');
  });
});

describe('EmotionController', () => {
  let controller: EmotionController;

  beforeEach(() => {
    controller = new EmotionController();
  });

  it('detects emotion from tone string', () => {
    expect(controller.detectFromTone('dramatic')).toBe('dramatic');
    expect(controller.detectFromTone('inspirational')).toBe('inspirational');
    expect(controller.detectFromTone('unknown')).toBe('neutral');
  });

  it('detects emotion from text keywords', () => {
    const emotion = controller.detectFromText('This is an amazing and incredible event!');
    expect(emotion).toBe('excited');
  });

  it('builds SSML emotion wrapper', () => {
    const ssml = controller.buildSsmlEmotion('Hello world', 'dramatic');
    expect(ssml).toContain('<prosody');
    expect(ssml).toContain('Hello world');
  });

  it('returns neutral for unrecognized tone', () => {
    expect(controller.detectFromTone('xyz')).toBe('neutral');
  });
});

describe('SpeechPacing', () => {
  let pacing: SpeechPacing;

  beforeEach(() => {
    pacing = new SpeechPacing();
  });

  it('estimates duration for a given text and preset', () => {
    const duration = pacing.estimateDuration('Hello world this is a test with ten words here okay', 'normal');
    expect(duration).toBeGreaterThan(0);
  });

  it('processes text and wraps in speak tags', () => {
    const result = pacing.processText('Hello. World.', { preset: 'normal' });
    expect(result.ssmlText).toContain('<speak>');
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.estimatedDurationSeconds).toBeGreaterThan(0);
  });

  it('fits pacing to target duration', () => {
    const opts = pacing.fitToTarget('Word '.repeat(100).trim(), 60);
    expect(opts.wordsPerMinute).toBeGreaterThan(0);
  });

  it('injects emphasis pauses for keywords', () => {
    const result = pacing.addEmphasisPauses('<speak>amazing product</speak>', ['amazing']);
    expect(result).toContain('<break time=');
  });
});

describe('VoiceStudio integration', () => {
  it('renders a batch of scenes', async () => {
    const studio = VoiceStudio.createDefault();
    const scenes = [
      { sceneId: 'scene-1', chapterId: 'ch-1', narration: 'Welcome to this video about history.', tone: 'neutral', language: 'en', durationSeconds: 10, startTimeSeconds: 0 },
      { sceneId: 'scene-2', chapterId: 'ch-1', narration: 'Today we explore ancient civilizations.', tone: 'dramatic', language: 'en', durationSeconds: 12, startTimeSeconds: 10 },
    ];
    const result = await studio.renderBatch(scenes, { useCache: false, normalize: false });
    expect(result.renderedScenes).toHaveLength(2);
    expect(result.subtitleTrack.lines.length).toBeGreaterThan(0);
    expect(result.totalDurationSeconds).toBeGreaterThan(0);
  });

  it('creates a default studio instance', () => {
    const studio = VoiceStudio.createDefault();
    expect(studio).toBeInstanceOf(VoiceStudio);
  });
});

describe('VoiceTimeline', () => {
  it('builds timeline with correct chapter sync points', () => {
    const timeline = new VoiceTimeline();
    const scenes = [
      { id: 's1', chapterId: 'ch1', durationSeconds: 10 },
      { id: 's2', chapterId: 'ch1', durationSeconds: 8 },
      { id: 's3', chapterId: 'ch2', durationSeconds: 12 },
    ];
    const result = timeline.build(scenes, 'en');
    expect(result.entries).toHaveLength(3);
    expect(result.chapterSyncPoints).toHaveLength(2);
    expect(result.totalDurationSeconds).toBe(30);
  });

  it('uses provided startTimeSeconds', () => {
    const timeline = new VoiceTimeline();
    const scenes = [
      { id: 's1', chapterId: 'ch1', durationSeconds: 10, startTimeSeconds: 5 },
    ];
    const result = timeline.build(scenes, 'en');
    expect(result.entries[0].startTimeSeconds).toBe(5);
  });
});

describe('PronunciationDictionary', () => {
  it('finds entries in text', () => {
    const dict = new PronunciationDictionary();
    const entries = dict.findInText('The AI model uses an API');
    expect(entries.some((e) => e.word === 'AI')).toBe(true);
    expect(entries.some((e) => e.word === 'API')).toBe(true);
  });

  it('applies phonemes to SSML', () => {
    const dict = new PronunciationDictionary();
    const result = dict.applyToSsml('<speak>The AI API</speak>');
    expect(result).toContain('<phoneme');
  });

  it('supports custom entries', () => {
    const dict = new PronunciationDictionary();
    dict.add('Kubernetes', 'kjuːbərˈneɪtɪs');
    expect(dict.lookup('kubernetes')?.phoneme).toBe('kjuːbərˈneɪtɪs');
  });
});

describe('VoiceNormalizer', () => {
  it('returns a buffer unchanged in duration', () => {
    const norm = new VoiceNormalizer();
    const mockBuffer = { data: new Uint8Array(0), durationSeconds: 5, sampleRate: 44100, channels: 1, format: 'mp3' as const, sizeBytes: 80000 };
    const result = norm.normalize(mockBuffer);
    expect(result.durationSeconds).toBe(5);
  });

  it('builds correct ffmpeg args', () => {
    const norm = new VoiceNormalizer();
    const args = norm.buildFfmpegArgs('in.mp3', 'out.mp3');
    expect(args).toContain('-i');
    const filterFlagIndex = args.indexOf('-af');
    expect(filterFlagIndex).toBeGreaterThan(-1);
    expect(args[filterFlagIndex + 1]).toContain('loudnorm=');
    expect(args[args.length - 1]).toBe('out.mp3');
  });
});
