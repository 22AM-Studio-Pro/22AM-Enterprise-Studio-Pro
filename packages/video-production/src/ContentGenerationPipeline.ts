import type { DirectorRequest } from './DirectorContext';
import { ResearchEngine } from './ResearchEngine';
import { KnowledgeGraph } from './KnowledgeGraph';
import { OutlineGenerator } from './OutlineGenerator';
import { ScriptEngine } from './ScriptEngine';
import { StoryboardEngine } from './StoryboardEngine';
import { PromptOptimizer } from './PromptOptimizer';
import { SEOEngine } from './SEOEngine';
import type { ResearchResult, OutlineSection } from './ResearchEngine';
import type { KnowledgeGraphResult } from './KnowledgeGraph';
import type { GeneratedScript } from './ScriptEngine';
import type { GeneratedStoryboard } from './StoryboardEngine';
import type { SeoMetadataPackage } from './SEOEngine';
import type { SupportedLanguage } from './localization/TranslationManager';

export type PipelineStep =
  | 'topic'
  | 'research'
  | 'knowledge-graph'
  | 'outline'
  | 'script'
  | 'storyboard'
  | 'prompt-optimization'
  | 'seo-metadata';

export interface PipelineProgressEvent {
  step: PipelineStep;
  status: 'started' | 'completed' | 'retried' | 'restored' | 'cancelled';
  attempt: number;
  timestamp: number;
}

export interface PipelineQualityGate {
  name: string;
  passed: boolean;
  details: string;
}

export interface PipelineMetrics {
  totalDurationMs: number;
  retries: number;
  stepDurationsMs: Partial<Record<PipelineStep, number>>;
  sourceCount: number;
  factCount: number;
  entityCount: number;
  sceneCount: number;
  scriptWordCount: number;
}

export interface ContentProductionPackage {
  runId: string;
  research: ResearchResult;
  knowledgeGraph: KnowledgeGraphResult;
  outline: OutlineSection[];
  script: GeneratedScript;
  storyboard: GeneratedStoryboard;
  seo: SeoMetadataPackage;
}

export interface PipelineRunResult {
  productionPackage: ContentProductionPackage;
  progressEvents: PipelineProgressEvent[];
  metrics: PipelineMetrics;
  qualityGates: PipelineQualityGate[];
  recoveredFromCheckpoint: boolean;
}

export interface PipelineRunOptions {
  runId?: string;
  maxRetries?: number;
  resumeFromCheckpoint?: boolean;
  cancellationToken?: PipelineCancellationToken;
}

export interface PipelineStateStore {
  save<T>(runId: string, step: PipelineStep, data: T): void;
  load<T>(runId: string, step: PipelineStep): T | undefined;
}

export class InMemoryPipelineStore implements PipelineStateStore {
  private readonly data = new Map<string, Map<PipelineStep, unknown>>();

  save<T>(runId: string, step: PipelineStep, data: T): void {
    const runData = this.data.get(runId) ?? new Map<PipelineStep, unknown>();
    runData.set(step, data);
    this.data.set(runId, runData);
  }

  load<T>(runId: string, step: PipelineStep): T | undefined {
    return this.data.get(runId)?.get(step) as T | undefined;
  }
}

export class PipelineCancellationToken {
  private cancelled = false;

  cancel(): void {
    this.cancelled = true;
  }

  get isCancelled(): boolean {
    return this.cancelled;
  }
}

export class PipelineCancelledError extends Error {
  constructor(step: PipelineStep) {
    super(`Pipeline cancelled before completing ${step}`);
    this.name = 'PipelineCancelledError';
  }
}

