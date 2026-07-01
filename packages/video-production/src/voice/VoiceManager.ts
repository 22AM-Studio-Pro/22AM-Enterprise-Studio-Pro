import {
  IVoiceProvider,
  VoiceProviderName,
  VoiceSynthesisOptions,
  AudioBuffer,
  StreamChunk,
  VoiceInfo,
  ElevenLabsProvider,
  OpenAITTSProvider,
  GoogleTTSProvider,
  MurfProvider,
  PlayHTProvider,
} from './VoiceProvider';

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY: RetryOptions = { maxAttempts: 3, baseDelayMs: 200, maxDelayMs: 2000 };

async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = DEFAULT_RETRY): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < opts.maxAttempts - 1) {
        const delay = Math.min(opts.baseDelayMs * 2 ** attempt, opts.maxDelayMs);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

export class VoiceManager {
  private readonly providers = new Map<VoiceProviderName, IVoiceProvider>();
  private primaryProvider: VoiceProviderName = 'elevenlabs';
  private fallbackChain: VoiceProviderName[] = ['openai', 'google'];
  private readonly retryOptions: RetryOptions;

  constructor(retryOptions: RetryOptions = DEFAULT_RETRY) {
    this.retryOptions = retryOptions;
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.register(new ElevenLabsProvider());
    this.register(new OpenAITTSProvider());
    this.register(new GoogleTTSProvider());
    this.register(new MurfProvider());
    this.register(new PlayHTProvider());
  }

  register(provider: IVoiceProvider): void {
    this.providers.set(provider.name, provider);
  }

  setPrimary(name: VoiceProviderName): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider "${name}" is not registered`);
    }
    this.primaryProvider = name;
  }

  setFallbackChain(names: VoiceProviderName[]): void {
    this.fallbackChain = names.filter((n) => this.providers.has(n));
  }

  resolve(name?: VoiceProviderName): IVoiceProvider {
    const target = name ?? this.primaryProvider;
    const provider = this.providers.get(target);
    if (!provider) throw new Error(`Provider "${target}" is not registered`);
    return provider;
  }

  async synthesize(text: string, options: VoiceSynthesisOptions, providerName?: VoiceProviderName): Promise<AudioBuffer> {
    const chain = [providerName ?? this.primaryProvider, ...this.fallbackChain].filter(Boolean) as VoiceProviderName[];

    for (const name of chain) {
      const provider = this.providers.get(name);
      if (!provider) continue;
      try {
        return await withRetry(() => provider.synthesize(text, options), this.retryOptions);
      } catch {
        // try next in fallback chain
      }
    }
    throw new Error('All voice providers failed');
  }

  async *synthesizeStream(text: string, options: VoiceSynthesisOptions, providerName?: VoiceProviderName): AsyncIterable<StreamChunk> {
    const name = providerName ?? this.primaryProvider;
    const provider = this.resolve(name);
    if (!provider.capabilities.streaming) {
      const buffer = await this.synthesize(text, options, name);
      yield { index: 0, data: buffer.data, final: true };
      return;
    }
    yield* provider.synthesizeStream(text, options);
  }

  async listVoices(language?: string, providerName?: VoiceProviderName): Promise<VoiceInfo[]> {
    if (providerName) {
      return this.resolve(providerName).listVoices(language);
    }
    const results = await Promise.all([...this.providers.values()].map((p) => p.listVoices(language)));
    return results.flat();
  }

  selectProviderForLanguage(language: string): VoiceProviderName {
    for (const provider of this.providers.values()) {
      if (provider.capabilities.languageCodes.includes(language)) {
        return provider.name;
      }
    }
    return this.primaryProvider;
  }
}
