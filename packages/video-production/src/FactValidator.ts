import type { Citation, ResearchFact, ValidatedFact } from './ResearchEngine';

const MIN_CONFIDENCE_SCORE = 0.72;

function resolveConfidenceLabel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.85) {
    return 'high';
  }

  if (confidence >= MIN_CONFIDENCE_SCORE) {
    return 'medium';
  }

  return 'low';
}

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
          anchor: '',
        },
        confidenceLabel: resolveConfidenceLabel(fact.confidence),
        verified: fact.confidence >= MIN_CONFIDENCE_SCORE && Boolean(citation),
      };
    });
  }
}
