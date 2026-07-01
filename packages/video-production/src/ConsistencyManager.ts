import { ScenePlan, VisualStyle } from './DirectorContext';

export class ConsistencyManager {
  maintainVisualConsistency(scenes: ScenePlan[], style: VisualStyle): ScenePlan[] {
    return scenes.map((scene) => ({
      ...scene,
      imagePrompt: `${scene.imagePrompt}. Use palette ${style.palette.join(', ')} and typography ${style.typography}.`,
      videoPrompt: `${scene.videoPrompt}. Apply ${style.transitionStyle} transitions and consistent color grade.`,
    }));
  }
}
