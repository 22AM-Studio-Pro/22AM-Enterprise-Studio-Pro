import { TranslationManager, SupportedLanguage } from './TranslationManager';

export interface LocalizedNarration {
  sceneId: string;
  language: SupportedLanguage;
  text: string;
  voiceId: string;
}

const LANGUAGE_VOICE_IDS: Record<SupportedLanguage, string> = {
  en: 'en-adam', es: 'es-sofia', fr: 'fr-pierre', de: 'de-hans',
  it: 'it-marco', pt: 'pt-camila', hi: 'hi-aarav', ar: 'ar-ali',
  ja: 'ja-kenji', zh: 'zh-wei', ko: 'ko-jiyeon', ru: 'ru-dmitry',
};

export class NarrationLocalizer {
  constructor(private readonly translator: TranslationManager) {}

  async localize(
    narrations: Record<string, string>,
    sourceLanguage: SupportedLanguage,
    targetLanguage: SupportedLanguage,
  ): Promise<LocalizedNarration[]> {
    const sceneIds = Object.keys(narrations);
    const texts = Object.values(narrations);
    const results = await this.translator.translateBatch(texts, sourceLanguage, targetLanguage);

    return sceneIds.map((sceneId, i) => ({
      sceneId,
      language: targetLanguage,
      text: results[i].translated,
      voiceId: LANGUAGE_VOICE_IDS[targetLanguage],
    }));
  }
}
