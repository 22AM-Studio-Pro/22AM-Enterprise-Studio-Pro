import type { CameraMovement } from './DirectorContext';
import type { SceneSeed } from './SceneBreakdown';

export interface PlannedShot {
  cameraAngle: 'wide' | 'medium' | 'close-up' | 'overhead';
  motion: CameraMovement;
}

const ANGLES: PlannedShot['cameraAngle'][] = ['wide', 'medium', 'close-up', 'overhead'];
const MOTIONS: CameraMovement[] = ['static', 'pan', 'zoom-in', 'dolly', 'tilt', 'zoom-out'];

export class ShotPlanner {
  plan(scene: SceneSeed, index: number): PlannedShot {
    const emphasisOffset = scene.title.length % ANGLES.length;

    return {
      cameraAngle: ANGLES[(index + emphasisOffset) % ANGLES.length],
      motion: MOTIONS[index % MOTIONS.length],
    };
  }
}
