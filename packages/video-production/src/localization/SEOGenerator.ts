import { SupportedLanguage } from './TranslationManager';

export interface SeoPackage {
  language: SupportedLanguage;
  primaryKeyword: string;
  secondaryKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  slug: string;
  hashtags: string[];
  youtubeTitle: string;
  youtubeDescription: string;
  youtubeTags: string[];
}

export class SEOGenerator {
  generate(
    topic: string,
    localizedTitle: string,
    localizedDescription: string,
    language: SupportedLanguage,
    tags: string[],
  ): SeoPackage {
    const slug = localizedTitle.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 60);
    const hashtags = [topic, ...tags.slice(0, 5)].map((t) => `#${t.replace(/\s+/g, '')}`);

    return {
      language,
      primaryKeyword: `${topic} ${language}`,
      secondaryKeywords: tags.map((t) => `${t} ${language}`),
      metaTitle: `${localizedTitle} | ${topic}`,
      metaDescription: localizedDescription.slice(0, 160),
      slug,
      hashtags,
      youtubeTitle: localizedTitle.slice(0, 100),
      youtubeDescription: `${localizedDescription}\n\n${hashtags.join(' ')}`,
      youtubeTags: [...tags, topic, language].slice(0, 15),
    };
  }

  generateBatch(
    topic: string,
    titles: Record<SupportedLanguage, string>,
    descriptions: Record<SupportedLanguage, string>,
    tags: string[],
  ): SeoPackage[] {
    return (Object.keys(titles) as SupportedLanguage[]).map((lang) =>
      this.generate(topic, titles[lang], descriptions[lang], lang, tags),
    );
  }
}
