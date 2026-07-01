import { ResearchFact, ResearchSource, TopicResearchPlan } from './ResearchEngine';

export interface ResearchCollection {
  sources: ResearchSource[];
  facts: ResearchFact[];
}

const BASE_CONFIDENCE = 0.72;
const CONFIDENCE_INCREMENT = 0.06;
const MAX_CONFIDENCE = 0.98;
const RESEARCH_SOURCE_BASE_URL = 'https://sources.22am.local';

export class ResearchManager {
  collect(plan: TopicResearchPlan): ResearchCollection {
    const sources = plan.searchQueries.map((query, index) => ({
      id: `source-${index + 1}`,
      title: `${plan.topic} source ${index + 1}: ${query}`,
      url: `${RESEARCH_SOURCE_BASE_URL}/${encodeURIComponent(plan.topic)}/${index + 1}`,
      sourceType: plan.requiredSourceTypes[index % plan.requiredSourceTypes.length],
    }));

    const facts = sources.map((source, index) => ({
      id: `fact-${index + 1}`,
      statement: `${plan.topic} insight ${index + 1} aligned with goal: ${plan.goal}.`,
      sourceId: source.id,
      confidence: Math.min(MAX_CONFIDENCE, BASE_CONFIDENCE + index * CONFIDENCE_INCREMENT),
    }));

    return { sources, facts };
  }
}
