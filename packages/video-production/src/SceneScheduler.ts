import { ScenePlan } from './DirectorContext';

export class SceneScheduler {
  scheduleScenes(scenes: ScenePlan[]): ScenePlan[] {
    let cursor = 0;

    return scenes.map((scene) => {
      const scheduledScene: ScenePlan = {
        ...scene,
        startTimeSeconds: cursor,
      };

      cursor += scene.durationSeconds;
      return scheduledScene;
    });
  }

  estimateRuntimeSeconds(scenes: ScenePlan[]): number {
    return scenes.reduce((total, scene) => total + scene.durationSeconds, 0);
  }
}
