import type { OutlineSection } from './ResearchEngine';
import type { SupportedLanguage } from './localization/TranslationManager';

const CONNECTORS: Record<SupportedLanguage, string> = {
  en: 'Next',
  es: 'A continuación',
  fr: 'Ensuite',
  de: 'Als Nächstes',
  it: 'Successivamente',
  pt: 'Na sequência',
  hi: 'इसके बाद',
  ar: 'بعد ذلك',
  ja: '次に',
  zh: '接下来',
  ko: '다음으로',
  ru: 'Далее',
};

export class TransitionGenerator {
  generate(previousSection: OutlineSection, currentSection: OutlineSection, language: SupportedLanguage): string {
    return `${CONNECTORS[language]}, move from ${previousSection.title} into ${currentSection.title} without losing momentum.`;
  }
}
