export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'hi' | 'ar' | 'ja' | 'zh' | 'ko' | 'ru';

export interface TranslationRequest {
  text: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  context?: string;
}

export interface TranslationResult {
  original: string;
  translated: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  confidence: number;
}

export interface TranslationProvider {
  name: string;
  supportedLanguages: SupportedLanguage[];
  translate(request: TranslationRequest): Promise<TranslationResult>;
}

class MockTranslationProvider implements TranslationProvider {
  name = 'mock';
  supportedLanguages: SupportedLanguage[] = ['en', 'es', 'fr', 'de', 'it', 'pt', 'hi', 'ar', 'ja', 'zh', 'ko', 'ru'];

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    return {
      original: request.text,
      translated: `[${request.targetLanguage.toUpperCase()}] ${request.text}`,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      confidence: 0.95,
    };
  }
}

export class TranslationManager {
  private readonly providers: TranslationProvider[] = [new MockTranslationProvider()];

  registerProvider(provider: TranslationProvider): void {
    this.providers.unshift(provider);
  }

  private selectProvider(targetLanguage: SupportedLanguage): TranslationProvider {
    return this.providers.find((p) => p.supportedLanguages.includes(targetLanguage)) ?? this.providers[0];
  }

  async translate(text: string, from: SupportedLanguage, to: SupportedLanguage): Promise<TranslationResult> {
    const provider = this.selectProvider(to);
    return provider.translate({ text, sourceLanguage: from, targetLanguage: to });
  }

  async translateBatch(texts: string[], from: SupportedLanguage, to: SupportedLanguage): Promise<TranslationResult[]> {
    return Promise.all(texts.map((t) => this.translate(t, from, to)));
  }

  async translateMap(map: Record<string, string>, from: SupportedLanguage, to: SupportedLanguage): Promise<Record<string, string>> {
    const keys = Object.keys(map);
    const results = await this.translateBatch(Object.values(map), from, to);
    return Object.fromEntries(keys.map((k, i) => [k, results[i].translated]));
  }
}
