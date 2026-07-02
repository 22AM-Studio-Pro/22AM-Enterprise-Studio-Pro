export interface ChapterPlan {
  chapterCount: number;
  chapterMinutes: number[];
}

const MIN_DURATION = 20;

export class ChapterPlanner {
  plan(targetDurationMinutes: number): ChapterPlan {
    const normalizedMinutes = Math.max(MIN_DURATION, Math.floor(targetDurationMinutes));
    const chapterCount = this.resolveChapterCount(normalizedMinutes);
    const reservedMinutes = 6;
    const narrativeMinutes = Math.max(chapterCount, normalizedMinutes - reservedMinutes);
    const baseMinutes = Math.floor(narrativeMinutes / chapterCount);
    let remainder = narrativeMinutes % chapterCount;
    const chapterMinutes = Array.from({ length: chapterCount }, () => {
      const duration = baseMinutes + (remainder > 0 ? 1 : 0);
      remainder = Math.max(0, remainder - 1);
      return duration;
    });

    return {
      chapterCount,
      chapterMinutes,
    };
  }

  private resolveChapterCount(targetDurationMinutes: number): number {
    if (targetDurationMinutes >= 60) {
      return 8;
    }

    if (targetDurationMinutes >= 45) {
      return 6;
    }

    if (targetDurationMinutes >= 30) {
      return 5;
    }

    return 4;
  }
}
