import { TranslationManager, SupportedLanguage } from './TranslationManager';
import { LocalizationManager } from './LocalizationManager';
import { NarrationLocalizer, LocalizedNarration } from './NarrationLocalizer';
import { SubtitleLocalizer, LocalizedSubtitleTrack, SubtitleLine } from './SubtitleLocalizer';
import { MetadataLocalizer, LocalizedMetadata } from './MetadataLocalizer';
import { SEOGenerator, SeoPackage } from './SEOGenerator';

export interface LanguagePipelineInput {
  topic: string;
  sourceLanguage: SupportedLanguage;
  targetLanguages: SupportedLanguage[];
  narrations: Record<string, string>;
  subtitleLines: SubtitleLine[];
  title: string;
  description: string;
  tags: string[];
  category: string;
}

export interface LocalizedVideoPackage {
  language: SupportedLanguage;
  narrations: LocalizedNarration[];
  subtitles: LocalizedSubtitleTrack;
  metadata: LocalizedMetadata;
  seo: SeoPackage;
}

export interface LanguagePipelineOutput {
  sourceLanguage: SupportedLanguage;
  packages: LocalizedVideoPackage[];
}

export class LanguagePipeline {
  constructor(
    private readonly translationManager: TranslationManager,
    private readonly narrationLocalizer: NarrationLocalizer,
    private readonly subtitleLocalizer: SubtitleLocalizer,
    private readonly metadataLocalizer: MetadataLocalizer,
    private readonly seoGenerator: SEOGenerator,
  ) {}

  async run(input: LanguagePipelineInput): Promise<LanguagePipelineOutput> {
    const packages = await Promise.all(
      input.targetLanguages.map((lang) => this.processLanguage(input, lang)),
    );

    return { sourceLanguage: input.sourceLanguage, packages };
  }

  private async processLanguage(
    input: LanguagePipelineInput,
    targetLanguage: SupportedLanguage,
  ): Promise<LocalizedVideoPackage> {
    const [narrations, metadata] = await Promise.all([
      this.narrationLocalizer.localize(input.narrations, input.sourceLanguage, targetLanguage),
      this.metadataLocalizer.localize(input.title, input.description, input.tags, input.category, input.sourceLanguage, targetLanguage),
    ]);

    const translatedTextsMap = await this.translationManager.translateBatch(
      input.subtitleLines.map((l) => l.text),
      input.sourceLanguage,
      targetLanguage,
    );
    const translatedMap = Object.fromEntries(input.subtitleLines.map((l, i) => [l.index, translatedTextsMap[i].translated]));
    const subtitles = this.subtitleLocalizer.localize(input.subtitleLines, translatedMap, targetLanguage);

    const seo = this.seoGenerator.generate(input.topic, metadata.title, metadata.description, targetLanguage, input.tags);

    return { language: targetLanguage, narrations, subtitles, metadata, seo };
  }

  static createDefault(): LanguagePipeline {
    const translator = new TranslationManager();
    return new LanguagePipeline(
      translator,
      new NarrationLocalizer(translator),
      new SubtitleLocalizer(new LocalizationManager()),
      new MetadataLocalizer(translator),
      new SEOGenerator(),
    );
  }
}
