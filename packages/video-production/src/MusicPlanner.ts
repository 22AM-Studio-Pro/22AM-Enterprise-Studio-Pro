import { ScenePlan } from './DirectorContext';

export class MusicPlanner {
  assignMusicCues(scenes: ScenePlan[]): ScenePlan[] {
    return scenes.map((scene, index) => ({
      ...scene,
      musicCue: this.resolveCue(scene.musicCue, index),
    }));
  }

  private resolveCue(existingCue: string, index: number): string {
    if (existingCue === 'chapter-intro') {
      return 'intro-theme';
    }

    return index % 7 === 0 ? 'transition-sting' : 'ambient-bed';
  }
}
