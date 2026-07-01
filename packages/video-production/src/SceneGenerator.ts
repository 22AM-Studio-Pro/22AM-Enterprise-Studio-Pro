import { ScenePlan } from './DirectorContext';

export interface SceneComposition {
  sceneId: string;
  background: 'ai-image' | 'ai-video' | 'motion-graphics';
  aiImages: string[];
  aiVideos: string[];
  motionGraphics: string[];
  cameraMotion: string;
  zoom: 'in' | 'out' | 'none';
  pan: 'left' | 'right' | 'none';
  particles: boolean;
  transition: string;
  subtitles: string[];
  lowerThirds: string[];
  logo: boolean;
  watermark: boolean;
}

export class SceneGenerator {
  generate(scene: ScenePlan): SceneComposition {
    const isMotionGraphic = scene.assetType === 'motion-graphics';

    return {
      sceneId: scene.id,
      background: scene.assetType,
      aiImages: scene.assetType === 'ai-image' ? scene.imagePrompts : [],
      aiVideos: scene.assetType === 'ai-video' ? scene.videoPrompts : [],
      motionGraphics: isMotionGraphic ? ['lower-third-template', 'animated-callout'] : [],
      cameraMotion: scene.cameraMovement,
      zoom: scene.cameraMovement.includes('zoom') ? (scene.cameraMovement === 'zoom-in' ? 'in' : 'out') : 'none',
      pan: scene.cameraMovement === 'pan' ? 'left' : 'none',
      particles: isMotionGraphic,
      transition: scene.transition,
      subtitles: scene.subtitles,
      lowerThirds: [`${scene.title} • Chapter ${scene.chapterNumber}`],
      logo: true,
      watermark: true,
    };
  }

  generateBatch(scenes: ScenePlan[]): SceneComposition[] {
    return scenes.map((scene) => this.generate(scene));
  }
}
