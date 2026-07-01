export type VoiceProviderName = 'elevenlabs' | 'openai' | 'google' | 'murf' | 'playht' | 'azure';

export interface VoiceSynthesisOptions {
  voiceId: string;
  language: string;
  emotion?: string;
  speakingRate?: number;
  pitch?: number;
  volumeGainDb?: number;
  ssml?: boolean;
  streaming?: boolean;
}

export interface AudioBuffer {
  data: Uint8Array;
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  format: 'mp3' | 'wav' | 'ogg' | 'opus';
  sizeBytes: number;
}

export interface StreamChunk {
  index: number;
  data: Uint8Array;
  final: boolean;
}

export interface VoiceProviderCapabilities {
  streaming: boolean;
  ssml: boolean;
  voiceCloning: boolean;
  emotionControl: boolean;
  languageCodes: string[];
  maxCharsPerRequest: number;
}

export interface IVoiceProvider {
  readonly name: VoiceProviderName;
  readonly capabilities: VoiceProviderCapabilities;
  synthesize(text: string, options: VoiceSynthesisOptions): Promise<AudioBuffer>;
  synthesizeStream(text: string, options: VoiceSynthesisOptions): AsyncIterable<StreamChunk>;
  listVoices(language?: string): Promise<VoiceInfo[]>;
}

export interface VoiceInfo {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  provider: VoiceProviderName;
  supportsCloning: boolean;
  tags: string[];
}

function buildMockBuffer(text: string, rate: number): AudioBuffer {
  const wordCount = text.split(' ').filter((w) => w.length > 0).length;
  const durationSeconds = (wordCount / rate) * 60;
  return {
    data: new Uint8Array(0),
    durationSeconds,
    sampleRate: 44100,
    channels: 1,
    format: 'mp3',
    sizeBytes: Math.round(durationSeconds * 16000),
  };
}

async function* emptyStream(): AsyncIterable<StreamChunk> {
  yield { index: 0, data: new Uint8Array(0), final: true };
}

export class ElevenLabsProvider implements IVoiceProvider {
  readonly name: VoiceProviderName = 'elevenlabs';
  readonly capabilities: VoiceProviderCapabilities = {
    streaming: true,
    ssml: false,
    voiceCloning: true,
    emotionControl: true,
    languageCodes: ['en', 'es', 'fr', 'de', 'hi', 'ar', 'ja', 'pt', 'zh', 'ko', 'it', 'ru', 'nl', 'tr', 'pl'],
    maxCharsPerRequest: 5000,
  };

  async synthesize(text: string, options: VoiceSynthesisOptions): Promise<AudioBuffer> {
    const rate = options.speakingRate ?? 140;
    return buildMockBuffer(text, rate);
  }

  async *synthesizeStream(text: string, options: VoiceSynthesisOptions): AsyncIterable<StreamChunk> {
    const buffer = await this.synthesize(text, options);
    yield { index: 0, data: buffer.data, final: true };
  }

  async listVoices(language = 'en'): Promise<VoiceInfo[]> {
    return [
      { id: 'adam', name: 'Adam', language, gender: 'male', provider: 'elevenlabs', supportsCloning: true, tags: ['deep', 'narration'] },
      { id: 'rachel', name: 'Rachel', language, gender: 'female', provider: 'elevenlabs', supportsCloning: true, tags: ['warm', 'conversational'] },
    ];
  }
}

export class OpenAITTSProvider implements IVoiceProvider {
  readonly name: VoiceProviderName = 'openai';
  readonly capabilities: VoiceProviderCapabilities = {
    streaming: true,
    ssml: false,
    voiceCloning: false,
    emotionControl: false,
    languageCodes: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ko'],
    maxCharsPerRequest: 4096,
  };

  async synthesize(text: string, options: VoiceSynthesisOptions): Promise<AudioBuffer> {
    return buildMockBuffer(text, options.speakingRate ?? 150);
  }

