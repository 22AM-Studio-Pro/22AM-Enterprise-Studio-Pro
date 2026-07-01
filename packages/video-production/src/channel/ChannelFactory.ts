import { DirectorRequest } from '../DirectorContext';
import { AutoScheduler, ScheduledContent } from './AutoScheduler';
import { ChannelPlanner } from './ChannelPlanner';
import { ChannelNiche, ChannelProfile, PublishPlatform } from './ChannelProfile';
import { ContentCalendar, ContentCalendarEntry } from './ContentCalendar';
import { PublishFrequency, PublishingPlan, PublishingPlanner } from './PublishingPlanner';
import { ThumbnailPlanner } from './ThumbnailPlanner';
import { TrendAnalyzer } from './TrendAnalyzer';

export interface ChannelConfig {
  niche: ChannelNiche;
  name: string;
  description: string;
  targetAudience: string;
  tone: string;
  language: string;
  platforms: PublishPlatform[];
  publishFrequency: PublishFrequency;
  timezone: string;
  targetDurationMinutes: number;
  videosPerBatch: number;
}

export interface VideoPublishJob {
  id: string;
  title: string;
  description: string;
  tags: string[];
  platforms: PublishPlatform[];
  scheduledAt: Date;
  thumbnailPrompt: string;
  status: 'pending' | 'scheduled' | 'published' | 'failed';
}

export interface ChannelProductionPlan {
  channelId: string;
  config: ChannelConfig;
  topicQueue: string[];
  directorRequests: DirectorRequest[];
  publishingPlan: PublishingPlan;
  contentCalendar: ContentCalendarEntry[];
  scheduledContent: ScheduledContent[];
  publishJobs: VideoPublishJob[];
}

export class DirectorRequestFactory {
  build(topic: string, config: ChannelConfig): DirectorRequest {
    return {
      topic,
      goal: `Create an engaging ${config.niche} video for ${config.targetAudience}`,
      audience: config.targetAudience,
      tone: config.tone,
      language: config.language,
      targetDurationMinutes: config.targetDurationMinutes,
    };
  }
}

export class PublishJobFactory {
  constructor(private readonly thumbnailPlanner: ThumbnailPlanner) {}

  build(topic: string, profile: ChannelProfile, scheduledAt: Date): VideoPublishJob {
    const id = `job-${topic.toLowerCase().replace(/\s+/g, '-')}-${scheduledAt.getTime()}`;
    const thumbnail = this.thumbnailPlanner.build(topic, profile.niche);

    return {
      id,
      title: topic,
      description: `Complete guide to ${topic}. Watch to learn everything you need to know.`,
      tags: [profile.niche, ...topic.toLowerCase().split(' ').slice(0, 5)],
      platforms: profile.platforms,
      scheduledAt,
      thumbnailPrompt: thumbnail.imagePrompt,
      status: 'pending',
    };
  }
}

export class ChannelFactory {
  constructor(
    private readonly planner: ChannelPlanner,
    private readonly trends: TrendAnalyzer,
    private readonly publishingPlanner: PublishingPlanner,
    private readonly calendar: ContentCalendar,
    private readonly scheduler: AutoScheduler,
    private readonly requestFactory: DirectorRequestFactory,
    private readonly jobFactory: PublishJobFactory,
  ) {}

  buildProductionPlan(channelId: string, config: ChannelConfig): ChannelProductionPlan {
    const profile: ChannelProfile = {
      id: channelId,
      name: config.name,
      niche: config.niche,
      description: config.description,
      targetAudience: config.targetAudience,
      tone: config.tone,
      language: config.language,
      targetDurationMinutes: config.targetDurationMinutes,
      platforms: config.platforms,
      brandColor: '#3B82F6',
      logoUrl: `assets/logos/${channelId}.png`,
      tags: [config.niche],
    };

    const contentIdeas = this.planner.getContentIdeas(profile, config.videosPerBatch);
    const trendingTopics = this.trends.getBestOpportunities(profile.niche);
    const mergedIdeas = this.calendar.mergeTrending(contentIdeas, trendingTopics);

    const publishingPlan = this.publishingPlanner.buildPlan(
      profile,
      config.publishFrequency,
      config.timezone,
      config.videosPerBatch,
    );

    const calendarEntries = this.calendar.build(
      mergedIdeas,
      publishingPlan.startDate,
      this.frequencyToMinutes(config.publishFrequency),
    );

    const scheduledContent = this.scheduler.schedule(calendarEntries, publishingPlan);
    const topics = mergedIdeas.map((idea) => idea.title);
    const directorRequests = topics.map((topic) => this.requestFactory.build(topic, config));
    const publishJobs = scheduledContent.map((entry) =>
      this.jobFactory.build(entry.title, profile, entry.slot.scheduledAt),
    );

    return {
      channelId,
      config,
      topicQueue: topics,
      directorRequests,
      publishingPlan,
      contentCalendar: calendarEntries,
      scheduledContent,
      publishJobs,
    };
  }

  static createDefault(): ChannelFactory {
    const thumbnailPlanner = new ThumbnailPlanner();
    return new ChannelFactory(
      new ChannelPlanner(),
      new TrendAnalyzer(),
      new PublishingPlanner(),
      new ContentCalendar(),
      new AutoScheduler(),
      new DirectorRequestFactory(),
      new PublishJobFactory(thumbnailPlanner),
    );
  }

  private frequencyToMinutes(frequency: PublishFrequency): number {
    const frequencyMap: Record<PublishFrequency, number> = {
      'every-hour': 60,
      'every-3-hours': 180,
      'every-6-hours': 360,
      'twice-daily': 720,
      daily: 1440,
      weekly: 10080,
    };

    return frequencyMap[frequency];
  }
}
