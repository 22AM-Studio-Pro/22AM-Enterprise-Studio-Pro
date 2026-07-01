import { ChapterOutline, ScenePlan } from './DirectorContext';

export type MotionGraphicType =
  | 'lower-third'
  | 'title-card'
  | 'chapter-transition'
  | 'animated-text'
  | 'icon'
  | 'infographic'
  | 'animated-chart'
  | 'callout'
  | 'logo-animation';

export interface MotionGraphicElement {
  id: string;
  type: MotionGraphicType;
  sceneId: string;
  text?: string;
  icon?: string;
  templateId?: string;
  durationSeconds: number;
  startOffsetSeconds: number;
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';
  animationIn: 'fade' | 'slide-up' | 'slide-left' | 'pop' | 'wipe';
  animationOut: 'fade' | 'slide-down' | 'slide-right' | 'pop' | 'wipe';
  data?: object;
}

export interface LowerThird {
  title: string;
  subtitle?: string;
  logoUrl?: string;
}

export interface TitleCard {
  headline: string;
  subheadline?: string;
  backgroundStyle: 'solid' | 'gradient' | 'video-overlay';
}

export interface ChapterTransition {
  chapterNumber: number;
  chapterTitle: string;
  transitionStyle: 'wipe' | 'fade-to-black' | 'zoom-out' | 'slide';
}

export interface AnimatedChartSpec {
  chartType: 'bar' | 'line' | 'pie' | 'timeline';
  title: string;
  dataPoints: { label: string; value: number }[];
}

export interface CalloutSpec {
  text: string;
  pointerTarget?: string;
  style: 'speech-bubble' | 'box' | 'underline' | 'highlight';
}

export interface LogoAnimationSpec {
  logoUrl: string;
  animationStyle: 'reveal' | 'spin' | 'bounce' | 'pulse';
  durationSeconds: number;
}

export class LowerThirdGenerator {
  generate(scene: ScenePlan): MotionGraphicElement {
    const lower: LowerThird = {
      title: scene.title,
      subtitle: `Chapter ${scene.chapterNumber} · Scene ${scene.sceneNumber}`,
    };

    return {
      id: `lower-third-${scene.id}`,
      type: 'lower-third',
      sceneId: scene.id,
      text: lower.title,
      durationSeconds: Math.min(5, scene.durationSeconds * 0.3),
      startOffsetSeconds: 1.0,
      position: 'bottom-left',
      animationIn: 'slide-up',
      animationOut: 'fade',
      data: lower,
    };
  }
}

export class TitleCardGenerator {
  generate(chapter: ChapterOutline, sceneId: string): MotionGraphicElement {
    const card: TitleCard = {
      headline: chapter.title,
      subheadline: chapter.summary.slice(0, 80),
      backgroundStyle: 'gradient',
    };

    return {
      id: `title-card-${chapter.id}`,
      type: 'title-card',
      sceneId,
      text: card.headline,
      durationSeconds: 4,
      startOffsetSeconds: 0,
      position: 'center',
      animationIn: 'fade',
      animationOut: 'fade',
      data: card,
    };
  }
}

export class ChapterTransitionGenerator {
  generate(chapter: ChapterOutline, sceneId: string): MotionGraphicElement {
    const transition: ChapterTransition = {
      chapterNumber: chapter.chapterNumber ?? 1,
      chapterTitle: chapter.title,
      transitionStyle: this.selectStyle(chapter.chapterNumber ?? 1),
    };

    return {
      id: `chapter-transition-${chapter.id}`,
      type: 'chapter-transition',
      sceneId,
      text: transition.chapterTitle,
      durationSeconds: 2,
      startOffsetSeconds: 0,
      position: 'center',
      animationIn: 'wipe',
      animationOut: 'wipe',
      data: transition,
    };
  }

  private selectStyle(chapterNumber: number): ChapterTransition['transitionStyle'] {
    const styles: ChapterTransition['transitionStyle'][] = ['wipe', 'fade-to-black', 'zoom-out', 'slide'];
    return styles[(chapterNumber - 1) % styles.length];
  }
}

export class AnimatedChartGenerator {
  generate(scene: ScenePlan, chartSpec: AnimatedChartSpec): MotionGraphicElement {
    return {
      id: `chart-${scene.id}`,
      type: 'animated-chart',
      sceneId: scene.id,
      text: chartSpec.title,
      templateId: `chart-${chartSpec.chartType}`,
      durationSeconds: Math.min(8, scene.durationSeconds * 0.6),
      startOffsetSeconds: 2,
      position: 'center',
      animationIn: 'slide-up',
      animationOut: 'fade',
      data: chartSpec,
    };
  }
}

