import type { VisualMemorySnapshot } from './VisualMemory';

export class StyleConsistency {
  apply(prompt: string, memory: VisualMemorySnapshot): string {
    return `${prompt}. Palette: ${memory.palette.join(', ')}. ${memory.cinematicStyle}.`;
  }
}
