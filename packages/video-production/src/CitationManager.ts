import type { Citation, ResearchFact, ResearchSource } from './ResearchEngine';

export class CitationManager {
  createCitations(facts: ResearchFact[], sources: ResearchSource[]): Citation[] {
    const sourceMap = new Map(sources.map((source) => [source.id, source]));

    return facts.map((fact) => {
      const source = sourceMap.get(fact.sourceId);
      const supportingSources = fact.supportingSourceIds
        .map((sourceId) => sourceMap.get(sourceId))
        .filter((entry): entry is ResearchSource => Boolean(entry));
      const reference = source
        ? `[${source.sourceType.toUpperCase()}] ${source.title} — ${source.url}`
        : `Unknown source for ${fact.id}`;

      return {
        factId: fact.id,
        sourceId: fact.sourceId,
        reference,
        anchor: supportingSources.map((entry) => entry.title).join('; '),
      };
    });
  }

  createBibliography(sources: ResearchSource[]): string[] {
    return sources.map(
      (source) => `${source.title} (${source.sourceType}) · trust ${source.trustScore.toFixed(2)} · ${source.url}`,
    );
  }
}
