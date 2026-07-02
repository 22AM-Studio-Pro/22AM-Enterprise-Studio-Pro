export type ChannelNiche =
  | 'history' | 'finance' | 'science' | 'motivation' | 'news' | 'education'
  | 'documentary' | 'technology' | 'health' | 'travel' | 'sports' | 'entertainment'
  | 'kids' | 'self-improvement';

export type PublishPlatform = 'youtube' | 'facebook' | 'tiktok' | 'instagram' | 'twitter' | 'linkedin';

export interface ChannelProfile {
  id: string;
  name: string;
  niche: ChannelNiche;
  description: string;
  targetAudience: string;
  tone: string;
  language: string;
  targetDurationMinutes: number;
  platforms: PublishPlatform[];
  brandColor: string;
  logoUrl: string;
  watermarkUrl?: string;
  tags: string[];
}

const NICHE_DEFAULTS: Record<ChannelNiche, Pick<ChannelProfile, 'tone' | 'targetDurationMinutes' | 'tags'>> = {
  history: { tone: 'dramatic', targetDurationMinutes: 30, tags: ['history', 'facts', 'educational'] },
  finance: { tone: 'serious', targetDurationMinutes: 20, tags: ['finance', 'money', 'investing'] },
  science: { tone: 'educational', targetDurationMinutes: 25, tags: ['science', 'facts', 'discovery'] },
  motivation: { tone: 'inspirational', targetDurationMinutes: 15, tags: ['motivation', 'success', 'mindset'] },
  news: { tone: 'serious', targetDurationMinutes: 10, tags: ['news', 'current-events', 'world'] },
  education: { tone: 'educational', targetDurationMinutes: 20, tags: ['education', 'learning', 'knowledge'] },
  documentary: { tone: 'dramatic', targetDurationMinutes: 45, tags: ['documentary', 'deep-dive', 'exploration'] },
  technology: { tone: 'educational', targetDurationMinutes: 20, tags: ['tech', 'ai', 'innovation'] },
  health: { tone: 'empathetic', targetDurationMinutes: 15, tags: ['health', 'wellness', 'fitness'] },
  travel: { tone: 'exciting', targetDurationMinutes: 20, tags: ['travel', 'adventure', 'destinations'] },
  sports: { tone: 'exciting', targetDurationMinutes: 15, tags: ['sports', 'athletes', 'performance'] },
  entertainment: { tone: 'exciting', targetDurationMinutes: 15, tags: ['entertainment', 'trending', 'culture'] },
  kids: { tone: 'calm', targetDurationMinutes: 10, tags: ['kids', 'educational', 'fun'] },
  'self-improvement': { tone: 'inspirational', targetDurationMinutes: 20, tags: ['growth', 'habits', 'productivity'] },
};

export function createChannelProfile(
  id: string,
  name: string,
  niche: ChannelNiche,
  overrides: Partial<ChannelProfile> = {},
): ChannelProfile {
  const defaults = NICHE_DEFAULTS[niche];
  return {
    id,
    name,
    niche,
    description: `${name} — your ${niche} channel`,
    targetAudience: 'general audience',
    tone: defaults.tone,
    language: 'en',
    targetDurationMinutes: defaults.targetDurationMinutes,
    platforms: ['youtube'],
    brandColor: '#3B82F6',
    logoUrl: `assets/logos/${id}.png`,
    tags: defaults.tags,
    ...overrides,
  };
}
