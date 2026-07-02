import type { ResearchFact } from './ResearchEngine';
import type { GraphEntity } from './KnowledgeGraph';

function titleCase(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export class EntityExtractor {
  extract(facts: ResearchFact[]): GraphEntity[] {
    const entities = new Map<string, GraphEntity>();

    facts.forEach((fact) => {
      const tokens = [
        ...fact.tags,
        ...fact.statement
          .split(/[^A-Za-z0-9]+/)
          .map((token) => token.trim())
          .filter((token) => token.length >= 5),
      ];

      tokens.forEach((token) => {
        const name = titleCase(token);
        const id = `entity-${slugify(name)}`;
        const existing = entities.get(id);

        if (existing) {
          existing.mentions += 1;
          existing.factIds = Array.from(new Set([...existing.factIds, fact.id]));
          return;
        }

        entities.set(id, {
          id,
          name,
          mentions: 1,
          factIds: [fact.id],
        });
      });
    });

    return Array.from(entities.values());
  }
}
