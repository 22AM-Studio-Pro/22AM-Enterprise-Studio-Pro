import { describe, it, expect } from 'vitest';
import { ResearchEngine } from '../ResearchEngine';
import { ResearchManager } from '../ResearchManager';
import { CitationManager } from '../CitationManager';
import { FactValidator } from '../FactValidator';
import { OutlineGenerator } from '../OutlineGenerator';
import { ChapterGenerator } from '../ChapterGenerator';
import { TopicPlanner } from '../TopicPlanner';
import { SourceCollector } from '../SourceCollector';
import { WebResearchProvider } from '../WebResearchProvider';
import { DocumentResearchProvider } from '../DocumentResearchProvider';
import { ResearchCache } from '../ResearchCache';

describe('ResearchEngine', () => {
  it('aggregates research across multiple sources with citations', () => {
    const manager = new ResearchManager(
      new SourceCollector([new WebResearchProvider(), new DocumentResearchProvider()]),
      new ResearchCache(),
    );
    const engine = new ResearchEngine(
      new TopicPlanner(),
      manager,
      new CitationManager(),
      new FactValidator(),
      new OutlineGenerator(),
      new ChapterGenerator(),
    );

    const result = engine.run({
      topic: 'Quantum Computing',
      goal: 'Explain breakthroughs',
      audience: 'tech leaders',
      tone: 'cinematic',
      language: 'en',
      targetDurationMinutes: 30,
    });

    expect(result.sources.length).toBeGreaterThan(1);
    expect(result.facts.length).toBeGreaterThan(1);
    expect(result.citations.every((citation) => citation.reference.includes('http'))).toBe(true);
    expect(Object.keys(result.sourceBreakdown)).toEqual(expect.arrayContaining(['web', 'documents']));
  });

  it('returns cached results for identical plans', () => {
    const manager = new ResearchManager();
    const plan = new TopicPlanner().createPlan('AI Safety', 'Summarize risks', 'operators');
    const first = manager.collect(plan);
    const second = manager.collect(plan);

    expect(first.cacheHit).toBe(false);
    expect(second.cacheHit).toBe(true);
    expect(second.sources).toHaveLength(first.sources.length);
  });

  it('deduplicates duplicate facts from multiple providers', () => {
    const result = new ResearchManager().collect(
      new TopicPlanner().createPlan('Climate Policy', 'Compare strategies', 'policy teams'),
    );

    const normalizedStatements = result.facts.map((fact) => fact.statement.toLowerCase());
    const uniqueStatements = new Set(normalizedStatements);

    expect(result.facts.length).toBe(uniqueStatements.size);
    expect(result.facts.some((fact) => fact.supportingSourceIds.length > 1)).toBe(true);
  });

  it('retries failed providers and continues collecting sources', () => {
    let attempts = 0;
    const flakyProvider = {
      name: 'flaky',
      timeoutMs: 100,
      collect: () => {
        attempts += 1;
        if (attempts === 1) {
          throw new Error('temporary failure');
        }
        return {
          sources: [
            {
              title: 'Flaky source',
              url: 'https://research.22am.local/flaky',
              sourceType: 'news',
              excerpt: 'Recovered after retry',
              trustScore: 0.8,
            },
          ],
          facts: [
            {
              statement: 'Recovered provider contributes usable research.',
              sourceUrl: 'https://research.22am.local/flaky',
              confidence: 0.82,
            },
          ],
        };
      },
    };
    const manager = new ResearchManager(new SourceCollector([flakyProvider as never], 2), new ResearchCache());
    const result = manager.collect(new TopicPlanner().createPlan('Automation', 'Describe recovery', 'operators'));

    expect(attempts).toBe(2);
    expect(result.retries).toBe(1);
    expect(result.sources).toHaveLength(1);
  });
});
