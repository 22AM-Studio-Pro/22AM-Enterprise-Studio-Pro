import type { OutlineSection } from './ResearchEngine';
import type { GeneratedScript } from './ScriptEngine';

export class DescriptionGenerator {
  generate(topic: string, outline: OutlineSection[], script: GeneratedScript): string {
    const chapterTitles = outline
      .filter((section) => section.kind === 'chapter')
      .map((section) => section.title)
      .join(' • ');
    const summary = `${topic} deep dive with ${script.actualWordCount} words covering ${chapterTitles}.`;
    return summary.slice(0, 320);
  }
}
