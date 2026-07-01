import { ChapterOutline, DirectorRequest } from './DirectorContext';

const MIN_CHAPTERS = 6;
const MAX_CHAPTERS = 14;

export class DirectorPlanner {
  generateOutline(request: DirectorRequest): ChapterOutline[] {
    const normalizedTargetMinutes = this.normalizeTargetDuration(request.targetDurationMinutes);
    const chapterCount = this.resolveChapterCount(request);
    const totalDurationSeconds = normalizedTargetMinutes * 60;
    const baseDuration = Math.floor(totalDurationSeconds / chapterCount);
    let remainder = totalDurationSeconds % chapterCount;

    return Array.from({ length: chapterCount }, (_, index) => {
      const chapterNumber = index + 1;
      const durationAdjustment = remainder > 0 ? 1 : 0;
      remainder = Math.max(0, remainder - 1);
      return {
        id: `chapter-${chapterNumber}`,
        title: `Chapter ${chapterNumber}: ${request.topic}`,
        summary: this.buildChapterSummary(request, chapterNumber, chapterCount),
        targetDurationSeconds: baseDuration + durationAdjustment,
      };
    });
  }

  private resolveChapterCount(request: DirectorRequest): number {
    if (typeof request.chapterCount === 'number') {
      return Math.max(MIN_CHAPTERS, Math.min(MAX_CHAPTERS, request.chapterCount));
    }

    if (request.targetDurationMinutes >= 60) {
      return 14;
    }

    if (request.targetDurationMinutes >= 45) {
      return 10;
    }

    if (request.targetDurationMinutes >= 30) {
      return 8;
    }

    return 6;
  }

  private normalizeTargetDuration(targetDurationMinutes: number): number {
    return Math.max(20, Math.floor(targetDurationMinutes));
  }

  private buildChapterSummary(request: DirectorRequest, chapterNumber: number, chapterCount: number): string {
    if (chapterNumber === 1) {
      return `Introduce ${request.topic} and define the central objective for ${request.audience}.`;
    }

    if (chapterNumber === chapterCount) {
      return `Conclude ${request.topic} with clear takeaways and a concise recap.`;
    }

    return `Develop key angle ${chapterNumber - 1} with evidence, context, and narrative momentum.`;
  }
}
