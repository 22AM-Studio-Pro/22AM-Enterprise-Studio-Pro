import { OutlineSection } from './ResearchEngine';

export class ChapterGenerator {
  generate(outline: OutlineSection[]): { title: string; summary: string }[] {
    return outline.map((section, index) => ({
      title: `Chapter ${index + 1}: ${section.title}`,
      summary: section.summary,
    }));
  }
}
