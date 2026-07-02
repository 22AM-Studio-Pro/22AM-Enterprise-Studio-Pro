import type { DirectorRequest } from './DirectorContext';
import { TopicPlanner } from './TopicPlanner';
import { ResearchManager } from './ResearchManager';
import { CitationManager } from './CitationManager';
import { FactValidator } from './FactValidator';
import { OutlineGenerator } from './OutlineGenerator';
import { ChapterGenerator } from './ChapterGenerator';

export interface TopicResearchPlan {
  topic: string;
  goal: string;
  audience: string;
  searchQueries: string[];
  requiredSourceTypes: string[];
  targetDurationMinutes?: number;
  seedDocuments?: ResearchDocument[];
}

export interface ResearchDocument {
  id: string;
  title: string;
  summary: string;
}

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  sourceType: string;
  provider: string;
  excerpt: string;
  trustScore: number;
  retrievedAt: number;
  publishedAt?: string;
  contentHash: string;
  metadata?: Record<string, unknown>;
}

export interface ResearchFact {
  id: string;
  statement: string;
  sourceId: string;
  confidence: number;
  tags: string[];
  supportingSourceIds: string[];
}

export interface Citation {
  factId: string;
  sourceId: string;
  reference: string;
  anchor: string;
}

export interface ValidatedFact extends ResearchFact {
  citation: Citation;
  verified: boolean;
  confidenceLabel: 'high' | 'medium' | 'low';
}

export interface OutlineSection {
  id: string;
  title: string;
  summary: string;
  factIds: string[];
  kind: 'hook' | 'introduction' | 'chapter' | 'recap' | 'conclusion' | 'cta';
  targetMinutes: number;
  order: number;
}

export interface ResearchResult {
  plan: TopicResearchPlan;
  sources: ResearchSource[];
  facts: ValidatedFact[];
  outline: OutlineSection[];
  chapterBlueprints: { title: string; summary: string }[];
  citations: Citation[];
  sourceBreakdown: Record<string, number>;
  averageConfidence: number;
  cacheHit: boolean;
}

export class ResearchEngine {
  constructor(
    private readonly topicPlanner: TopicPlanner,
    private readonly researchManager: ResearchManager,
    private readonly citationManager: CitationManager,
    private readonly factValidator: FactValidator,
    private readonly outlineGenerator: OutlineGenerator,
    private readonly chapterGenerator: ChapterGenerator,
  ) {}

  run(request: DirectorRequest): ResearchResult {
    const plan = this.topicPlanner.createPlan(request.topic, request.goal, request.audience);
    plan.targetDurationMinutes = request.targetDurationMinutes;
    const researched = this.researchManager.collect(plan);
    const citations = this.citationManager.createCitations(researched.facts, researched.sources);
    const validatedFacts = this.factValidator.validate(researched.facts, citations);
    const outline = this.outlineGenerator.generate(
      request.topic,
      validatedFacts,
      request.targetDurationMinutes,
    );
    const chapterBlueprints = this.chapterGenerator.generate(outline);
    const sourceBreakdown = researched.sources.reduce<Record<string, number>>((accumulator, source) => {
      accumulator[source.provider] = (accumulator[source.provider] ?? 0) + 1;
      return accumulator;
    }, {});
    const averageConfidence =
      validatedFacts.length === 0
        ? 0
        : validatedFacts.reduce((total, fact) => total + fact.confidence, 0) / validatedFacts.length;

    return {
      plan,
      sources: researched.sources,
      facts: validatedFacts,
      outline,
      chapterBlueprints,
      citations,
      sourceBreakdown,
      averageConfidence,
      cacheHit: researched.cacheHit,
    };
  }

  static createDefault(): ResearchEngine {
    return new ResearchEngine(
      new TopicPlanner(),
      new ResearchManager(),
      new CitationManager(),
      new FactValidator(),
      new OutlineGenerator(),
      new ChapterGenerator(),
    );
  }
}
