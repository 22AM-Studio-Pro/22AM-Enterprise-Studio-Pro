export type TargetDuration = number;

export type SceneAssetType = 'ai-image' | 'ai-video' | 'motion-graphics';

export type CameraMovement = 'static' | 'pan' | 'tilt' | 'zoom-in' | 'zoom-out' | 'dolly';

export interface ProviderSelection {
  imageProvider: string;
  videoProvider: string;
  narrationProvider: string;
  musicProvider: string;
}

export interface VisualStyle {
  palette: string[];
  typography: string;
  transitionStyle: string;
  cameraStyle: CameraMovement[];
}

export interface DirectorRequest {
  topic: string;
  goal: string;
  audience: string;
  tone: string;
  language: string;
  targetDurationMinutes: TargetDuration;
  chapterCount?: number;
  providers?: Partial<ProviderSelection>;
  visualStyle?: Partial<VisualStyle>;
}

export interface ChapterOutline {
  id: string;
  title: string;
  summary: string;
  targetDurationSeconds: number;
  chapterNumber?: number;
}

export interface ScenePlan {
  id: string;
  chapterId: string;
  chapterNumber: number;
  sceneNumber: number;
  sequenceNumber: number;
  title: string;
  narration: string;
  durationSeconds: number;
  assetType: SceneAssetType;
  cameraMovement: CameraMovement;
  imagePrompts: string[];
  videoPrompts: string[];
  transition: string;
  musicCue: string;
  subtitles: string[];
  effects: string[];
  startTimeSeconds?: number;
}

export interface Storyboard {
  chapters: ChapterOutline[];
  scenes: ScenePlan[];
  estimatedRuntimeSeconds: number;
}

export interface DirectorOutput {
  request: DirectorRequest;
  providers: ProviderSelection;
  visualStyle: VisualStyle;
  storyboard: Storyboard;
  qualityChecks: QualityCheck[];
}

export interface QualityCheck {
  check: string;
  passed: boolean;
  details: string;
}
