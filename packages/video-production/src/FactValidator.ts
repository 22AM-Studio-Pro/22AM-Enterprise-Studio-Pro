import { Citation, ResearchFact, ValidatedFact } from './ResearchEngine';

const MIN_CONFIDENCE_SCORE = 0.7;

export class FactValidator {
  validate(facts: ResearchFact[], citations: Citation[]): ValidatedFact[] {
    const citationMap = new Map(citations.map((citation) => [citation.factId, citation]));

    return facts.map((fact) => {
      const citation = citationMap.get(fact.id);

      return {
        ...fact,
        citation: citation ?? {
          factId: fact.id,
          sourceId: fact.sourceId,
          reference: 'Missing citation',
        },
        verified: fact.confidence >= MIN_CONFIDENCE_SCORE && Boolean(citation),
      };
    });
  }
}
