import type { OutlineSection, ValidatedFact } from './ResearchEngine';
import { ChapterPlanner } from './ChapterPlanner';
import { SectionPlanner } from './SectionPlanner';
import { NarrativePlanner } from './NarrativePlanner';

export class OutlineGenerator {
  constructor(
    private readonly chapterPlanner = new ChapterPlanner(),
    private readonly sectionPlanner = new SectionPlanner(),
    private readonly narrativePlanner = new NarrativePlanner(),
  ) {}

  generate(topic: string, facts: ValidatedFact[], targetDurationMinutes: number): OutlineSection[] {
    const chapterPlan = this.chapterPlanner.plan(targetDurationMinutes);
    const chapterSections = this.sectionPlanner.createChapterSections(topic, facts, chapterPlan.chapterMinutes, 3);

    return [
      {
        id: 'outline-hook',
        title: `Hook: ${topic}`,
        summary: this.narrativePlanner.createHook(topic, facts),
        factIds: facts.slice(0, 1).map((fact) => fact.id),
        kind: 'hook',
        targetMinutes: 1,
        order: 1,
      },
      {
        id: 'outline-introduction',
        title: `Introduction: ${topic}`,
        summary: this.narrativePlanner.createIntroduction(topic, facts),
        factIds: facts.slice(0, 2).map((fact) => fact.id),
        kind: 'introduction',
        targetMinutes: 2,
        order: 2,
      },
      ...chapterSections,
      {
        id: 'outline-recap',
        title: `Recap: ${topic}`,
        summary: this.narrativePlanner.createRecap(topic, facts),
        factIds: facts.slice(-2).map((fact) => fact.id),
        kind: 'recap',
        targetMinutes: 1,
        order: chapterSections.length + 3,
      },
      {
        id: 'outline-conclusion',
        title: `Conclusion: ${topic}`,
        summary: this.narrativePlanner.createConclusion(topic),
        factIds: facts.slice(-1).map((fact) => fact.id),
        kind: 'conclusion',
        targetMinutes: 1,
        order: chapterSections.length + 4,
      },
      {
        id: 'outline-cta',
        title: `CTA: ${topic}`,
        summary: this.narrativePlanner.createCallToAction(topic),
        factIds: [],
        kind: 'cta',
        targetMinutes: 1,
        order: chapterSections.length + 5,
      },
    ];
  }
}
