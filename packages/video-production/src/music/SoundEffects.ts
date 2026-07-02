export interface SoundEffect {
  id: string;
  name: string;
  filePath: string;
  durationSeconds: number;
  category: 'transition' | 'ambience' | 'impact' | 'notification' | 'ui';
  tags: string[];
}

export class SoundEffects {
  private readonly effects: SoundEffect[] = [
    { id: 'whoosh-01', name: 'Whoosh', filePath: 'sfx/whoosh-01.mp3', durationSeconds: 0.5, category: 'transition', tags: ['fast', 'air'] },
    { id: 'impact-01', name: 'Impact Hit', filePath: 'sfx/impact-01.mp3', durationSeconds: 0.3, category: 'impact', tags: ['hit', 'punch'] },
    { id: 'notification-01', name: 'Chime', filePath: 'sfx/notification-01.mp3', durationSeconds: 1.0, category: 'notification', tags: ['bell', 'alert'] },
    { id: 'ambient-crowd', name: 'Crowd Ambience', filePath: 'sfx/ambient-crowd.mp3', durationSeconds: 30, category: 'ambience', tags: ['crowd', 'background'] },
    { id: 'typing-01', name: 'Keyboard Typing', filePath: 'sfx/typing-01.mp3', durationSeconds: 2.0, category: 'ui', tags: ['keyboard', 'typing'] },
  ];

  findByCategory(category: SoundEffect['category']): SoundEffect[] {
    return this.effects.filter((e) => e.category === category);
  }

  findById(id: string): SoundEffect | undefined {
    return this.effects.find((e) => e.id === id);
  }

  findByTags(tags: string[]): SoundEffect[] {
    return this.effects.filter((e) => tags.some((tag) => e.tags.includes(tag)));
  }

  all(): SoundEffect[] {
    return [...this.effects];
  }
}
