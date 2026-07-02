import type { OutlineSection } from './ResearchEngine';

export class TitleGenerator {
  generate(topic: string, outline: OutlineSection[]): string {
    const lead = outline.find((section) => section.kind === 'hook')?.summary ?? topic;
    return `${topic}: ${lead}`.slice(0, 100);
  }
}
