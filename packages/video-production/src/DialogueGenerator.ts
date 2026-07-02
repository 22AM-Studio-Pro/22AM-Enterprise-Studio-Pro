import type { OutlineSection, ValidatedFact } from './ResearchEngine';
import type { SupportedLanguage } from './localization/TranslationManager';

const LANGUAGE_MARKERS: Record<SupportedLanguage, string> = {
  en: 'Expert aside',
  es: 'Aporte experto',
  fr: 'Point de vue expert',
  de: 'Expertenhinweis',
  it: 'Nota dell’esperto',
  pt: 'Comentário do especialista',
  hi: 'विशेषज्ञ टिप्पणी',
  ar: 'مداخلة خبير',
  ja: '専門家の視点',
  zh: '专家观点',
  ko: '전문가 코멘트',
  ru: 'Комментарий эксперта',
};

export class DialogueGenerator {
  generate(section: OutlineSection, facts: ValidatedFact[], language: SupportedLanguage): string {
    const source = facts[0];
    const marker = LANGUAGE_MARKERS[language];

    return source
      ? `${marker}: ${section.title} — ${source.statement}`
      : `${marker}: ${section.title} keeps the audience anchored in the main argument.`;
  }
}
