import { describe, it, expect } from 'vitest';
import { KnowledgeGraph } from '../KnowledgeGraph';
import type { ResearchFact } from '../ResearchEngine';

const facts: ResearchFact[] = [
  {
    id: 'fact-1',
    statement: 'Tesla expands Battery production across Europe.',
    sourceId: 'source-1',
    confidence: 0.9,
    tags: ['Tesla', 'Battery', 'Europe'],
    supportingSourceIds: ['source-1'],
  },
  {
    id: 'fact-2',
    statement: 'Battery production across Europe improves grid resilience.',
    sourceId: 'source-2',
    confidence: 0.84,
    tags: ['Battery', 'Europe', 'Grid'],
    supportingSourceIds: ['source-2'],
  },
  {
    id: 'fact-3',
    statement: 'Battery production across Europe improves grid resilience.',
    sourceId: 'source-3',
    confidence: 0.8,
    tags: ['Battery', 'Europe', 'Grid'],
    supportingSourceIds: ['source-3'],
  },
];

describe('KnowledgeGraph', () => {
  it('creates a semantic graph from facts', () => {
    const graph = new KnowledgeGraph().build(facts);

    expect(graph.entities.length).toBeGreaterThan(0);
    expect(graph.relationships.length).toBeGreaterThan(0);
    expect(graph.clusters.length).toBeGreaterThan(0);
  });

  it('links entities that co-occur in facts', () => {
    const graph = new KnowledgeGraph().build(facts);
    const relationship = graph.relationships.find((edge) => edge.factIds.includes('fact-1'));

    expect(relationship).toBeDefined();
    expect(relationship?.weight).toBeGreaterThan(0);
  });

  it('deduplicates duplicate facts before graph generation', () => {
    const graph = new KnowledgeGraph().build(facts);

    expect(graph.facts).toHaveLength(2);
  });
});
