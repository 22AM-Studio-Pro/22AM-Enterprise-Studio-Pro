export interface LowerThirdSpec {
  sceneId: string;
  title: string;
  subtitle?: string;
  logoUrl?: string;
  style: 'minimal' | 'broadcast' | 'documentary' | 'corporate';
  position: 'bottom-left' | 'bottom-center' | 'bottom-right';
  durationSeconds: number;
  startOffsetSeconds: number;
  animationIn: 'slide-up' | 'fade' | 'wipe';
  animationOut: 'slide-down' | 'fade' | 'wipe';
  primaryColor: string;
  textColor: string;
}

export class LowerThirdEngine {
  build(
    sceneId: string,
    title: string,
    subtitle?: string,
    style: LowerThirdSpec['style'] = 'minimal',
  ): LowerThirdSpec {
    const styleDefaults: Record<LowerThirdSpec['style'], Partial<LowerThirdSpec>> = {
      minimal: { primaryColor: '#FFFFFF', textColor: '#000000', animationIn: 'fade', animationOut: 'fade' },
      broadcast: { primaryColor: '#003580', textColor: '#FFFFFF', animationIn: 'slide-up', animationOut: 'slide-down' },
      documentary: { primaryColor: '#1A1A1A', textColor: '#F0F0F0', animationIn: 'wipe', animationOut: 'wipe' },
      corporate: { primaryColor: '#0066CC', textColor: '#FFFFFF', animationIn: 'slide-up', animationOut: 'fade' },
    };

    const defaults = styleDefaults[style];

    return {
      sceneId,
      title,
      subtitle,
      style,
      position: 'bottom-left',
      durationSeconds: Math.min(5, 3 + (subtitle ? 1 : 0)),
      startOffsetSeconds: 1.0,
      animationIn: defaults.animationIn!,
      animationOut: defaults.animationOut!,
      primaryColor: defaults.primaryColor!,
      textColor: defaults.textColor!,
    };
  }

  buildBatch(
    scenes: { id: string; title: string; chapterNumber: number; sceneNumber: number }[],
    style: LowerThirdSpec['style'] = 'minimal',
  ): LowerThirdSpec[] {
    return scenes.map((scene) =>
      this.build(scene.id, scene.title, `Chapter ${scene.chapterNumber} · Scene ${scene.sceneNumber}`, style),
    );
  }
}
