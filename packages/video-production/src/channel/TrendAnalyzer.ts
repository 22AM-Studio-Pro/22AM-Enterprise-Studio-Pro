import { ChannelNiche } from './ChannelProfile';

export interface TrendingTopic {
  title: string;
  searchVolume: 'high' | 'medium' | 'low';
  competitionLevel: 'low' | 'medium' | 'high';
  evergreen: boolean;
  score: number;
  niche: ChannelNiche;
}

const TRENDING_TOPICS: TrendingTopic[] = [
  { title: 'AI replacing jobs', searchVolume: 'high', competitionLevel: 'medium', evergreen: false, score: 92, niche: 'technology' },
  { title: 'How to retire early', searchVolume: 'high', competitionLevel: 'high', evergreen: true, score: 88, niche: 'finance' },
  { title: 'Ancient mysteries unsolved', searchVolume: 'medium', competitionLevel: 'low', evergreen: true, score: 82, niche: 'history' },
  { title: 'Climate change solutions', searchVolume: 'high', competitionLevel: 'medium', evergreen: false, score: 80, niche: 'science' },
  { title: 'Daily habits that changed my life', searchVolume: 'high', competitionLevel: 'high', evergreen: true, score: 90, niche: 'motivation' },
];

export class TrendAnalyzer {
  getTopics(niche: ChannelNiche, limit = 5): TrendingTopic[] {
    return TRENDING_TOPICS
      .filter((t) => t.niche === niche || t.evergreen)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getBestOpportunities(niche: ChannelNiche): TrendingTopic[] {
    return this.getTopics(niche).filter((t) => t.competitionLevel !== 'high');
  }

  sortByScore(topics: TrendingTopic[]): TrendingTopic[] {
    return [...topics].sort((a, b) => b.score - a.score);
  }

  injectTrending(ideas: { title: string }[], niche: ChannelNiche, count = 2): { title: string }[] {
    const trending = this.getBestOpportunities(niche).slice(0, count).map((t) => ({ title: t.title }));
    return [...trending, ...ideas].slice(0, ideas.length);
  }
}
