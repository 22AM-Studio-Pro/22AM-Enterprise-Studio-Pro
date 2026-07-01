import { ScenePlan } from './DirectorContext';

export class PromptOptimizer {
  optimizeScenes(scenes: ScenePlan[]): ScenePlan[] {
    return scenes.map((scene) => ({
      ...scene,
      imagePrompt: this.enhancePrompt(scene.imagePrompt),
      videoPrompt: this.enhancePrompt(scene.videoPrompt),
    }));
  }

  private enhancePrompt(prompt: string): string {
    return `${prompt}. High detail, coherent composition, no text artifacts.`;
  }
}
