import { ChannelProfile, PublishPlatform } from './ChannelProfile';

export type PublishFrequency = 'every-hour' | 'every-3-hours' | 'every-6-hours' | 'daily' | 'twice-daily' | 'weekly';

export interface PublishSlot {
  scheduledAt: Date;
  platform: PublishPlatform;
  videoIndex: number;
}

export interface PublishingPlan {
  channelId: string;
  frequency: PublishFrequency;
  timezone: string;
  slots: PublishSlot[];
  startDate: Date;
  endDate: Date;
}

const FREQUENCY_MINUTES: Record<PublishFrequency, number> = {
  'every-hour': 60,
  'every-3-hours': 180,
  'every-6-hours': 360,
  'twice-daily': 720,
  daily: 1440,
  weekly: 10080,
};

export class PublishingPlanner {
  buildPlan(
    profile: ChannelProfile,
    frequency: PublishFrequency,
    timezone: string,
    videoCount: number,
    startDate = new Date(),
  ): PublishingPlan {
    const intervalMs = FREQUENCY_MINUTES[frequency] * 60 * 1000;
    const slots: PublishSlot[] = [];

    for (let i = 0; i < videoCount; i++) {
      const scheduledAt = new Date(startDate.getTime() + i * intervalMs);
      for (const platform of profile.platforms) {
        slots.push({ scheduledAt, platform, videoIndex: i });
      }
    }

    const endDate = slots[slots.length - 1]?.scheduledAt ?? startDate;

    return {
      channelId: profile.id,
      frequency,
      timezone,
      slots,
      startDate,
      endDate,
    };
  }

  getNextSlot(plan: PublishingPlan): PublishSlot | undefined {
    const now = new Date();
    return plan.slots.find((s) => s.scheduledAt > now);
  }
}
