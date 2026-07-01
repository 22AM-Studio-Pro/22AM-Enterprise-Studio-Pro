import { DirectorRequest, DirectorOutput } from './DirectorContext';
import { ResearchResult } from './ResearchEngine';

export type SupportedLanguage =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'hi'
  | 'ar'
  | 'ja'
  | 'pt'
  | 'zh'
  | 'ko'
  | 'it'
  | 'ru'
  | 'nl'
  | 'tr'
  | 'pl';

export interface LanguageLocale {
  code: SupportedLanguage;
  name: string;
  rtl: boolean;
  defaultTtsVoiceId: string;
  fontFamily: string;
  subtitleCharLimit: number;
}

export interface LocalizedScript {
  language: SupportedLanguage;
  translatedNarrations: Record<string, string>;
}

export interface LocalizedSubtitles {
  language: SupportedLanguage;
  subtitleLines: Record<string, string[]>;
}

export interface LocalizedGraphics {
  language: SupportedLanguage;
  isRtl: boolean;
  fontFamily: string;
  titleLocalized: string;
  descriptionLocalized: string;
}

export interface LocalizedMetadata {
  language: SupportedLanguage;
  title: string;
  description: string;
  tags: string[];
  category: string;
}

export interface LocalizedSeo {
  language: SupportedLanguage;
  primaryKeyword: string;
  secondaryKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  slug: string;
}

export interface LocalizedVideoPackage {
  language: SupportedLanguage;
  baseRequest: DirectorRequest;
  localizedRequest: DirectorRequest;
  script: LocalizedScript;
  subtitles: LocalizedSubtitles;
  graphics: LocalizedGraphics;
  metadata: LocalizedMetadata;
  seo: LocalizedSeo;
}

export interface MultiLanguageFactoryOutput {
  baseLanguage: SupportedLanguage;
  packages: LocalizedVideoPackage[];
  totalLanguages: number;
}

const LANGUAGE_LOCALES: Record<SupportedLanguage, LanguageLocale> = {
  en: { code: 'en', name: 'English', rtl: false, defaultTtsVoiceId: 'en-us-adam', fontFamily: 'Inter', subtitleCharLimit: 80 },
  es: { code: 'es', name: 'Spanish', rtl: false, defaultTtsVoiceId: 'es-es-maria', fontFamily: 'Inter', subtitleCharLimit: 85 },
  fr: { code: 'fr', name: 'French', rtl: false, defaultTtsVoiceId: 'fr-fr-julie', fontFamily: 'Inter', subtitleCharLimit: 85 },
  de: { code: 'de', name: 'German', rtl: false, defaultTtsVoiceId: 'de-de-hans', fontFamily: 'Inter', subtitleCharLimit: 75 },
  hi: { code: 'hi', name: 'Hindi', rtl: false, defaultTtsVoiceId: 'hi-in-aarav', fontFamily: 'Noto Sans Devanagari', subtitleCharLimit: 60 },
  ar: { code: 'ar', name: 'Arabic', rtl: true, defaultTtsVoiceId: 'ar-ae-ali', fontFamily: 'Noto Sans Arabic', subtitleCharLimit: 60 },
  ja: { code: 'ja', name: 'Japanese', rtl: false, defaultTtsVoiceId: 'ja-jp-kenji', fontFamily: 'Noto Sans JP', subtitleCharLimit: 30 },
  pt: { code: 'pt', name: 'Portuguese', rtl: false, defaultTtsVoiceId: 'pt-br-camila', fontFamily: 'Inter', subtitleCharLimit: 85 },
  zh: { code: 'zh', name: 'Chinese', rtl: false, defaultTtsVoiceId: 'zh-cn-wei', fontFamily: 'Noto Sans SC', subtitleCharLimit: 25 },
  ko: { code: 'ko', name: 'Korean', rtl: false, defaultTtsVoiceId: 'ko-kr-jiyeon', fontFamily: 'Noto Sans KR', subtitleCharLimit: 30 },
  it: { code: 'it', name: 'Italian', rtl: false, defaultTtsVoiceId: 'it-it-marco', fontFamily: 'Inter', subtitleCharLimit: 85 },
  ru: { code: 'ru', name: 'Russian', rtl: false, defaultTtsVoiceId: 'ru-ru-dmitry', fontFamily: 'Inter', subtitleCharLimit: 70 },
  nl: { code: 'nl', name: 'Dutch', rtl: false, defaultTtsVoiceId: 'nl-nl-emma', fontFamily: 'Inter', subtitleCharLimit: 80 },
  tr: { code: 'tr', name: 'Turkish', rtl: false, defaultTtsVoiceId: 'tr-tr-ali', fontFamily: 'Inter', subtitleCharLimit: 80 },
  pl: { code: 'pl', name: 'Polish', rtl: false, defaultTtsVoiceId: 'pl-pl-zofia', fontFamily: 'Inter', subtitleCharLimit: 75 },
};

