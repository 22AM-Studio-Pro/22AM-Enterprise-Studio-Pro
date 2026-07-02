import { describe, it, expect } from 'vitest';
import { ScriptEngine } from '../ScriptEngine';
import { OutlineGenerator } from '../OutlineGenerator';
import type { ValidatedFact } from '../ResearchEngine';

const facts: ValidatedFact[] = Array.from({ length: 10 }, (_, index) => ({
  id: `fact-${index + 1}`,
  statement: `Long-form fact ${index + 1} explains a key idea in depth.`,
  sourceId: `source-${index + 1}`,
  confidence: 0.86,
  tags: ['systems', 'analysis'],
  supportingSourceIds: [`source-${index + 1}`],
  citation: {
    factId: `fact-${index + 1}`,
    sourceId: `source-${index + 1}`,
    reference: 'reference',
    anchor: 'anchor',
  },
  confidenceLabel: 'high',
  verified: true,
}));

const outline = new OutlineGenerator().generate('Energy Transition', facts, 20);

describe('ScriptEngine', () => {
  it('meets word count targets for long-form scripts', () => {
    const script = new ScriptEngine().generate('Energy Transition', outline, facts, {
      language: 'en',
      tonePreset: 'confident',
      targetDurationMinutes: 20,
    });

    expect(script.actualWordCount).toBeGreaterThanOrEqual(3000);
    expect(script.actualWordCount).toBeLessThanOrEqual(12000);
  });

  it('supports language switching', () => {
    const english = new ScriptEngine().generate('Energy Transition', outline, facts, {
      language: 'en',
      tonePreset: 'confident',
      targetDurationMinutes: 20,
    });
    const spanish = new ScriptEngine().generate('Energy Transition', outline, facts, {
      language: 'es',
      tonePreset: 'confident',
      targetDurationMinutes: 20,
    });

    expect(english.content).not.toBe(spanish.content);
    expect(spanish.content).toContain('Narrador');
  });

  it('includes explicit transitions between sections', () => {
    const script = new ScriptEngine().generate('Energy Transition', outline, facts, {
      language: 'en',
      tonePreset: 'confident',
      targetDurationMinutes: 20,
    });

    expect(script.sections.some((section) => section.transition?.includes('move from'))).toBe(true);
  });
});
