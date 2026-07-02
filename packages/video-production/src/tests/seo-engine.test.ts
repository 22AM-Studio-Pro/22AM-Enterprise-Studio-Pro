import { describe, it, expect } from 'vitest';
import { SEOEngine } from '../SEOEngine';
import { OutlineGenerator } from '../OutlineGenerator';
import { ScriptEngine } from '../ScriptEngine';
import type { ValidatedFact } from '../ResearchEngine';

const facts: ValidatedFact[] = Array.from({ length: 6 }, (_, index) => ({
  id: `fact-${index + 1}`,
  statement: `SEO fact ${index + 1} informs metadata generation.`,
  sourceId: `source-${index + 1}`,
  confidence: 0.83,
  tags: ['seo', 'metadata'],
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

describe('SEOEngine', () => {
  it('produces valid metadata within limits', () => {
    const outline = new OutlineGenerator().generate('Search Optimization', facts, 20);
    const script = new ScriptEngine().generate('Search Optimization', outline, facts, {
      language: 'en',
      tonePreset: 'authoritative',
      targetDurationMinutes: 20,
    });
    const seo = new SEOEngine().generate('Search Optimization', outline, facts, script, 'authoritative');

    expect(seo.title.length).toBeLessThanOrEqual(100);
    expect(seo.description.length).toBeLessThanOrEqual(320);
    expect(seo.keywords.length).toBeGreaterThan(0);
    expect(seo.hashtags.every((tag) => tag.startsWith('#'))).toBe(true);
  });
});
