import { ContentCalendarEntry } from './ContentCalendar';
import { PublishSlot, PublishingPlan } from './PublishingPlanner';

export interface ScheduledContent {
  title: string;
  slot: PublishSlot;
  calendarEntry: ContentCalendarEntry;
}

export class AutoScheduler {
  schedule(entries: ContentCalendarEntry[], plan: PublishingPlan): ScheduledContent[] {
    const groupedByVideo = new Map<number, ContentCalendarEntry>();
    entries.forEach((entry, index) => groupedByVideo.set(index, entry));

    return plan.slots
      .map((slot) => {
        const entry = groupedByVideo.get(slot.videoIndex);
        if (!entry) return undefined;
        return {
          title: entry.idea.title,
          slot,
          calendarEntry: entry,
        };
      })
      .filter((item): item is ScheduledContent => Boolean(item));
  }

  getNext(scheduled: ScheduledContent[], now = new Date()): ScheduledContent | undefined {
    return scheduled.find((entry) => entry.slot.scheduledAt > now);
  }
}
