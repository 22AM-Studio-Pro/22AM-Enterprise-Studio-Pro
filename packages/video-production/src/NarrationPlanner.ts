import { DirectorRequest, ScenePlan } from './DirectorContext';

const READABLE_NARRATION_WORDS_PER_SECOND = 2.3;
const MIN_NARRATION_WORDS = 8;

export class NarrationPlanner {
  optimizeNarration(scenes: ScenePlan[], request: DirectorRequest): ScenePlan[] {
    return scenes.map((scene) => {
      const targetWordCount = Math.max(
        MIN_NARRATION_WORDS,
        Math.floor(scene.durationSeconds * READABLE_NARRATION_WORDS_PER_SECOND),
      );
      const narration = this.fitNarration(scene.narration, targetWordCount, request.tone);

      return {
        ...scene,
        narration,
        subtitles: [narration],
      };
    });
  }

  private fitNarration(baseNarration: string, targetWordCount: number, tone: string): string {
    const words = baseNarration.split(' ').filter((word) => word.length > 0);

    if (words.length >= targetWordCount) {
      return words.slice(0, targetWordCount).join(' ');
    }

    const expansionSegments = [
      `with a ${tone} delivery`,
      'supported by clear examples',
      'and focused transitions',
      'to keep narrative momentum',
      'while reinforcing key takeaways',
    ];
    const paddedWords = [...words];
    let segmentIndex = 0;

    while (paddedWords.length < targetWordCount) {
      const segment = expansionSegments[segmentIndex % expansionSegments.length];
      paddedWords.push(...segment.split(' '));
      segmentIndex += 1;
    }

    return paddedWords.slice(0, targetWordCount).join(' ');
  }
}
