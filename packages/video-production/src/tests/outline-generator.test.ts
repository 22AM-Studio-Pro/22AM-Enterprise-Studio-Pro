import { describe, it, expect } from 'vitest';
import { OutlineGenerator } from '../OutlineGenerator';
import type { ValidatedFact } from '../ResearchEngine';

const facts: ValidatedFact[] = Array.from({ length: 8 }, (_, index) => ({
  id: `fact-${index + 1}`,
  statement: `Validated fact ${index + 1}`,
  sourceId: `source-${index + 1}`,
  confidence: 0.82,
  tags: ['history', 'systems'],
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

describe('OutlineGenerator', () => {
  it('creates required narrative sections', () => {
    const outline = new OutlineGenerator().generate('AI Governance', facts, 30);

    expect(outline.map((section) => section.kind)).toEqual(
      expect.arrayContaining(['hook', 'introduction', 'chapter', 'recap', 'conclusion', 'cta']),
    );
  });

  it('supports duration planning profiles', () => {
    const twenty = new OutlineGenerator().generate('AI Governance', facts, 20);
    const sixty = new OutlineGenerator().generate('AI Governance', facts, 60);

    expect(twenty.filter((section) => section.kind === 'chapter')).toHaveLength(4);
    expect(sixty.filter((section) => section.kind === 'chapter')).toHaveLength(8);
  });

  it('keeps chapter durations balanced', () => {
    const outline = new OutlineGenerator().generate('AI Governance', facts, 45);
    const chapterDurations = outline.filter((section) => section.kind === 'chapter').map((section) => section.targetMinutes);
    const spread = Math.max(...chapterDurations) - Math.min(...chapterDurations);

    expect(spread).toBeLessThanOrEqual(1);
  });
});
