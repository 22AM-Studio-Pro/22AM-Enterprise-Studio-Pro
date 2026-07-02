import type { CameraMovement, DirectorRequest } from './DirectorContext';
import type { OutlineSection } from './ResearchEngine';
import type { GeneratedScript } from './ScriptEngine';
import { SceneBreakdown } from './SceneBreakdown';
import { ShotPlanner } from './ShotPlanner';
import { VisualPlanner } from './VisualPlanner';

export interface StoryboardScene {
  id: string;
  sectionId: string;
  sceneNumber: number;
  title: string;
  narration: string;
  durationSeconds: number;
  startTimeSeconds: number;
  cameraAngle: 'wide' | 'medium' | 'close-up' | 'overhead';
  cameraMovement: CameraMovement;
  bRoll: string[];
  imagePrompts: string[];
  videoPrompts: string[];
  visualPrompt: string;
  continuityToken: string;
}

export interface GeneratedStoryboard {
  scenes: StoryboardScene[];
  totalDurationSeconds: number;
  continuityScore: number;
}

export class StoryboardEngine {
  constructor(
    private readonly sceneBreakdown = new SceneBreakdown(),
    private readonly shotPlanner = new ShotPlanner(),
    private readonly visualPlanner = new VisualPlanner(),
  ) {}

  generate(script: GeneratedScript, outline: OutlineSection[], request: DirectorRequest): GeneratedStoryboard {
    const seeds = this.sceneBreakdown.create(script, outline);
    let cursor = 0;

    const scenes = seeds.map((seed, index) => {
      const shot = this.shotPlanner.plan(seed, index);
      const visualPlan = this.visualPlanner.plan(seed, shot, request);
      const scene: StoryboardScene = {
        id: seed.id,
        sectionId: seed.sectionId,
        sceneNumber: index + 1,
        title: seed.title,
        narration: seed.narration,
        durationSeconds: seed.durationSeconds,
        startTimeSeconds: cursor,
        cameraAngle: shot.cameraAngle,
        cameraMovement: shot.motion,
        bRoll: visualPlan.bRoll,
        imagePrompts: [visualPlan.imagePrompt],
        videoPrompts: [visualPlan.videoPrompt],
        visualPrompt: visualPlan.visualPrompt,
        continuityToken: seed.continuityToken,
      };
      cursor += seed.durationSeconds;
      return scene;
    });

    const continuityMatches = scenes.slice(1).filter((scene, index) => scene.continuityToken.split('-')[0] === scenes[index].continuityToken.split('-')[0]).length;
    const continuityScore = scenes.length <= 1 ? 1 : continuityMatches / (scenes.length - 1);

    return {
      scenes,
      totalDurationSeconds: cursor,
      continuityScore,
    };
  }
}
