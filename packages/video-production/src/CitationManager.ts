import { Citation, ResearchFact, ResearchSource } from './ResearchEngine';

export class CitationManager {
  createCitations(facts: ResearchFact[], sources: ResearchSource[]): Citation[] {
    const sourceMap = new Map(sources.map((source) => [source.id, source]));

    return facts.map((fact) => {
      const source = sourceMap.get(fact.sourceId);
      const reference = source
        ? `${source.title} (${source.url})`
        : `Unknown source for ${fact.id}`;

      return {
        factId: fact.id,
        sourceId: fact.sourceId,
        reference,
      };
    });
  }
}