  async *synthesizeStream(text: string, options: VoiceSynthesisOptions): AsyncIterable<StreamChunk> {
    const buffer = await this.synthesize(text, options);
    yield { index: 0, data: buffer.data, final: true };
  }

  async listVoices(): Promise<VoiceInfo[]> {
    return [
      { id: 'alloy', name: 'Alloy', language: 'en', gender: 'neutral', provider: 'openai', supportsCloning: false, tags: ['neutral'] },
      { id: 'nova', name: 'Nova', language: 'en', gender: 'female', provider: 'openai', supportsCloning: false, tags: ['bright'] },
    ];
  }
}

export class GoogleTTSProvider implements IVoiceProvider {
  readonly name: VoiceProviderName = 'google';
  readonly capabilities: VoiceProviderCapabilities = {
    streaming: false,
    ssml: true,
    voiceCloning: false,
    emotionControl: false,
    languageCodes: ['en', 'es', 'fr', 'de', 'hi', 'ar', 'ja', 'pt', 'zh', 'ko', 'it', 'ru', 'nl', 'tr', 'pl'],
    maxCharsPerRequest: 5000,
  };

  async synthesize(text: string, options: VoiceSynthesisOptions): Promise<AudioBuffer> {
    return buildMockBuffer(text, options.speakingRate ?? 140);
  }

  async *synthesizeStream(_text: string, _options: VoiceSynthesisOptions): AsyncIterable<StreamChunk> {
    yield* emptyStream();
  }

  async listVoices(language = 'en'): Promise<VoiceInfo[]> {
    return [
      { id: `${language}-Standard-A`, name: 'Standard A', language, gender: 'female', provider: 'google', supportsCloning: false, tags: ['standard'] },
      { id: `${language}-WaveNet-A`, name: 'WaveNet A', language, gender: 'female', provider: 'google', supportsCloning: false, tags: ['wavenet', 'natural'] },
    ];
  }
}

export class MurfProvider implements IVoiceProvider {
  readonly name: VoiceProviderName = 'murf';
  readonly capabilities: VoiceProviderCapabilities = {
    streaming: false,
    ssml: true,
    voiceCloning: true,
    emotionControl: true,
    languageCodes: ['en', 'es', 'fr', 'de', 'hi', 'it', 'pt'],
    maxCharsPerRequest: 3000,
  };

  async synthesize(text: string, options: VoiceSynthesisOptions): Promise<AudioBuffer> {
    return buildMockBuffer(text, options.speakingRate ?? 135);
  }

  async *synthesizeStream(_text: string, _options: VoiceSynthesisOptions): AsyncIterable<StreamChunk> {
    yield* emptyStream();
  }

  async listVoices(language = 'en'): Promise<VoiceInfo[]> {
    return [
      { id: `murf-${language}-professional`, name: 'Professional', language, gender: 'male', provider: 'murf', supportsCloning: true, tags: ['professional'] },
    ];
  }
}

export class PlayHTProvider implements IVoiceProvider {
  readonly name: VoiceProviderName = 'playht';
  readonly capabilities: VoiceProviderCapabilities = {
    streaming: true,
    ssml: true,
    voiceCloning: true,
    emotionControl: false,
    languageCodes: ['en', 'es', 'fr', 'de', 'hi', 'pt', 'ar'],
    maxCharsPerRequest: 4000,
  };

  async synthesize(text: string, options: VoiceSynthesisOptions): Promise<AudioBuffer> {
    return buildMockBuffer(text, options.speakingRate ?? 140);
  }

  async *synthesizeStream(text: string, options: VoiceSynthesisOptions): AsyncIterable<StreamChunk> {
    const buffer = await this.synthesize(text, options);
    yield { index: 0, data: buffer.data, final: true };
  }

  async listVoices(language = 'en'): Promise<VoiceInfo[]> {
    return [
      { id: `playht-${language}-01`, name: 'PlayHT Voice 01', language, gender: 'neutral', provider: 'playht', supportsCloning: true, tags: ['versatile'] },
    ];
  }
}
