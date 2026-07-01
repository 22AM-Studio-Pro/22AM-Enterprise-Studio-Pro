import { MusicLibrary, MusicMood, MusicTrack } from './MusicLibrary';

export interface SelectionContext {
  mood?: MusicMood;
  durationSeconds?: number;
  preferLoopable?: boolean;
  preferSource?: 'ai-generated' | 'royalty-free' | 'custom';
  tags?: string[];
}

export class MusicSelector {
  constructor(private readonly library: MusicLibrary) {}

  selectBackground(context: SelectionContext): MusicTrack | undefined {
    const candidates = this.library.findByRole('background-loop');
    return this.rank(candidates, context)[0];
  }

  selectIntro(context: SelectionContext): MusicTrack | undefined {
    return this.rank(this.library.findByRole('intro'), context)[0];
  }

  selectOutro(context: SelectionContext): MusicTrack | undefined {
    return this.rank(this.library.findByRole('outro'), context)[0];
  }

  selectChapterTheme(mood?: MusicMood): MusicTrack | undefined {
    return this.library.findByRole('chapter-theme').find((t) => !mood || t.mood === mood) ?? this.library.findByRole('chapter-theme')[0];
  }

  selectTransitionSting(dramatic = false): MusicTrack | undefined {
    const stings = this.library.findByRole('transition-sting');
    return dramatic ? stings.find((t) => t.mood === 'suspenseful') ?? stings[0] : stings.find((t) => t.mood === 'neutral') ?? stings[0];
  }

  private rank(tracks: MusicTrack[], context: SelectionContext): MusicTrack[] {
    return [...tracks].sort((a, b) => this.score(b, context) - this.score(a, context));
  }

  private score(track: MusicTrack, context: SelectionContext): number {
    let score = 0;
    if (context.mood && track.mood === context.mood) score += 10;
    if (context.preferLoopable && track.loopable) score += 5;
    if (context.preferSource && track.source === context.preferSource) score += 3;
    if (context.tags) score += context.tags.filter((tag) => track.tags.includes(tag)).length * 2;
    return score;
  }
}
