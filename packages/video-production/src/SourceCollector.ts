import type {
  ResearchFact,
  ResearchSource,
  TopicResearchPlan,
} from './ResearchEngine';

export interface ProviderSourceSeed {
  title: string;
  url: string;
  sourceType: string;
  excerpt: string;
  trustScore: number;
  publishedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ProviderFactSeed {
  statement: string;
  sourceUrl: string;
  confidence: number;
  tags?: string[];
}

export interface ProviderResearchPayload {
  sources: ProviderSourceSeed[];
  facts: ProviderFactSeed[];
  simulatedLatencyMs?: number;
}

export interface ResearchProvider {
  name: string;
  timeoutMs: number;
  collect(plan: TopicResearchPlan): ProviderResearchPayload;
}

export interface SourceCollectionResult {
  sources: ResearchSource[];
  facts: ResearchFact[];
  providerAttempts: number;
  retries: number;
  timedOutProviders: string[];
  failedProviders: string[];
}

export class ResearchProviderTimeoutError extends Error {
  constructor(providerName: string, timeoutMs: number) {
    super(`${providerName} exceeded timeout of ${timeoutMs}ms`);
    this.name = 'ResearchProviderTimeoutError';
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'item';
}

function hashSource(seed: ProviderSourceSeed): string {
  return `${slugify(seed.title)}:${slugify(seed.url)}`;
}

export class SourceCollector {
  constructor(
    private readonly providers: ResearchProvider[],
    private readonly maxRetries = 2,
  ) {}

  collect(plan: TopicResearchPlan): SourceCollectionResult {
    const sources: ResearchSource[] = [];
    const facts: ResearchFact[] = [];
    const timedOutProviders: string[] = [];
    const failedProviders: string[] = [];
    let providerAttempts = 0;
    let retries = 0;

    for (const provider of this.providers) {
      let payload: ProviderResearchPayload | undefined;
      let lastError: Error | undefined;

      for (let attempt = 1; attempt <= this.maxRetries + 1; attempt += 1) {
        providerAttempts += 1;

        try {
          const nextPayload = provider.collect(plan);

          if ((nextPayload.simulatedLatencyMs ?? 0) > provider.timeoutMs) {
            throw new ResearchProviderTimeoutError(provider.name, provider.timeoutMs);
          }

          payload = nextPayload;
          if (attempt > 1) {
            retries += attempt - 1;
          }
          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          if (attempt <= this.maxRetries) {
            continue;
          }
        }
      }

      if (!payload) {
        if (lastError instanceof ResearchProviderTimeoutError) {
          timedOutProviders.push(provider.name);
        } else {
          failedProviders.push(provider.name);
        }
        continue;
      }

      const sourceIdByUrl = new Map<string, string>();

      payload.sources.forEach((seed, index) => {
        const sourceId = `${provider.name}-source-${index + 1}-${slugify(seed.title)}`;
        sourceIdByUrl.set(seed.url, sourceId);
        sources.push({
          id: sourceId,
          title: seed.title,
          url: seed.url,
          sourceType: seed.sourceType,
          provider: provider.name,
          excerpt: seed.excerpt,
          trustScore: Math.max(0.1, Math.min(0.99, seed.trustScore)),
          retrievedAt: Date.now(),
          publishedAt: seed.publishedAt,
          contentHash: hashSource(seed),
          metadata: seed.metadata,
        });
      });

      payload.facts.forEach((seed, index) => {
        const sourceId = sourceIdByUrl.get(seed.sourceUrl);
        if (!sourceId) {
          return;
        }

        facts.push({
          id: `${provider.name}-fact-${index + 1}-${slugify(seed.statement).slice(0, 32)}`,
          statement: seed.statement,
          sourceId,
          confidence: Math.max(0.1, Math.min(0.99, seed.confidence)),
          tags: seed.tags ?? plan.topic.split(/\s+/).filter((part) => part.length > 3),
          supportingSourceIds: [sourceId],
        });
      });
    }

    return {
      sources,
      facts,
      providerAttempts,
      retries,
      timedOutProviders,
      failedProviders,
    };
  }
}
