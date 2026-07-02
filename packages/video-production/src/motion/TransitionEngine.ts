export type TransitionStyle = 'fade' | 'wipe-left' | 'wipe-right' | 'zoom-in' | 'zoom-out' | 'slide-up' | 'slide-down' | 'dissolve' | 'flash' | 'glitch';

export interface SceneTransition {
  fromSceneId: string;
  toSceneId: string;
  style: TransitionStyle;
  durationSeconds: number;
  ffmpegFilter: string;
}

const STYLE_FILTERS: Record<TransitionStyle, (d: number) => string> = {
  fade: (d) => `xfade=transition=fade:duration=${d}:offset=0`,
  'wipe-left': (d) => `xfade=transition=wipeleft:duration=${d}:offset=0`,
  'wipe-right': (d) => `xfade=transition=wiperight:duration=${d}:offset=0`,
  'zoom-in': (d) => `xfade=transition=zoomin:duration=${d}:offset=0`,
  'zoom-out': (d) => `xfade=transition=fadeblack:duration=${d}:offset=0`,
  'slide-up': (d) => `xfade=transition=sliceup:duration=${d}:offset=0`,
  'slide-down': (d) => `xfade=transition=slicedown:duration=${d}:offset=0`,
  dissolve: (d) => `xfade=transition=dissolve:duration=${d}:offset=0`,
  flash: (d) => `xfade=transition=fadewhite:duration=${d}:offset=0`,
  glitch: (d) => `xfade=transition=pixelize:duration=${d}:offset=0`,
};

export class TransitionEngine {
  selectStyle(chapterBoundary: boolean, sceneIndex: number): TransitionStyle {
    if (chapterBoundary) return ['fade', 'dissolve', 'flash'][sceneIndex % 3] as TransitionStyle;
    const styles: TransitionStyle[] = ['wipe-left', 'wipe-right', 'slide-up', 'zoom-in'];
    return styles[sceneIndex % styles.length];
  }

  build(fromSceneId: string, toSceneId: string, style: TransitionStyle, durationSeconds = 0.5): SceneTransition {
    return {
      fromSceneId,
      toSceneId,
      style,
      durationSeconds,
      ffmpegFilter: STYLE_FILTERS[style](durationSeconds),
    };
  }

  buildAll(
    sceneIds: string[],
    chapterBoundaryIds: Set<string>,
  ): SceneTransition[] {
    return sceneIds.slice(0, -1).map((id, i) => {
      const style = this.selectStyle(chapterBoundaryIds.has(sceneIds[i + 1]), i);
      return this.build(id, sceneIds[i + 1], style);
    });
  }
}
