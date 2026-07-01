import { ChapterOutline, DirectorRequest, Storyboard } from './DirectorContext';
import { ScenePlanner } from './ScenePlanner';
import { SceneScheduler } from './SceneScheduler';

export class StoryboardGenerator {
  constructor(
    private readonly scenePlanner: ScenePlanner,
    private readonly sceneScheduler: SceneScheduler,
  ) {}

  generate(chapters: ChapterOutline[], request: DirectorRequest): Storyboard {
    const unscheduledScenes = chapters.flatMap((chapter) => this.scenePlanner.createScenes(chapter, request));
    const scenes = this.sceneScheduler.scheduleScenes(unscheduledScenes);

    return {
      chapters,
      scenes,
      estimatedRuntimeSeconds: this.sceneScheduler.estimateRuntimeSeconds(scenes),
    };
  }
}
