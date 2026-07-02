import type { ScenePlan } from './DirectorContext';
import { StyleConsistency } from './StyleConsistency';
import { CharacterConsistency } from './CharacterConsistency';
import { VisualMemory } from './VisualMemory';

interface PromptCarrier {
  imagePrompts: string[];
  videoPrompts: string[];
}

export class PromptOptimizer {
  constructor(
    private readonly styleConsistency = new StyleConsistency(),
    private readonly characterConsistency = new CharacterConsistency(),
    private readonly visualMemory = new VisualMemory(),
  ) {}

  optimizeScenes<T extends PromptCarrier>(scenes: T[]): T[] {
    const memory = this.visualMemory.build(
      scenes.flatMap((scene) => [...scene.imagePrompts, ...scene.videoPrompts]),
    );

    return scenes.map((scene) => ({
      ...scene,
      imagePrompts: scene.imagePrompts.map((prompt) => this.enhancePrompt(prompt, memory)),
      videoPrompts: scene.videoPrompts.map((prompt) => this.enhancePrompt(prompt, memory)),
    }));
  }

  optimizeStoryboardScenes<T extends PromptCarrier>(scenes: T[]): T[] {
    return this.optimizeScenes(scenes);
  }

  private enhancePrompt(prompt: string, memory: ReturnType<VisualMemory['build']>): string {
    const styled = this.styleConsistency.apply(prompt, memory);
    const withCharacters = this.characterConsistency.apply(styled, memory);
    return `${withCharacters} High detail, coherent composition, no text artifacts.`;
  }
}

export type { ScenePlan };
