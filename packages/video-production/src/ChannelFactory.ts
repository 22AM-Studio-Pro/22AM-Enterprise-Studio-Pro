import { DirectorRequest } from './DirectorContext';

export type PublishPlatform = 'youtube' | 'facebook' | 'tiktok' | 'instagram' | 'twitter' | 'linkedin';

export type PublishFrequency = 'every-hour' | 'every-3-hours' | 'daily' | 'weekly';

export type ChannelNiche =
  | 'history'
  | 'finance'
  | 'science'
  | 'motivation'
  | 'news'
  | 'education'
  | 'documentary'
  | 'technology'
  | 'health'
  | 'travel'
  | 'sports'
  | 'entertainment';

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

export interface PublishSchedule {
  channelId: string;
  frequency: PublishFrequency;
  timezone: string;
  nextPublishAt: Date;
  upcomingSlots: Date[];
}

export interface ChannelProductionPlan {
  channelId: string;
  config: ChannelConfig;
  topicQueue: string[];
  directorRequests: DirectorRequest[];
  publishSchedule: PublishSchedule;
  publishJobs: VideoPublishJob[];
}

const NICHE_TOPICS: Record<ChannelNiche, string[]> = {
  history: [
    'The Rise and Fall of the Roman Empire',
    'World War II Turning Points',
    'The Cold War Explained',
    'Ancient Civilizations of Mesopotamia',
    'The Age of Exploration',
    'The French Revolution',
    'Industrial Revolution Impact',
    'The Space Race',
  ],
  finance: [
    'How the Stock Market Works',
    'Real Estate Investing Basics',
    'Cryptocurrency Explained',
    'Compound Interest Power',
    'Passive Income Strategies',
    'Global Economic Crises',
    'Central Banks and Monetary Policy',
    'Personal Finance Mastery',
  ],
  science: [
    'How Black Holes Form',
    'The Theory of Evolution',
    'Quantum Physics Explained',
    'Climate Change Science',
    'The Human Genome',
    'Artificial Intelligence Foundations',
    'The Periodic Table Decoded',
    'How Vaccines Work',
  ],
  motivation: [
    'The Psychology of Success',
    'Habits of Highly Effective People',
    'Overcoming Adversity',
    'The Power of Mindset',
    'Building Resilience',
    'Goal Setting Frameworks',
    'Morning Routines of Leaders',
    'The Science of Motivation',
  ],
  news: [
    'Global Economic Outlook',
    'Tech Industry Trends',
    'Climate Policy Updates',
    'Geopolitical Tensions Explained',
    'Healthcare Innovations',
    'AI in the Workplace',
    'Space Exploration News',
    'Cybersecurity Threats',
  ],
  education: [
    'How to Learn Anything Fast',
    'The Future of Education',
    'Critical Thinking Skills',
    'Memory Techniques',
    'STEM vs. Humanities',
    'Online Learning Revolution',
    'Emotional Intelligence',
    'Reading Comprehension Strategies',
  ],
  documentary: [
    'Life in the Deep Ocean',
    'The Amazon Rainforest',
    'Megacities of the World',
    'Wildlife Migration Patterns',
    'Ancient Wonders Uncovered',
    'The Psychology of Crime',
    'Hidden Histories',
    'Engineering Marvels',
  ],
  technology: [
    'How the Internet Works',
    'The Rise of AI',
    'Blockchain Technology',
    'Quantum Computing',
    'The Metaverse',
    'Electric Vehicles Revolution',
    'Cybersecurity Explained',
    '5G and Beyond',
  ],
  health: [
    'The Science of Sleep',
    'Nutrition Myths Debunked',
    'Mental Health Awareness',
    'Exercise Science',
    'Gut Health and the Microbiome',
    'The Immune System',
    'Stress Management',
    'Longevity Research',
  ],
  travel: [
    'Hidden Gems of Europe',
    'Solo Travel Guide',
    'Budget Travel Hacks',
    'Cultural Etiquette Around the World',
    'Natural Wonders of the World',
    'Adventure Travel',
    'Food Tourism',
    'Sustainable Travel',
  ],
  sports: [
    'The History of the Olympics',
    'Sports Psychology',
    'Greatest Athletes of All Time',
    'The Business of Sports',
    'Training Science',
    'Sports Nutrition',
    'Iconic Sporting Moments',
    'The Future of Sports',
  ],
  entertainment: [
    'The Golden Age of Hollywood',
    'How Streaming Changed TV',
    'Video Game History',
    'Music Industry Evolution',
    'The Rise of Social Media Influencers',
    'Animated Film Legacy',
    'Behind the Scenes of Blockbusters',
    'The Comedy Legends',
  ],
};

const NICHE_TONE: Record<ChannelNiche, string> = {
  history: 'dramatic',
  finance: 'serious',
  science: 'educational',
  motivation: 'inspirational',
  news: 'serious',
  education: 'educational',
  documentary: 'dramatic',
  technology: 'educational',
  health: 'empathetic',
  travel: 'exciting',
  sports: 'exciting',
  entertainment: 'exciting',
};

export class TopicQueue {
  private readonly topics: string[];

  constructor(niche: ChannelNiche) {
    this.topics = [...(NICHE_TOPICS[niche] ?? [])];
  }

  dequeue(count: number): string[] {
    return this.topics.slice(0, count);
  }

  all(): string[] {
    return [...this.topics];
  }
}

