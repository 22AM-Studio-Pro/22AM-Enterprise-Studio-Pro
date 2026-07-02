import { describe, it, expect } from 'vitest';
import { StoryboardEngine } from '../StoryboardEngine';
import { ScriptEngine } from '../ScriptEngine';
import { OutlineGenerator } from '../OutlineGenerator';
import type { ValidatedFact } from '../ResearchEngine';

const facts: ValidatedFact[] = Array.from({ length: 8 }, (_, index) => ({
  id: `fact-${index + 1}`,
  statement: `Storyboard fact ${index + 1} supports continuity and visual planning.`,
  sourceId: `source-${index + 1}`,
  confidence: 0.84,
  tags: ['visuals', 'continuity'],
  supportingSourceIds: [`source-${index + 1}`],
  citation: {
    factId: `fact-${index + 1}`,
    sourceId: `source-${index + 1}`,
    reference: 'reference',
    anchor: 'anchor',
  },
  confidenceLabel: 'medium',
  verified: true,
}));

const outline = new OutlineGenerator().generate('Documentary Editing', facts, 30);
const script = new ScriptEngine().generate('Documentary Editing', outline, facts, {
  language: 'en',
  tonePreset: 'immersive',
  targetDurationMinutes: 30,
});
const request = {
  topic: 'Documentary Editing',
  goal: 'Teach visual continuity',
  audience: 'creators',
  tone: 'immersive',
  language: 'en',
  targetDurationMinutes: 30,
};

describe('StoryboardEngine', () => {
  it('creates multiple timed scenes', () => {
    const storyboard = new StoryboardEngine().generate(script, outline, request);

    expect(storyboard.scenes.length).toBeGreaterThan(5);
    expect(storyboard.totalDurationSeconds).toBeGreaterThan(0);
  });

  it('assigns scene timing in sequence', () => {
    const storyboard = new StoryboardEngine().generate(script, outline, request);

    expect(storyboard.scenes[0].startTimeSeconds).toBe(0);
    expect(storyboard.scenes[1].startTimeSeconds).toBeGreaterThanOrEqual(
      storyboard.scenes[0].durationSeconds,
    );
  });

  it('maintains continuity between adjacent scenes', () => {
    const storyboard = new StoryboardEngine().generate(script, outline, request);

    expect(storyboard.continuityScore).toBeGreaterThanOrEqual(0.5);
  });
});
