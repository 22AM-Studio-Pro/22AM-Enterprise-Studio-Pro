import type { ValidatedFact } from './ResearchEngine';

export class KeywordGenerator {
  generate(topic: string, facts: ValidatedFact[]): string[] {
    const tagKeywords = facts.flatMap((fact) => fact.tags);
    const keywords = Array.from(new Set([topic, ...tagKeywords]));
    return keywords.slice(0, 12);
  }
}
