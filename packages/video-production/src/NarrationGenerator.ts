import type { OutlineSection, ValidatedFact } from './ResearchEngine';
import type { SupportedLanguage } from './localization/TranslationManager';

const LANGUAGE_LEAD_INS: Record<SupportedLanguage, string> = {
  en: 'Narrator',
  es: 'Narrador',
  fr: 'Narrateur',
  de: 'Erzähler',
  it: 'Narratore',
  pt: 'Narrador',
  hi: 'वाचक',
  ar: 'الراوي',
  ja: 'ナレーター',
  zh: '旁白',
  ko: '내레이터',
  ru: 'Рассказчик',
};

function wordCount(value: string): number {
  return value.split(/\s+/).filter(Boolean).length;
}

export class NarrationGenerator {
  generate(
    section: OutlineSection,
    facts: ValidatedFact[],
    tonePreset: string,
    language: SupportedLanguage,
    targetWords: number,
  ): string {
    const lead = `${LANGUAGE_LEAD_INS[language]}:`;
    const factSummary = facts.length > 0 ? facts.map((fact) => fact.statement).join(' ') : section.summary;
    const base = `${lead} In this ${tonePreset} ${section.kind}, ${factSummary}`;
    const expansionPool = [
      `This moment deepens the story with ${tonePreset} clarity.`,
      'Each detail connects to the broader narrative arc.',
      'The pacing stays deliberate so the audience can absorb the key idea.',
      'Examples, context, and implications remain tightly connected.',
      'The narration reinforces continuity before the next beat arrives.',
    ];

    const words = base.split(/\s+/).filter(Boolean);
    let poolIndex = 0;

    while (words.length < targetWords) {
      words.push(...expansionPool[poolIndex % expansionPool.length].split(/\s+/));
      poolIndex += 1;
    }

    return words.slice(0, targetWords).join(' ');
  }

  countWords(value: string): number {
    return wordCount(value);
  }
}
