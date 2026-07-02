import { describe, it, expect } from 'vitest';
import { PromptOptimizer } from '../PromptOptimizer';

const scenes = [
  {
    imagePrompts: ['Ada Lovelace in a research lab'],
    videoPrompts: ['Ada Lovelace walking through a cinematic archive'],
  },
  {
    imagePrompts: ['Ada Lovelace reviewing analytical notes'],
    videoPrompts: ['Ada Lovelace in a dramatic close-up'],
  },
];

describe('PromptOptimizer', () => {
  it('optimizes prompts with stable style tokens', () => {
    const optimized = new PromptOptimizer().optimizeStoryboardScenes(scenes);

    expect(optimized[0].imagePrompts[0]).toContain('Palette:');
    expect(optimized[0].imagePrompts[0]).toContain('High detail');
  });

  it('preserves character consistency across prompts', () => {
    const optimized = new PromptOptimizer().optimizeStoryboardScenes(scenes);

    expect(optimized.every((scene) => scene.imagePrompts[0].includes('Ada') || scene.imagePrompts[0].includes('character'))).toBe(true);
  });
});
