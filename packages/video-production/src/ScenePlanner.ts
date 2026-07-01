import { ChapterOutline, CameraMovement, DirectorRequest, SceneAssetType, ScenePlan } from './DirectorContext';

const CAMERA_SEQUENCE: CameraMovement[] = ['static', 'pan', 'zoom-in', 'dolly', 'zoom-out', 'tilt'];
const ASSET_SEQUENCE: SceneAssetType[] = ['ai-image', 'ai-video', 'motion-graphics', 'ai-video'];

export class ScenePlanner {
  createScenes(chapter: ChapterOutline, request: DirectorRequest): ScenePlan[] {
    const sceneCount = this.resolveSceneCount(chapter.targetDurationSeconds);
    const sceneDuration = Math.max(8, Math.floor(chapter.targetDurationSeconds / sceneCount));

    return Array.from({ length: sceneCount }, (_, index) => {
      const sceneNumber = index + 1;
      const cameraMovement = CAMERA_SEQUENCE[index % CAMERA_SEQUENCE.length];
      const assetType = ASSET_SEQUENCE[index % ASSET_SEQUENCE.length];
      const narrativeBeat = `Chapter ${chapter.id} scene ${sceneNumber} builds the ${request.goal} narrative.`;

      return {
        id: `${chapter.id}-scene-${sceneNumber}`,
        chapterId: chapter.id,
        title: `Scene ${sceneNumber}`,
        narration: narrativeBeat,
        durationSeconds: sceneDuration,
        assetType,
        cameraMovement,
        imagePrompt: `${request.topic}, ${request.tone} tone, ${narrativeBeat}`,
        videoPrompt: `${request.topic} cinematic sequence with ${cameraMovement}, ${request.audience} audience focus`,
        transition: sceneNumber === sceneCount ? 'chapter-cut' : 'smooth-dissolve',
        musicCue: sceneNumber === 1 ? 'chapter-intro' : 'underscore',
        subtitleText: narrativeBeat,
        effects: assetType === 'motion-graphics' ? ['animated-callout', 'data-overlay'] : ['color-grade'],
      };
    });
  }

  private resolveSceneCount(chapterDurationSeconds: number): number {
    if (chapterDurationSeconds >= 420) {
      return 18;
    }

    if (chapterDurationSeconds >= 300) {
      return 12;
    }

    return 8;
  }
}
