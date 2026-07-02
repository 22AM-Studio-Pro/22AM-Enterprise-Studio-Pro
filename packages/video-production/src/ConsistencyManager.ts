import { ScenePlan, VisualStyle } from './DirectorContext';

export class ConsistencyManager {
  maintainVisualConsistency(scenes: ScenePlan[], style: VisualStyle): ScenePlan[] {
    return scenes.map((scene) => ({
      ...scene,
      imagePrompts: scene.imagePrompts.map(
        (prompt) => `${prompt}. Use palette ${style.palette.join(', ')} and typography ${style.typography}.`,
      ),
      videoPrompts: scene.videoPrompts.map(
        (prompt) => `${prompt}. Apply ${style.transitionStyle} transitions and consistent color grade.`,
      ),
    }));
  }
}
