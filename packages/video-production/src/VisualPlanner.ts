import type { DirectorRequest } from './DirectorContext';
import type { SceneSeed } from './SceneBreakdown';
import type { PlannedShot } from './ShotPlanner';

export interface VisualPlan {
  bRoll: string[];
  imagePrompt: string;
  videoPrompt: string;
  visualPrompt: string;
}

export class VisualPlanner {
  plan(scene: SceneSeed, shot: PlannedShot, request: DirectorRequest): VisualPlan {
    const bRoll = [
      `${request.topic} archive footage`,
      `${request.topic} contextual graphics`,
    ];
    const imagePrompt = `${request.topic}, ${shot.cameraAngle} angle, ${request.tone} tone, ${scene.title}`;
    const videoPrompt = `${request.topic} cinematic motion with ${shot.motion} camera movement for ${request.audience}`;
    const visualPrompt = `${imagePrompt}. Maintain continuity with ${scene.continuityToken}.`;

    return {
      bRoll,
      imagePrompt,
      videoPrompt,
      visualPrompt,
    };
  }
}
