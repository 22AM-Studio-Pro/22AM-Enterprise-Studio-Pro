import type { ResearchFact, ResearchSource, TopicResearchPlan } from './ResearchEngine';
import { ResearchCache } from './ResearchCache';
import { SourceCollector } from './SourceCollector';
import { WebResearchProvider } from './WebResearchProvider';
import { DocumentResearchProvider } from './DocumentResearchProvider';

export interface ResearchCollection {
  sources: ResearchSource[];
  facts: ResearchFact[];
  cacheHit: boolean;
  providerAttempts: number;
  retries: number;
  timedOutProviders: string[];
  failedProviders: string[];
  collectedAt: number;
}

function normalizeStatement(statement: string): string {
  return statement.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeUrl(url: string): string {
  return url.trim().toLowerCase();
}

export class ResearchManager {
  constructor(
    private readonly collector = new SourceCollector([
      new WebResearchProvider(),
      new DocumentResearchProvider(),
    ]),
    private readonly cache = new ResearchCache<ResearchCollection>(),
  ) {}

  collect(plan: TopicResearchPlan): ResearchCollection {
    const cacheKey = ResearchCache.buildKey([
      plan.topic,
      plan.goal,
      plan.audience,
      ...plan.searchQueries,
      ...(plan.seedDocuments?.map((document) => document.id) ?? []),
    ]);

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return {
        ...cached,
        cacheHit: true,
      };
    }

    const collected = this.collector.collect(plan);
    const sources = this.deduplicateSources(collected.sources);
    const facts = this.deduplicateFacts(collected.facts, sources);
    const result: ResearchCollection = {
      sources,
      facts,
      cacheHit: false,
      providerAttempts: collected.providerAttempts,
      retries: collected.retries,
      timedOutProviders: collected.timedOutProviders,
      failedProviders: collected.failedProviders,
      collectedAt: Date.now(),
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  getCache(): ResearchCache<ResearchCollection> {
    return this.cache;
  }

  private deduplicateSources(sources: ResearchSource[]): ResearchSource[] {
    const byUrl = new Map<string, ResearchSource>();

    sources.forEach((source) => {
      const key = normalizeUrl(source.url);
      const existing = byUrl.get(key);

      if (!existing || source.trustScore > existing.trustScore) {
        byUrl.set(key, source);
      }
    });

    return Array.from(byUrl.values());
  }

  private deduplicateFacts(facts: ResearchFact[], sources: ResearchSource[]): ResearchFact[] {
    const sourceMap = new Map(sources.map((source) => [source.id, source]));
    const uniqueFacts = new Map<string, ResearchFact>();

    facts.forEach((fact) => {
      const key = normalizeStatement(fact.statement);
      const existing = uniqueFacts.get(key);
      const sourceTrust = sourceMap.get(fact.sourceId)?.trustScore ?? 0.7;

      if (!existing) {
        uniqueFacts.set(key, {
          ...fact,
          confidence: Math.min(0.99, fact.confidence * 0.75 + sourceTrust * 0.25),
        });
        return;
      }

      const supportingSourceIds = Array.from(
        new Set([...existing.supportingSourceIds, ...fact.supportingSourceIds, fact.sourceId]),
      );
      const supportingCountBonus = Math.min(0.12, (supportingSourceIds.length - 1) * 0.04);

      uniqueFacts.set(key, {
        ...existing,
        confidence: Math.min(
          0.99,
          Math.max(existing.confidence, fact.confidence, sourceTrust) + supportingCountBonus,
        ),
        supportingSourceIds,
        tags: Array.from(new Set([...(existing.tags ?? []), ...(fact.tags ?? [])])),
      });
    });

    return Array.from(uniqueFacts.values());
  }
}
