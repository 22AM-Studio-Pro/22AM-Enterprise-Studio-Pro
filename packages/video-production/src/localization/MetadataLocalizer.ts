import { TranslationManager, SupportedLanguage } from './TranslationManager';

export interface LocalizedMetadata {
  language: SupportedLanguage;
  title: string;
  description: string;
  tags: string[];
  category: string;
}

export class MetadataLocalizer {
  constructor(private readonly translator: TranslationManager) {}

  async localize(
    title: string,
    description: string,
    tags: string[],
    category: string,
    sourceLanguage: SupportedLanguage,
    targetLanguage: SupportedLanguage,
  ): Promise<LocalizedMetadata> {
    const [titleResult, descResult, ...tagResults] = await Promise.all([
      this.translator.translate(title, sourceLanguage, targetLanguage),
      this.translator.translate(description, sourceLanguage, targetLanguage),
      ...tags.map((tag) => this.translator.translate(tag, sourceLanguage, targetLanguage)),
    ]);

    return {
      language: targetLanguage,
      title: titleResult.translated,
      description: descResult.translated,
      tags: tagResults.map((r) => r.translated),
      category,
    };
  }
}