export class ThumbnailPlanner {
  buildPrompt(topic: string, niche: ChannelNiche): string {
    const styles: Record<ChannelNiche, string> = {
      history: 'dramatic cinematic thumbnail with ancient or historical imagery, bold title text, dark atmosphere',
      finance: 'clean professional thumbnail with charts, money imagery, bold yellow and dark blue color scheme',
      science: 'futuristic scientific thumbnail with glowing elements, space or laboratory imagery, blue tones',
      motivation: 'vibrant energetic thumbnail with person silhouette, sunrise, bright orange and yellow tones',
      news: 'bold news-style thumbnail with headline text, serious expression, red and white color scheme',
      education: 'clean educational thumbnail with icons, bright colors, approachable style',
      documentary: 'cinematic documentary thumbnail with natural or urban imagery, muted tones, film grain',
      technology: 'sleek tech thumbnail with circuit board, neon blue glowing elements, dark background',
      health: 'fresh clean health thumbnail with natural imagery, green and white tones, energetic',
      travel: 'vibrant travel thumbnail with scenic landscape, golden hour lighting, wanderlust mood',
      sports: 'action-packed sports thumbnail with athlete in motion, dramatic lighting, high contrast',
      entertainment: 'eye-catching entertainment thumbnail with pop culture elements, vivid colors, fun mood',
    };

    return `${styles[niche]} - topic: "${topic}"`;
  }
}

export class PublishScheduler {
  buildSchedule(channelId: string, config: ChannelConfig): PublishSchedule {
    const now = new Date();
    const nextPublishAt = this.calculateNextSlot(now, config.publishFrequency, config.timezone);
    const upcomingSlots = this.generateUpcomingSlots(nextPublishAt, config.publishFrequency, config.videosPerBatch);

    return {
      channelId,
      frequency: config.publishFrequency,
      timezone: config.timezone,
      nextPublishAt,
      upcomingSlots,
    };
  }

  private calculateNextSlot(from: Date, frequency: PublishFrequency, _timezone: string): Date {
    const next = new Date(from);
    const intervals: Record<PublishFrequency, number> = {
      'every-hour': 60,
      'every-3-hours': 180,
      daily: 1440,
      weekly: 10080,
    };
    next.setMinutes(next.getMinutes() + intervals[frequency]);
    return next;
  }

  private generateUpcomingSlots(firstSlot: Date, frequency: PublishFrequency, count: number): Date[] {
    const slots: Date[] = [];
    const intervals: Record<PublishFrequency, number> = {
      'every-hour': 60,
      'every-3-hours': 180,
      daily: 1440,
      weekly: 10080,
    };
    const intervalMs = intervals[frequency] * 60 * 1000;

    for (let i = 0; i < count; i++) {
      slots.push(new Date(firstSlot.getTime() + i * intervalMs));
    }

    return slots;
  }
}

export class DirectorRequestFactory {
  build(topic: string, config: ChannelConfig): DirectorRequest {
    const tone = NICHE_TONE[config.niche] ?? config.tone;
    return {
      topic,
      goal: `Create an engaging ${config.niche} video for ${config.targetAudience}`,
      audience: config.targetAudience,
      tone,
      language: config.language,
      targetDurationMinutes: config.targetDurationMinutes,
    };
  }
}

export class PublishJobFactory {
  constructor(private readonly thumbnailPlanner: ThumbnailPlanner) {}

  build(topic: string, niche: ChannelNiche, platforms: PublishPlatform[], scheduledAt: Date): VideoPublishJob {
    const id = `job-${topic.toLowerCase().replace(/\s+/g, '-')}-${scheduledAt.getTime()}`;

    return {
      id,
      title: topic,
      description: `Complete guide to ${topic}. Watch to learn everything you need to know.`,
      tags: [niche, ...topic.toLowerCase().split(' ').slice(0, 5)],
      platforms,
      scheduledAt,
      thumbnailPrompt: this.thumbnailPlanner.buildPrompt(topic, niche),
      status: 'pending',
    };
  }
}

export class ChannelFactory {
  constructor(
    private readonly topicQueueFactory: (niche: ChannelNiche) => TopicQueue,
    private readonly requestFactory: DirectorRequestFactory,
    private readonly publishScheduler: PublishScheduler,
    private readonly publishJobFactory: PublishJobFactory,
  ) {}

  buildProductionPlan(channelId: string, config: ChannelConfig): ChannelProductionPlan {
    const topicQueue = this.topicQueueFactory(config.niche);
    const topics = topicQueue.dequeue(config.videosPerBatch);
    const directorRequests = topics.map((topic) => this.requestFactory.build(topic, config));
    const publishSchedule = this.publishScheduler.buildSchedule(channelId, config);

    const publishJobs: VideoPublishJob[] = topics.map((topic, index) =>
      this.publishJobFactory.build(topic, config.niche, config.platforms, publishSchedule.upcomingSlots[index] ?? publishSchedule.nextPublishAt),
    );

    return {
      channelId,
      config,
      topicQueue: topics,
      directorRequests,
      publishSchedule,
      publishJobs,
    };
  }

  static createDefault(): ChannelFactory {
    const thumbnailPlanner = new ThumbnailPlanner();
    return new ChannelFactory(
      (niche) => new TopicQueue(niche),
      new DirectorRequestFactory(),
      new PublishScheduler(),
      new PublishJobFactory(thumbnailPlanner),
    );
  }
}
