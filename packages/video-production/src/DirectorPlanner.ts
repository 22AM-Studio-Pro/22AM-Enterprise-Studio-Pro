import { ChapterOutline, DirectorRequest } from './DirectorContext';

const MIN_CHAPTERS = 6;
const MAX_CHAPTERS = 14;
const FEATURE_LENGTH_MINUTES = 60;
const LONG_VIDEO_MINUTES = 45;
const STANDARD_VIDEO_MINUTES = 30;
const FEATURE_LENGTH_CHAPTERS = 14;
const LONG_VIDEO_CHAPTERS = 10;
const STANDARD_VIDEO_CHAPTERS = 8;
const SHORT_VIDEO_CHAPTERS = 6;

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
        chapterNumber,
      };
    });
  }

  private resolveChapterCount(request: DirectorRequest): number {
    if (typeof request.chapterCount === 'number') {
      return Math.max(MIN_CHAPTERS, Math.min(MAX_CHAPTERS, request.chapterCount));
    }

    if (request.targetDurationMinutes >= FEATURE_LENGTH_MINUTES) {
      return FEATURE_LENGTH_CHAPTERS;
    }

    if (request.targetDurationMinutes >= LONG_VIDEO_MINUTES) {
      return LONG_VIDEO_CHAPTERS;
    }

    if (request.targetDurationMinutes >= STANDARD_VIDEO_MINUTES) {
      return STANDARD_VIDEO_CHAPTERS;
    }

    return SHORT_VIDEO_CHAPTERS;
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