function createRunId(topic: string): string {
  return `${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
}

export class ContentGenerationPipeline {
  constructor(
    private readonly researchEngine = ResearchEngine.createDefault(),
    private readonly knowledgeGraph = new KnowledgeGraph(),
    private readonly outlineGenerator = new OutlineGenerator(),
    private readonly scriptEngine = new ScriptEngine(),
    private readonly storyboardEngine = new StoryboardEngine(),
    private readonly promptOptimizer = new PromptOptimizer(),
    private readonly seoEngine = new SEOEngine(),
    private readonly store: PipelineStateStore = new InMemoryPipelineStore(),
  ) {}

  run(request: DirectorRequest, options: PipelineRunOptions = {}): PipelineRunResult {
    const runId = options.runId ?? createRunId(request.topic);
    const progressEvents: PipelineProgressEvent[] = [];
    const stepDurationsMs: Partial<Record<PipelineStep, number>> = {};
    const startedAt = Date.now();
    let retries = 0;
    let recoveredFromCheckpoint = false;

    const topic = this.executeStep<string>('topic', runId, () => request.topic.trim(), options, progressEvents, stepDurationsMs);
    const research = this.executeStep<ResearchResult>(
      'research',
      runId,
      () => this.researchEngine.run(request),
      options,
      progressEvents,
      stepDurationsMs,
    );
    const graph = this.executeStep<KnowledgeGraphResult>(
      'knowledge-graph',
      runId,
      () => this.knowledgeGraph.build(research.facts),
      options,
      progressEvents,
      stepDurationsMs,
    );
    const outline = this.executeStep<OutlineSection[]>(
      'outline',
      runId,
      () => this.outlineGenerator.generate(topic, research.facts, request.targetDurationMinutes),
      options,
      progressEvents,
      stepDurationsMs,
    );
    const script = this.executeStep<GeneratedScript>(
      'script',
      runId,
      () =>
        this.scriptEngine.generate(topic, outline, research.facts, {
          language: request.language as SupportedLanguage,
          tonePreset: request.tone,
          targetDurationMinutes: request.targetDurationMinutes,
        }),
      options,
      progressEvents,
      stepDurationsMs,
    );
    const storyboard = this.executeStep<GeneratedStoryboard>(
      'storyboard',
      runId,
      () => this.storyboardEngine.generate(script, outline, request),
      options,
      progressEvents,
      stepDurationsMs,
    );
    const optimizedStoryboard = this.executeStep<GeneratedStoryboard>(
      'prompt-optimization',
      runId,
      () => ({
        ...storyboard,
        scenes: this.promptOptimizer.optimizeStoryboardScenes(storyboard.scenes),
      }),
      options,
      progressEvents,
      stepDurationsMs,
    );
    const seo = this.executeStep<SeoMetadataPackage>(
      'seo-metadata',
      runId,
      () => this.seoEngine.generate(topic, outline, research.facts, script, request.tone),
      options,
      progressEvents,
      stepDurationsMs,
    );

    for (const event of progressEvents) {
      if (event.status === 'retried') {
        retries += 1;
      }
      if (event.status === 'restored') {
        recoveredFromCheckpoint = true;
      }
    }

    const productionPackage: ContentProductionPackage = {
      runId,
      research,
      knowledgeGraph: graph,
      outline,
      script,
      storyboard: optimizedStoryboard,
      seo,
    };

    const qualityGates = this.evaluateQuality(productionPackage);
    const metrics: PipelineMetrics = {
      totalDurationMs: Date.now() - startedAt,
      retries,
      stepDurationsMs,
      sourceCount: research.sources.length,
      factCount: research.facts.length,
      entityCount: graph.entities.length,
      sceneCount: optimizedStoryboard.scenes.length,
      scriptWordCount: script.actualWordCount,
    };

    return {
      productionPackage,
      progressEvents,
      metrics,
      qualityGates,
      recoveredFromCheckpoint,
    };
  }

  private executeStep<T>(
    step: PipelineStep,
    runId: string,
    executor: () => T,
    options: PipelineRunOptions,
    progressEvents: PipelineProgressEvent[],
    stepDurationsMs: Partial<Record<PipelineStep, number>>,
  ): T {
    if (options.resumeFromCheckpoint) {
      const restored = this.store.load<T>(runId, step);
      if (restored !== undefined) {
        progressEvents.push({ step, status: 'restored', attempt: 0, timestamp: Date.now() });
        return restored;
      }
    }

    this.assertNotCancelled(step, options.cancellationToken, progressEvents);
    const maxRetries = options.maxRetries ?? 1;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt += 1) {
      progressEvents.push({ step, status: 'started', attempt, timestamp: Date.now() });
      const startedAt = Date.now();

      try {
        const result = executor();
        stepDurationsMs[step] = (stepDurationsMs[step] ?? 0) + (Date.now() - startedAt);
        this.store.save(runId, step, result);
        progressEvents.push({ step, status: 'completed', attempt, timestamp: Date.now() });
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        stepDurationsMs[step] = (stepDurationsMs[step] ?? 0) + (Date.now() - startedAt);

        if (attempt <= maxRetries) {
          progressEvents.push({ step, status: 'retried', attempt, timestamp: Date.now() });
          continue;
        }
      }
    }

    throw lastError ?? new Error(`Unknown pipeline failure on ${step}`);
  }

  private assertNotCancelled(
    step: PipelineStep,
    token: PipelineCancellationToken | undefined,
    progressEvents: PipelineProgressEvent[],
  ): void {
    if (!token?.isCancelled) {
      return;
    }

    progressEvents.push({ step, status: 'cancelled', attempt: 0, timestamp: Date.now() });
    throw new PipelineCancelledError(step);
  }

  private evaluateQuality(productionPackage: ContentProductionPackage): PipelineQualityGate[] {
    return [
      {
        name: 'script-word-count',
        passed:
          productionPackage.script.actualWordCount >= 3000 &&
          productionPackage.script.actualWordCount <= 12000,
        details: `Script has ${productionPackage.script.actualWordCount} words.`,
      },
      {
        name: 'storyboard-continuity',
        passed: productionPackage.storyboard.continuityScore >= 0.5,
        details: `Continuity score ${productionPackage.storyboard.continuityScore.toFixed(2)}.`,
      },
      {
        name: 'seo-title-length',
        passed: productionPackage.seo.title.length <= 100,
        details: `SEO title length ${productionPackage.seo.title.length}.`,
      },
      {
        name: 'research-confidence',
        passed: productionPackage.research.averageConfidence >= 0.72,
        details: `Average confidence ${productionPackage.research.averageConfidence.toFixed(2)}.`,
      },
    ];
  }
}
