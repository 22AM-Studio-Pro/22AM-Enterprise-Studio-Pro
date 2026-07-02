export type TextAnimationPreset = 'typewriter' | 'fade-in' | 'slide-up' | 'bounce' | 'zoom-in' | 'word-by-word' | 'char-by-char';

export interface AnimatedTextSpec {
  id: string;
  sceneId: string;
  text: string;
  preset: TextAnimationPreset;
  durationSeconds: number;
  startOffsetSeconds: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  position: 'top' | 'center' | 'bottom';
  cssAnimation: string;
}

const PRESET_CSS: Record<TextAnimationPreset, string> = {
  typewriter: 'typing 2s steps(40, end), blink-caret .75s step-end infinite',
  'fade-in': 'fadeIn 1s ease-in-out forwards',
  'slide-up': 'slideUp 0.8s ease-out forwards',
  bounce: 'bounce 1s ease infinite',
  'zoom-in': 'zoomIn 0.6s ease-out forwards',
  'word-by-word': 'wordByWord 0.3s ease-in-out',
  'char-by-char': 'charByChar 0.05s linear',
};

export class TextAnimator {
  animate(
    sceneId: string,
    text: string,
    preset: TextAnimationPreset = 'fade-in',
    options: Partial<Pick<AnimatedTextSpec, 'fontSize' | 'fontFamily' | 'color' | 'position' | 'startOffsetSeconds'>> = {},
  ): AnimatedTextSpec {
    const wordCount = text.split(' ').length;
    const durationSeconds = preset === 'typewriter' ? wordCount * 0.15 : preset === 'word-by-word' ? wordCount * 0.3 : 2;

    return {
      id: `text-${sceneId}-${Date.now()}`,
      sceneId,
      text,
      preset,
      durationSeconds,
      startOffsetSeconds: options.startOffsetSeconds ?? 0.5,
      fontSize: options.fontSize ?? 48,
      fontFamily: options.fontFamily ?? 'Inter',
      color: options.color ?? '#FFFFFF',
      position: options.position ?? 'center',
      cssAnimation: PRESET_CSS[preset],
    };
  }

  animateBatch(scenes: { id: string; title: string }[], preset: TextAnimationPreset = 'slide-up'): AnimatedTextSpec[] {
    return scenes.map((scene) => this.animate(scene.id, scene.title, preset));
  }
}
