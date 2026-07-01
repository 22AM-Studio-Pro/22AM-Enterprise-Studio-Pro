import { DirectorRequest, ScenePlan } from './DirectorContext';

const WORDS_PER_SECOND = 2.6;

export class NarrationPlanner {
  optimizeNarration(scenes: ScenePlan[], request: DirectorRequest): ScenePlan[] {
    return scenes.map((scene) => {
      const targetWordCount = Math.max(8, Math.floor(scene.durationSeconds * WORDS_PER_SECOND));
      const narration = this.fitNarration(scene.narration, targetWordCount, request.tone);

      return {
        ...scene,
        narration,
        subtitleText: narration,
      };
    });
  }

  private fitNarration(baseNarration: string, targetWordCount: number, tone: string): string {
    const words = baseNarration.split(' ').filter((word) => word.length > 0);

    if (words.length >= targetWordCount) {
      return words.slice(0, targetWordCount).join(' ');
    }

    const filler = `with a ${tone} delivery`; 
    const paddedWords = [...words];

    while (paddedWords.length < targetWordCount) {
      paddedWords.push(...filler.split(' '));
    }

    return paddedWords.slice(0, targetWordCount).join(' ');
  }
}
