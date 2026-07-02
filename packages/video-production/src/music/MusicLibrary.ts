export type MusicMood = 'uplifting' | 'epic' | 'calm' | 'tense' | 'neutral' | 'melancholic' | 'suspenseful' | 'triumphant';
export type MusicRole = 'intro' | 'outro' | 'background-loop' | 'chapter-theme' | 'transition-sting' | 'sound-effect';
export type MusicSource = 'ai-generated' | 'royalty-free' | 'custom';

export interface MusicTrack {
  id: string;
  title: string;
  role: MusicRole;
  mood: MusicMood;
  source: MusicSource;
  bpm?: number;
  key?: string;
  durationSeconds: number;
  loopable: boolean;
  tags: string[];
  filePath: string;
}

export class MusicLibrary {
  private readonly tracks: MusicTrack[] = [
    { id: 'intro-epic-01', title: 'Epic Opener', role: 'intro', mood: 'epic', source: 'royalty-free', bpm: 120, durationSeconds: 30, loopable: false, tags: ['orchestral', 'cinematic'], filePath: 'music/intro-epic-01.mp3' },
    { id: 'intro-uplifting-01', title: 'Bright Start', role: 'intro', mood: 'uplifting', source: 'royalty-free', bpm: 110, durationSeconds: 30, loopable: false, tags: ['upbeat', 'positive'], filePath: 'music/intro-uplifting-01.mp3' },
    { id: 'outro-uplifting-01', title: 'Resolution', role: 'outro', mood: 'uplifting', source: 'royalty-free', bpm: 100, durationSeconds: 30, loopable: false, tags: ['resolution', 'warm'], filePath: 'music/outro-uplifting-01.mp3' },
    { id: 'bg-calm-01', title: 'Ambient Flow', role: 'background-loop', mood: 'calm', source: 'royalty-free', bpm: 75, durationSeconds: 120, loopable: true, tags: ['ambient', 'subtle'], filePath: 'music/bg-calm-01.mp3' },
    { id: 'bg-epic-01', title: 'Tension Build', role: 'background-loop', mood: 'tense', source: 'royalty-free', bpm: 130, durationSeconds: 90, loopable: true, tags: ['tension', 'build'], filePath: 'music/bg-epic-01.mp3' },
    { id: 'bg-neutral-ai', title: 'AI Ambient', role: 'background-loop', mood: 'neutral', source: 'ai-generated', bpm: 90, durationSeconds: 180, loopable: true, tags: ['ai', 'ambient'], filePath: 'music/bg-neutral-ai.mp3' },
    { id: 'chapter-epic-01', title: 'Chapter Reveal', role: 'chapter-theme', mood: 'epic', source: 'royalty-free', bpm: 120, durationSeconds: 10, loopable: false, tags: ['reveal', 'chapter'], filePath: 'music/chapter-epic-01.mp3' },
    { id: 'sting-01', title: 'Short Transition', role: 'transition-sting', mood: 'neutral', source: 'royalty-free', durationSeconds: 2, loopable: false, tags: ['sting', 'short'], filePath: 'music/sting-01.mp3' },
    { id: 'sting-dramatic-01', title: 'Dramatic Hit', role: 'transition-sting', mood: 'suspenseful', source: 'royalty-free', durationSeconds: 3, loopable: false, tags: ['hit', 'dramatic'], filePath: 'music/sting-dramatic-01.mp3' },
    { id: 'sfx-whoosh-01', title: 'Whoosh', role: 'sound-effect', mood: 'neutral', source: 'royalty-free', durationSeconds: 0.5, loopable: false, tags: ['sfx', 'transition'], filePath: 'sfx/whoosh-01.mp3' },
  ];

  findByRole(role: MusicRole): MusicTrack[] {
    return this.tracks.filter((t) => t.role === role);
  }

  findByMood(mood: MusicMood): MusicTrack[] {
    return this.tracks.filter((t) => t.mood === mood);
  }

  findById(id: string): MusicTrack | undefined {
    return this.tracks.find((t) => t.id === id);
  }

  findBySource(source: MusicSource): MusicTrack[] {
    return this.tracks.filter((t) => t.source === source);
  }

  all(): MusicTrack[] {
    return [...this.tracks];
  }

  addTrack(track: MusicTrack): void {
    this.tracks.push(track);
  }
}
