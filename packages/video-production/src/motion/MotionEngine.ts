import { TransitionEngine, SceneTransition } from './TransitionEngine';
import { LowerThirdEngine, LowerThirdSpec } from './LowerThirdEngine';
import { TextAnimator, AnimatedTextSpec } from './TextAnimator';
import { ChartSpec, InfographicSpec } from './InfographicEngine';
import { CalloutSpec } from './CalloutEngine';
import { ParticleEngine, ParticleSpec } from './ParticleEngine';
import { BrandAnimator, LogoAnimationSpec, WatermarkSpec, ChapterCardSpec, BrandAsset } from './BrandAnimator';

export interface SceneMotionPackage {
  sceneId: string;
  lowerThird?: LowerThirdSpec;
  textAnimations: AnimatedTextSpec[];
  callouts: CalloutSpec[];
  particles?: ParticleSpec;
  logoAnimation?: LogoAnimationSpec;
  watermark?: WatermarkSpec;
  chapterCard?: ChapterCardSpec;
}

export interface MotionEngineInput {
  scenes: { id: string; chapterId: string; title: string; chapterNumber: number; sceneNumber: number; tone: string; durationSeconds: number }[];
  chapters: { id: string; title: string; number: number }[];
  brand: BrandAsset;
}

export interface MotionEngineOutput {
  scenePackages: SceneMotionPackage[];
  transitions: SceneTransition[];
  charts: ChartSpec[];
  infographics: InfographicSpec[];
}

export class MotionEngine {
  constructor(
    private readonly transitions: TransitionEngine,
    private readonly lowerThirds: LowerThirdEngine,
    private readonly text: TextAnimator,
    private readonly particles: ParticleEngine,
    private readonly brand: BrandAnimator,
  ) {}

  compose(input: MotionEngineInput): MotionEngineOutput {
    const chapterFirstSceneMap = new Map<string, string>();
    for (const chapter of input.chapters) {
      const first = input.scenes.find((s) => s.chapterId === chapter.id);
      if (first) chapterFirstSceneMap.set(chapter.id, first.id);
    }

    const chapterMap = new Map(input.chapters.map((c) => [c.id, c]));

    const scenePackages: SceneMotionPackage[] = input.scenes.map((scene) => {
      const isChapterStart = chapterFirstSceneMap.get(scene.chapterId) === scene.id;
      const chapter = chapterMap.get(scene.chapterId);
      const pkg: SceneMotionPackage = {
        sceneId: scene.id,
        lowerThird: this.lowerThirds.build(scene.id, scene.title, `Chapter ${scene.chapterNumber} · Scene ${scene.sceneNumber}`),
        textAnimations: isChapterStart ? [this.text.animate(scene.id, scene.title, 'slide-up')] : [],
        callouts: [],
        particles: this.particles.buildAmbient(scene.id, scene.tone, scene.durationSeconds),
        logoAnimation: this.brand.buildLogoAnimation(scene.id, input.brand),
        watermark: this.brand.buildWatermark(scene.id, input.brand),
        chapterCard: isChapterStart && chapter ? this.brand.buildChapterCard(chapter.id, scene.id, chapter.number, chapter.title, input.brand) : undefined,
      };
      return pkg;
    });

    const chapterBoundaryIds = new Set([...chapterFirstSceneMap.values()]);
    const sceneIds = input.scenes.map((s) => s.id);
    const transitionList = this.transitions.buildAll(sceneIds, chapterBoundaryIds);

    return { scenePackages, transitions: transitionList, charts: [], infographics: [] };
  }

  static createDefault(): MotionEngine {
    return new MotionEngine(
      new TransitionEngine(),
      new LowerThirdEngine(),
      new TextAnimator(),
      new ParticleEngine(),
      new BrandAnimator(),
    );
  }
}
