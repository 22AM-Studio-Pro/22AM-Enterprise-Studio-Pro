export interface VisualMemorySnapshot {
  palette: string[];
  cinematicStyle: string;
  characters: string[];
}

export class VisualMemory {
  build(prompts: string[]): VisualMemorySnapshot {
    const palette = ['deep navy', 'warm amber', 'clean charcoal'];
    const cinematicStyle = 'cinematic continuity, consistent lighting, color-managed frames';
    const characters = Array.from(
      new Set(
        prompts
          .flatMap((prompt) => prompt.match(/[A-Z][a-z]+/g) ?? [])
          .slice(0, 5),
      ),
    );

    return {
      palette,
      cinematicStyle,
      characters,
    };
  }
}
