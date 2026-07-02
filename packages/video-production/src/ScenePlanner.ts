import { ChapterOutline, CameraMovement, DirectorRequest, SceneAssetType, ScenePlan } from './DirectorContext';

const CAMERA_SEQUENCE: CameraMovement[] = ['static', 'pan', 'zoom-in', 'dolly', 'zoom-out', 'tilt'];
const ASSET_SEQUENCE: SceneAssetType[] = ['ai-image', 'ai-video', 'motion-graphics', 'ai-video'];
const MIN_SCENE_DURATION_SECONDS = 8;
const LONG_CHAPTER_THRESHOLD_SECONDS = 420;
const MID_CHAPTER_THRESHOLD_SECONDS = 300;
const LONG_CHAPTER_SCENE_COUNT = 18;
const MID_CHAPTER_SCENE_COUNT = 12;
const SHORT_CHAPTER_SCENE_COUNT = 8;

export class ScenePlanner {
  createScenes(chapter: ChapterOutline, request: DirectorRequest): ScenePlan[] {
    const sceneCount = this.resolveSceneCount(chapter.targetDurationSeconds);
    const baseDuration = Math.floor(chapter.targetDurationSeconds / sceneCount);
    let remainder = chapter.targetDurationSeconds % sceneCount;
    const chapterNumber = chapter.chapterNumber ?? this.deriveChapterNumber(chapter.id);

    return Array.from({ length: sceneCount }, (_, index) => {
      const sceneNumber = index + 1;
      const cameraMovement = CAMERA_SEQUENCE[index % CAMERA_SEQUENCE.length];
      const assetType = ASSET_SEQUENCE[index % ASSET_SEQUENCE.length];
      const durationAdjustment = remainder > 0 ? 1 : 0;
      remainder = Math.max(0, remainder - 1);
      const durationSeconds = baseDuration + durationAdjustment;
      const narrativeBeat = `Chapter ${chapterNumber} scene ${sceneNumber} builds the ${request.goal} narrative.`;

      return {
        id: `${chapter.id}-scene-${sceneNumber}`,
        chapterId: chapter.id,
        chapterNumber,
        sceneNumber,
        sequenceNumber: 0,
        title: `Scene ${sceneNumber}`,
        narration: narrativeBeat,
        durationSeconds,
        assetType,
        cameraMovement,
        imagePrompts: [`${request.topic}, ${request.tone} tone, ${narrativeBeat}`],
        videoPrompts: [
          `${request.topic} cinematic sequence with ${cameraMovement}, ${request.audience} audience focus`,
        ],
        transition: sceneNumber === sceneCount ? 'chapter-cut' : 'smooth-dissolve',
        musicCue: sceneNumber === 1 ? 'chapter-intro' : 'underscore',
        subtitles: [narrativeBeat],
        effects: assetType === 'motion-graphics' ? ['animated-callout', 'data-overlay'] : ['color-grade'],
      };
    });
  }

  private resolveSceneCount(chapterDurationSeconds: number): number {
    const maxSceneCount = Math.max(1, Math.floor(chapterDurationSeconds / MIN_SCENE_DURATION_SECONDS));

    if (chapterDurationSeconds >= LONG_CHAPTER_THRESHOLD_SECONDS) {
      return Math.min(LONG_CHAPTER_SCENE_COUNT, maxSceneCount);
    }

    if (chapterDurationSeconds >= MID_CHAPTER_THRESHOLD_SECONDS) {
      return Math.min(MID_CHAPTER_SCENE_COUNT, maxSceneCount);
    }

    return Math.min(SHORT_CHAPTER_SCENE_COUNT, maxSceneCount);
  }

  private deriveChapterNumber(chapterId: string): number {
    const match = chapterId.match(/chapter-(\d+)/);
    return match ? Number(match[1]) : 1;
  }
}