export class CalloutGenerator {
  generate(scene: ScenePlan, spec: CalloutSpec): MotionGraphicElement {
    return {
      id: `callout-${scene.id}`,
      type: 'callout',
      sceneId: scene.id,
      text: spec.text,
      durationSeconds: 3,
      startOffsetSeconds: scene.durationSeconds * 0.4,
      position: 'top-right',
      animationIn: 'pop',
      animationOut: 'fade',
      data: spec,
    };
  }
}

export class LogoAnimationGenerator {
  generate(sceneId: string, spec: LogoAnimationSpec): MotionGraphicElement {
    return {
      id: `logo-${sceneId}`,
      type: 'logo-animation',
      sceneId,
      templateId: `logo-${spec.animationStyle}`,
      durationSeconds: spec.durationSeconds,
      startOffsetSeconds: 0,
      position: 'top-right',
      animationIn: 'fade',
      animationOut: 'fade',
      data: spec,
    };
  }
}

export class InfographicGenerator {
  generate(scene: ScenePlan, templateId: string): MotionGraphicElement {
    return {
      id: `infographic-${scene.id}`,
      type: 'infographic',
      sceneId: scene.id,
      templateId,
      durationSeconds: Math.min(10, scene.durationSeconds * 0.7),
      startOffsetSeconds: 1,
      position: 'center',
      animationIn: 'fade',
      animationOut: 'fade',
    };
  }
}

export class MotionGraphicsComposer {
  constructor(
    private readonly lowerThirdGen: LowerThirdGenerator,
    private readonly titleCardGen: TitleCardGenerator,
    private readonly chapterTransitionGen: ChapterTransitionGenerator,
    private readonly logoGen: LogoAnimationGenerator,
  ) {}

  composeForScene(scene: ScenePlan, chapter: ChapterOutline, isFirstSceneInChapter: boolean): MotionGraphicElement[] {
    const elements: MotionGraphicElement[] = [];

    elements.push(this.lowerThirdGen.generate(scene));

    if (isFirstSceneInChapter) {
      elements.push(this.titleCardGen.generate(chapter, scene.id));
      elements.push(this.chapterTransitionGen.generate(chapter, scene.id));
    }

    elements.push(
      this.logoGen.generate(scene.id, {
        logoUrl: 'assets/logo.png',
        animationStyle: 'reveal',
        durationSeconds: 2,
      }),
    );

    return elements;
  }

  composeForStoryboard(scenes: ScenePlan[], chapters: ChapterOutline[]): MotionGraphicElement[] {
    const chapterFirstSceneMap = new Map<string, string>();
    for (const chapter of chapters) {
      const firstScene = scenes.find((scene) => scene.chapterId === chapter.id);
      if (firstScene) {
        chapterFirstSceneMap.set(chapter.id, firstScene.id);
      }
    }

    const chapterMap = new Map(chapters.map((chapter) => [chapter.id, chapter]));

    return scenes.flatMap((scene) => {
      const chapter = chapterMap.get(scene.chapterId) ?? chapters[0];
      const isFirst = chapterFirstSceneMap.get(scene.chapterId) === scene.id;
      return this.composeForScene(scene, chapter, isFirst);
    });
  }
}

export class MotionGraphics {
  constructor(
    private readonly composer: MotionGraphicsComposer,
    private readonly chartGen: AnimatedChartGenerator,
    private readonly calloutGen: CalloutGenerator,
    private readonly infographicGen: InfographicGenerator,
  ) {}

  buildForStoryboard(scenes: ScenePlan[], chapters: ChapterOutline[]): MotionGraphicElement[] {
    return this.composer.composeForStoryboard(scenes, chapters);
  }

  addChart(scene: ScenePlan, spec: AnimatedChartSpec): MotionGraphicElement {
    return this.chartGen.generate(scene, spec);
  }

  addCallout(scene: ScenePlan, spec: CalloutSpec): MotionGraphicElement {
    return this.calloutGen.generate(scene, spec);
  }

  addInfographic(scene: ScenePlan, templateId: string): MotionGraphicElement {
    return this.infographicGen.generate(scene, templateId);
  }

  static createDefault(): MotionGraphics {
    const composer = new MotionGraphicsComposer(
      new LowerThirdGenerator(),
      new TitleCardGenerator(),
      new ChapterTransitionGenerator(),
      new LogoAnimationGenerator(),
    );
    return new MotionGraphics(
      composer,
      new AnimatedChartGenerator(),
      new CalloutGenerator(),
      new InfographicGenerator(),
    );
  }
}
