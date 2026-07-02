import { describe, it, expect } from 'vitest';
import {
  ContentGenerationPipeline,
  InMemoryPipelineStore,
  PipelineCancellationToken,
  PipelineCancelledError,
} from '../ContentGenerationPipeline';
import { ResearchEngine } from '../ResearchEngine';

const request = {
  topic: 'Advanced Robotics',
  goal: 'Explain the production workflow',
  audience: 'engineering leaders',
  tone: 'authoritative',
  language: 'en',
  targetDurationMinutes: 20,
};

describe('ContentGenerationPipeline', () => {
  it('runs the full pipeline from topic to production package', () => {
    const result = new ContentGenerationPipeline().run(request);

    expect(result.productionPackage.research.sources.length).toBeGreaterThan(0);
    expect(result.productionPackage.knowledgeGraph.entities.length).toBeGreaterThan(0);
    expect(result.productionPackage.script.actualWordCount).toBeGreaterThanOrEqual(3000);
    expect(result.qualityGates.every((gate) => gate.passed)).toBe(true);
  });

  it('persists outputs for checkpoint recovery', () => {
    const store = new InMemoryPipelineStore();
    const pipeline = new ContentGenerationPipeline(
      ResearchEngine.createDefault(),
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      store,
    );
    const firstRun = pipeline.run(request, { runId: 'checkpoint-run' });
    const secondRun = pipeline.run(request, { runId: 'checkpoint-run', resumeFromCheckpoint: true });

    expect(firstRun.productionPackage.runId).toBe('checkpoint-run');
    expect(secondRun.recoveredFromCheckpoint).toBe(true);
  });

  it('retries failed steps and can recover', () => {
    let attempts = 0;
    const failingResearchEngine = {
      run: () => {
        attempts += 1;
        if (attempts === 1) {
          throw new Error('research temporarily unavailable');
        }
        return ResearchEngine.createDefault().run(request);
      },
    } as unknown as ResearchEngine;

    const result = new ContentGenerationPipeline(failingResearchEngine).run(request, { maxRetries: 1 });

    expect(attempts).toBe(2);
    expect(result.metrics.retries).toBe(1);
  });

  it('emits progress events for each pipeline stage', () => {
    const result = new ContentGenerationPipeline().run(request);
    const completedSteps = result.progressEvents.filter((event) => event.status === 'completed').map((event) => event.step);

    expect(completedSteps).toEqual(
      expect.arrayContaining([
        'topic',
        'research',
        'knowledge-graph',
        'outline',
        'script',
        'storyboard',
        'prompt-optimization',
        'seo-metadata',
      ]),
    );
  });

  it('supports cancellation before execution', () => {
    const token = new PipelineCancellationToken();
    token.cancel();

    expect(() => new ContentGenerationPipeline().run(request, { cancellationToken: token })).toThrow(
      PipelineCancelledError,
    );
  });

  it('collects pipeline metrics', () => {
    const result = new ContentGenerationPipeline().run(request);

    expect(result.metrics.sceneCount).toBeGreaterThan(0);
    expect(result.metrics.stepDurationsMs.script).toBeGreaterThanOrEqual(0);
  });
});
