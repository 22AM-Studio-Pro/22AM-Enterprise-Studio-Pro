export type CalloutStyle = 'speech-bubble' | 'box' | 'highlight' | 'underline' | 'arrow' | 'badge';

export interface CalloutSpec {
  id: string;
  sceneId: string;
  text: string;
  style: CalloutStyle;
  targetSelector?: string;
  position: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  durationSeconds: number;
  startOffsetSeconds: number;
  backgroundColor: string;
  textColor: string;
  animationIn: 'pop' | 'slide' | 'fade';
}

const STYLE_DEFAULTS: Record<CalloutStyle, Partial<CalloutSpec>> = {
  'speech-bubble': { backgroundColor: '#FFFFFF', textColor: '#000000', animationIn: 'pop' },
  box: { backgroundColor: '#1E293B', textColor: '#FFFFFF', animationIn: 'slide' },
  highlight: { backgroundColor: '#FDE68A', textColor: '#000000', animationIn: 'fade' },
  underline: { backgroundColor: 'transparent', textColor: '#3B82F6', animationIn: 'slide' },
  arrow: { backgroundColor: '#EF4444', textColor: '#FFFFFF', animationIn: 'slide' },
  badge: { backgroundColor: '#8B5CF6', textColor: '#FFFFFF', animationIn: 'pop' },
};

export class CalloutEngine {
  build(
    sceneId: string,
    text: string,
    style: CalloutStyle = 'box',
    startOffsetSeconds = 1.5,
  ): CalloutSpec {
    const defaults = STYLE_DEFAULTS[style];
    return {
      id: `callout-${sceneId}-${Date.now()}`,
      sceneId,
      text,
      style,
      position: 'auto',
      durationSeconds: 3,
      startOffsetSeconds,
      backgroundColor: defaults.backgroundColor!,
      textColor: defaults.textColor!,
      animationIn: defaults.animationIn!,
    };
  }

  buildHighlight(sceneId: string, keyword: string): CalloutSpec {
    return this.build(sceneId, keyword, 'highlight', 0);
  }

  buildStatBadge(sceneId: string, statText: string): CalloutSpec {
    return this.build(sceneId, statText, 'badge', 2);
  }
}
