import type { OutlineSection, ValidatedFact } from './ResearchEngine';
import type { GeneratedScript } from './ScriptEngine';
import { TitleGenerator } from './TitleGenerator';
import { DescriptionGenerator } from './DescriptionGenerator';
import { KeywordGenerator } from './KeywordGenerator';
import { TagGenerator } from './TagGenerator';
import { ThumbnailPromptGenerator } from './ThumbnailPromptGenerator';

export interface SeoMetadataPackage {
  title: string;
  description: string;
  keywords: string[];
  tags: string[];
  hashtags: string[];
  chapters: string[];
  thumbnailPrompt: string;
}

export class SEOEngine {
  constructor(
    private readonly titleGenerator = new TitleGenerator(),
    private readonly descriptionGenerator = new DescriptionGenerator(),
    private readonly keywordGenerator = new KeywordGenerator(),
    private readonly tagGenerator = new TagGenerator(),
    private readonly thumbnailPromptGenerator = new ThumbnailPromptGenerator(),
  ) {}

  generate(
    topic: string,
    outline: OutlineSection[],
    facts: ValidatedFact[],
    script: GeneratedScript,
    tonePreset: string,
  ): SeoMetadataPackage {
    const keywords = this.keywordGenerator.generate(topic, facts);
    const tags = this.tagGenerator.generate(keywords);
    const chapters = outline
      .filter((section) => section.kind === 'chapter')
      .map((section) => section.title)
      .slice(0, 12);
    const title = this.titleGenerator.generate(topic, outline);
    const description = this.descriptionGenerator.generate(topic, outline, script);

    return {
      title,
      description,
      keywords,
      tags,
      hashtags: tags.slice(0, 8).map((tag) => `#${tag}`),
      chapters,
      thumbnailPrompt: this.thumbnailPromptGenerator.generate(topic, tonePreset, keywords),
    };
  }
}
