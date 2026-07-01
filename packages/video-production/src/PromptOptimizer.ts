import { ScenePlan } from './DirectorContext';

export class PromptOptimizer {
  optimizeScenes(scenes: ScenePlan[]): ScenePlan[] {
    return scenes.map((scene) => ({
      ...scene,
      imagePrompts: scene.imagePrompts.map((prompt) => this.enhancePrompt(prompt)),
      videoPrompts: scene.videoPrompts.map((prompt) => this.enhancePrompt(prompt)),
    }));
  }

  private enhancePrompt(prompt: string): string {
    return `${prompt}. High detail, coherent composition, no text artifacts.`;
  }
}
