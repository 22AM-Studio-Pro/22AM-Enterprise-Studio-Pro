import type { TopicResearchPlan } from './ResearchEngine';
import type { ProviderResearchPayload, ResearchProvider } from './SourceCollector';

const DOC_BASE_URL = 'https://research.22am.local/docs';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'document';
}

export class DocumentResearchProvider implements ResearchProvider {
  readonly name = 'documents';
  readonly timeoutMs: number;

  constructor(timeoutMs = 600) {
    this.timeoutMs = timeoutMs;
  }

  collect(plan: TopicResearchPlan): ProviderResearchPayload {
    const documents = plan.seedDocuments?.length
      ? plan.seedDocuments
      : [
          {
            id: `${slugify(plan.topic)}-primer`,
            title: `${plan.topic} primer`,
            summary: `${plan.topic} primer with historical context and supporting details for ${plan.goal}.`,
          },
          {
            id: `${slugify(plan.topic)}-playbook`,
            title: `${plan.topic} playbook`,
            summary: `${plan.topic} playbook focused on tactical insights for ${plan.audience}.`,
          },
        ];

    const sources = documents.map((document, index) => ({
      title: document.title,
      url: `${DOC_BASE_URL}/${slugify(document.id)}`,
      sourceType: 'document',
      excerpt: document.summary,
      trustScore: 0.81 + index * 0.03,
      metadata: { documentId: document.id },
    }));

    const facts = sources.map((source, index) => ({
      statement:
        index === 0
          ? `${plan.topic} is shaped by a clear timeline of inflection points that matter to ${plan.audience}.`
          : `${plan.topic} documentation highlights durable patterns that support ${plan.goal.toLowerCase()}.`,
      sourceUrl: source.url,
      confidence: 0.79 + index * 0.03,
      tags: [plan.topic, 'document-research', plan.audience],
    }));

    return {
      sources,
      facts,
      simulatedLatencyMs: 80,
    };
  }
}
