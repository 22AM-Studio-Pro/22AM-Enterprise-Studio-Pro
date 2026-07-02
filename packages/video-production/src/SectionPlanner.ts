import type { OutlineSection, ValidatedFact } from './ResearchEngine';

export class SectionPlanner {
  createChapterSections(
    topic: string,
    facts: ValidatedFact[],
    chapterMinutes: number[],
    startingOrder: number,
  ): OutlineSection[] {
    const chapterCount = chapterMinutes.length;
    const chunkSize = facts.length === 0 ? 1 : Math.max(1, Math.ceil(facts.length / chapterCount));

    return chapterMinutes.map((targetMinutes, index) => {
      const selectedFacts = facts.slice(index * chunkSize, index * chunkSize + chunkSize);
      const fallbackFacts = selectedFacts.length > 0 ? selectedFacts : facts.slice(0, 1);

      return {
        id: `chapter-${index + 1}`,
        title: `Chapter ${index + 1}: ${topic}`,
        summary:
          fallbackFacts.length > 0
            ? fallbackFacts.map((fact) => fact.statement).join(' ')
            : `Develop chapter ${index + 1} for ${topic}.`,
        factIds: fallbackFacts.map((fact) => fact.id),
        kind: 'chapter',
        targetMinutes,
        order: startingOrder + index,
      };
    });
  }
}
