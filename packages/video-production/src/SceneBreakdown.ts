import type { OutlineSection } from './ResearchEngine';
import type { GeneratedScript } from './ScriptEngine';

export interface SceneSeed {
  id: string;
  sectionId: string;
  title: string;
  narration: string;
  durationSeconds: number;
  continuityToken: string;
}

function chunkText(text: string, parts: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunkSize = Math.max(1, Math.ceil(words.length / parts));

  return Array.from({ length: parts }, (_, index) => words.slice(index * chunkSize, (index + 1) * chunkSize).join(' ')).filter(Boolean);
}

export class SceneBreakdown {
  create(script: GeneratedScript, outline: OutlineSection[]): SceneSeed[] {
    return outline.flatMap((section) => {
      const scriptSection = script.sections.find((entry) => entry.id === section.id);
      const sceneCount = section.kind === 'chapter' ? Math.max(2, Math.round(section.targetMinutes / 2)) : 1;
      const chunks = chunkText(scriptSection?.content ?? section.summary, sceneCount);
      const baseDuration = Math.max(12, Math.floor((section.targetMinutes * 60) / sceneCount));

      return chunks.map((chunk, index) => ({
        id: `${section.id}-scene-${index + 1}`,
        sectionId: section.id,
        title: sceneCount > 1 ? `${section.title} — Beat ${index + 1}` : section.title,
        narration: chunk,
        durationSeconds: baseDuration,
        continuityToken: `${section.kind}-${index === 0 ? 'entry' : 'flow'}`,
      }));
    });
  }
}
