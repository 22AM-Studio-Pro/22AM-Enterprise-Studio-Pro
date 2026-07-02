import { ContentIdea } from './ChannelPlanner';
import { TrendingTopic } from './TrendAnalyzer';

export interface ContentCalendarEntry {
  slotDate: Date;
  idea: ContentIdea;
  source: 'planned' | 'trending';
  trendScore?: number;
}

export class ContentCalendar {
  mergeTrending(ideas: ContentIdea[], trends: TrendingTopic[], maxTrending = 2): ContentIdea[] {
    const trendIdeas: ContentIdea[] = trends.slice(0, maxTrending).map((trend) => ({
      title: trend.title,
      summary: `Trending topic for ${trend.niche}`,
      estimatedDurationMinutes: 15,
      tags: [trend.niche, 'trending'],
      priority: 'high',
    }));

    return [...trendIdeas, ...ideas].slice(0, ideas.length);
  }

  build(ideas: ContentIdea[], startDate: Date, intervalMinutes: number): ContentCalendarEntry[] {
    return ideas.map((idea, index) => ({
      slotDate: new Date(startDate.getTime() + index * intervalMinutes * 60 * 1000),
      idea,
      source: index < 2 ? 'trending' : 'planned',
    }));
  }
}
