import type { OutlineSection, ValidatedFact } from './ResearchEngine';
import type { SupportedLanguage } from './localization/TranslationManager';
import { NarrationGenerator } from './NarrationGenerator';
import { DialogueGenerator } from './DialogueGenerator';
import { TransitionGenerator } from './TransitionGenerator';

export interface ScriptGenerationOptions {
  language: SupportedLanguage;
  tonePreset: string;
  targetDurationMinutes: number;
}

export interface ScriptSection {
  id: string;
  title: string;
  kind: OutlineSection['kind'];
  content: string;
  wordCount: number;
  transition?: string;
}

export interface GeneratedScript {
  topic: string;
  language: SupportedLanguage;
  tonePreset: string;
  targetWordCount: number;
  actualWordCount: number;
  sections: ScriptSection[];
  content: string;
}

function countWords(value: string): number {
  return value.split(/\s+/).filter(Boolean).length;
}

export class ScriptEngine {
  constructor(
    private readonly narrationGenerator = new NarrationGenerator(),
    private readonly dialogueGenerator = new DialogueGenerator(),
    private readonly transitionGenerator = new TransitionGenerator(),
  ) {}

  generate(
    topic: string,
    outline: OutlineSection[],
    facts: ValidatedFact[],
    options: ScriptGenerationOptions,
  ): GeneratedScript {
    const targetWordCount = Math.max(3000, Math.min(12000, options.targetDurationMinutes * 200));
    const totalWeight = outline.reduce((sum, section) => sum + Math.max(1, section.targetMinutes), 0);

    const sections = outline.map((section, index) => {
      const sectionFacts = facts.filter((fact) => section.factIds.includes(fact.id));
      const targetWords = Math.max(
        120,
        Math.round((targetWordCount * Math.max(1, section.targetMinutes)) / totalWeight),
      );
      const narration = this.narrationGenerator.generate(
        section,
        sectionFacts,
        options.tonePreset,
        options.language,
        targetWords,
      );
      const dialogue = section.kind === 'chapter' ? this.dialogueGenerator.generate(section, sectionFacts, options.language) : '';
      const transition = index === 0 ? undefined : this.transitionGenerator.generate(outline[index - 1], section, options.language);
      const content = [transition, narration, dialogue].filter(Boolean).join(' ');

      return {
        id: section.id,
        title: section.title,
        kind: section.kind,
        content,
        transition,
        wordCount: countWords(content),
      };
    });

    const content = sections
      .map((section) => `${section.title}\n${section.content}`)
      .join('\n\n');
    const actualWordCount = countWords(content);

    return {
      topic,
      language: options.language,
      tonePreset: options.tonePreset,
      targetWordCount,
      actualWordCount,
      sections,
      content,
    };
  }
}
