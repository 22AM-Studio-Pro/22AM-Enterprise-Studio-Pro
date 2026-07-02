import type { ResearchFact } from './ResearchEngine';

function normalizeStatement(statement: string): string {
  return statement.trim().toLowerCase().replace(/\s+/g, ' ');
}

export class FactStore {
  private readonly facts = new Map<string, ResearchFact>();

  add(fact: ResearchFact): void {
    const key = normalizeStatement(fact.statement);
    const existing = this.facts.get(key);

    if (!existing) {
      this.facts.set(key, fact);
      return;
    }

    this.facts.set(key, {
      ...existing,
      confidence: Math.max(existing.confidence, fact.confidence),
      supportingSourceIds: Array.from(
        new Set([...existing.supportingSourceIds, ...fact.supportingSourceIds, fact.sourceId]),
      ),
      tags: Array.from(new Set([...(existing.tags ?? []), ...(fact.tags ?? [])])),
    });
  }

  addMany(facts: ResearchFact[]): void {
    facts.forEach((fact) => this.add(fact));
  }

  getAll(): ResearchFact[] {
    return Array.from(this.facts.values());
  }
}
