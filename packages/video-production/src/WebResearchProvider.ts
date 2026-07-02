import type { TopicResearchPlan } from './ResearchEngine';
import type { ProviderResearchPayload, ResearchProvider } from './SourceCollector';

const WEB_BASE_URL = 'https://research.22am.local/web';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'topic';
}

export class WebResearchProvider implements ResearchProvider {
  readonly name = 'web';
  readonly timeoutMs: number;

  constructor(timeoutMs = 800) {
    this.timeoutMs = timeoutMs;
  }

  collect(plan: TopicResearchPlan): ProviderResearchPayload {
    const topicSlug = slugify(plan.topic);
    const sources = plan.searchQueries.map((query, index) => ({
      title: `${plan.topic} web brief ${index + 1}`,
      url: `${WEB_BASE_URL}/${topicSlug}/${index + 1}`,
      sourceType: plan.requiredSourceTypes[index % plan.requiredSourceTypes.length] ?? 'web',
      excerpt: `${query} distilled into a concise research brief for ${plan.audience}.`,
      trustScore: 0.74 + index * 0.04,
      metadata: { query },
    }));

    const facts = sources.map((source, index) => ({
      statement:
        index === 0
          ? `${plan.topic} is shaped by a clear timeline of inflection points that matter to ${plan.audience}.`
          : `${plan.topic} insight ${index + 1} explains why ${plan.goal.toLowerCase()} matters right now.`,
      sourceUrl: source.url,
      confidence: 0.73 + index * 0.04,
      tags: [plan.topic, plan.goal, 'web-research'],
    }));

    return {
      sources,
      facts,
      simulatedLatencyMs: 120,
    };
  }
}
