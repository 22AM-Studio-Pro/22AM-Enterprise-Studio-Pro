import { OutlineSection, ValidatedFact } from './ResearchEngine';

const LONG_FORM_MINUTES = 60;
const EXTENDED_FORM_MINUTES = 45;
const STANDARD_FORM_MINUTES = 30;
const LONG_FORM_SECTIONS = 12;
const EXTENDED_FORM_SECTIONS = 10;
const STANDARD_FORM_SECTIONS = 8;
const COMPACT_FORM_SECTIONS = 6;

export class OutlineGenerator {
  generate(topic: string, facts: ValidatedFact[], targetDurationMinutes: number): OutlineSection[] {
    const sectionCount = this.resolveSectionCount(targetDurationMinutes);

    if (facts.length === 0) {
      return Array.from({ length: sectionCount }, (_, index) => ({
        id: `outline-${index + 1}`,
        title: `${topic} — Section ${index + 1}`,
        summary: `Section ${index + 1} placeholder awaiting validated facts.`,
        factIds: [],
      }));
    }

    const sectionSize = Math.max(1, Math.ceil(facts.length / sectionCount));

    return Array.from({ length: sectionCount }, (_, index) => {
      const start = index * sectionSize;
      const sectionFacts = facts.slice(start, start + sectionSize);
      const fallbackFact = facts[index % facts.length];
      const selectedFacts = sectionFacts.length > 0 ? sectionFacts : fallbackFact ? [fallbackFact] : [];

      return {
        id: `outline-${index + 1}`,
        title: `${topic} — Section ${index + 1}`,
        summary: selectedFacts.map((fact) => fact.statement).join(' '),
        factIds: selectedFacts.map((fact) => fact.id),
      };
    });
  }

  private resolveSectionCount(targetDurationMinutes: number): number {
    if (targetDurationMinutes >= LONG_FORM_MINUTES) {
      return LONG_FORM_SECTIONS;
    }

    if (targetDurationMinutes >= EXTENDED_FORM_MINUTES) {
      return EXTENDED_FORM_SECTIONS;
    }

    if (targetDurationMinutes >= STANDARD_FORM_MINUTES) {
      return STANDARD_FORM_SECTIONS;
    }

    return COMPACT_FORM_SECTIONS;
  }
}
