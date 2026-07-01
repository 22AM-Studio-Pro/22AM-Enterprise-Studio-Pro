import { DirectorRequest } from './DirectorContext';
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
}

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  sourceType: string;
}

export interface ResearchFact {
  id: string;
  statement: string;
  sourceId: string;
  confidence: number;
}

export interface Citation {
  factId: string;
  sourceId: string;
  reference: string;
}

export interface ValidatedFact extends ResearchFact {
  citation: Citation;
  verified: boolean;
}

export interface OutlineSection {
  id: string;
  title: string;
  summary: string;
  factIds: string[];
}

export interface ResearchResult {
  plan: TopicResearchPlan;
  sources: ResearchSource[];
  facts: ValidatedFact[];
  outline: OutlineSection[];
  chapterBlueprints: { title: string; summary: string }[];
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
    const researched = this.researchManager.collect(plan);
    const citations = this.citationManager.createCitations(researched.facts, researched.sources);
    const validatedFacts = this.factValidator.validate(researched.facts, citations);
    const outline = this.outlineGenerator.generate(request.topic, validatedFacts, request.targetDurationMinutes);
    const chapterBlueprints = this.chapterGenerator.generate(outline);

    return {
      plan,
      sources: researched.sources,
      facts: validatedFacts,
      outline,
      chapterBlueprints,
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
