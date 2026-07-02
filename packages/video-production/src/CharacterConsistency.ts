import type { VisualMemorySnapshot } from './VisualMemory';

export class CharacterConsistency {
  apply(prompt: string, memory: VisualMemorySnapshot): string {
    if (memory.characters.length === 0) {
      return `${prompt} Keep character silhouettes stable across shots.`;
    }

    return `${prompt} Preserve the look of ${memory.characters.join(', ')} across every scene.`;
  }
}