export class ScriptTranslator {
  translate(narrations: Record<string, string>, targetLanguage: SupportedLanguage): LocalizedScript {
    const translated: Record<string, string> = {};

    for (const [sceneId, text] of Object.entries(narrations)) {
      translated[sceneId] = `[${targetLanguage.toUpperCase()}] ${text}`;
    }

    return {
      language: targetLanguage,
      translatedNarrations: translated,
    };
  }
}

export class SubtitleLocalizer {
  localize(subtitles: Record<string, string[]>, targetLanguage: SupportedLanguage): LocalizedSubtitles {
    const locale = LANGUAGE_LOCALES[targetLanguage];
    const localized: Record<string, string[]> = {};

    for (const [sceneId, lines] of Object.entries(subtitles)) {
      localized[sceneId] = lines.map((line) =>
        line.length > locale.subtitleCharLimit ? `[${targetLanguage.toUpperCase()}] ${line.slice(0, locale.subtitleCharLimit)}` : `[${targetLanguage.toUpperCase()}] ${line}`,
      );
    }

    return {
      language: targetLanguage,
      subtitleLines: localized,
    };
  }
}

export class GraphicsLocalizer {
  localize(title: string, description: string, targetLanguage: SupportedLanguage): LocalizedGraphics {
    const locale = LANGUAGE_LOCALES[targetLanguage];

    return {
      language: targetLanguage,
      isRtl: locale.rtl,
      fontFamily: locale.fontFamily,
      titleLocalized: `[${locale.name}] ${title}`,
      descriptionLocalized: `[${locale.name}] ${description}`,
    };
  }
}

export class MetadataLocalizer {
  localize(
    title: string,
    description: string,
    tags: string[],
    category: string,
    targetLanguage: SupportedLanguage,
  ): LocalizedMetadata {
    const locale = LANGUAGE_LOCALES[targetLanguage];
    return {
      language: targetLanguage,
      title: `[${locale.name}] ${title}`,
      description: `[${locale.name}] ${description}`,
      tags: tags.map((tag) => `${tag}-${targetLanguage}`),
      category,
    };
  }
}

export class SeoLocalizer {
  localize(topic: string, tags: string[], targetLanguage: SupportedLanguage): LocalizedSeo {
    const locale = LANGUAGE_LOCALES[targetLanguage];
    const slug = topic.toLowerCase().replace(/\s+/g, '-') + `-${targetLanguage}`;

    return {
      language: targetLanguage,
      primaryKeyword: `${topic} ${locale.name}`,
      secondaryKeywords: tags.map((tag) => `${tag} ${locale.name}`),
      metaTitle: `[${locale.name}] ${topic}`,
      metaDescription: `[${locale.name}] Learn about ${topic} in ${locale.name}. Comprehensive guide.`,
      slug,
    };
  }
}

export class MultiLanguageFactory {
  constructor(
    private readonly scriptTranslator: ScriptTranslator,
    private readonly subtitleLocalizer: SubtitleLocalizer,
    private readonly graphicsLocalizer: GraphicsLocalizer,
    private readonly metadataLocalizer: MetadataLocalizer,
    private readonly seoLocalizer: SeoLocalizer,
  ) {}

  produce(
    baseRequest: DirectorRequest,
    directorOutput: DirectorOutput,
    researchResult: ResearchResult,
    targetLanguages: SupportedLanguage[],
  ): MultiLanguageFactoryOutput {
    const baseLanguage = (baseRequest.language ?? 'en') as SupportedLanguage;

    const narrationMap: Record<string, string> = {};
    const subtitleMap: Record<string, string[]> = {};
    for (const scene of directorOutput.storyboard.scenes) {
      narrationMap[scene.id] = scene.narration;
      subtitleMap[scene.id] = scene.subtitles;
    }

    const tags = researchResult.plan.searchQueries.map((q) => q.split(' ')[0]);

    const packages: LocalizedVideoPackage[] = targetLanguages.map((lang) => {
      const localizedRequest: DirectorRequest = { ...baseRequest, language: lang };
      const script = this.scriptTranslator.translate(narrationMap, lang);
      const subtitles = this.subtitleLocalizer.localize(subtitleMap, lang);
      const graphics = this.graphicsLocalizer.localize(baseRequest.topic, baseRequest.goal, lang);
      const metadata = this.metadataLocalizer.localize(baseRequest.topic, baseRequest.goal, tags, baseRequest.goal, lang);
      const seo = this.seoLocalizer.localize(baseRequest.topic, tags, lang);

      return {
        language: lang,
        baseRequest,
        localizedRequest,
        script,
        subtitles,
        graphics,
        metadata,
        seo,
      };
    });

    return {
      baseLanguage,
      packages,
      totalLanguages: packages.length,
    };
  }

  static createDefault(): MultiLanguageFactory {
    return new MultiLanguageFactory(
      new ScriptTranslator(),
      new SubtitleLocalizer(),
      new GraphicsLocalizer(),
      new MetadataLocalizer(),
      new SeoLocalizer(),
    );
  }
}
