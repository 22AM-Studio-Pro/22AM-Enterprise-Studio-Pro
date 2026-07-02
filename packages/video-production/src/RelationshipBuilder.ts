import type { ResearchFact } from './ResearchEngine';
import type { GraphEntity, GraphRelationship } from './KnowledgeGraph';

export class RelationshipBuilder {
  build(entities: GraphEntity[], facts: ResearchFact[]): GraphRelationship[] {
    const relationships = new Map<string, GraphRelationship>();
    const entityIdsByFact = new Map<string, string[]>();

    entities.forEach((entity) => {
      entity.factIds.forEach((factId) => {
        const list = entityIdsByFact.get(factId) ?? [];
        list.push(entity.id);
        entityIdsByFact.set(factId, list);
      });
    });

    facts.forEach((fact) => {
      const entityIds = Array.from(new Set(entityIdsByFact.get(fact.id) ?? []));

      for (let index = 0; index < entityIds.length; index += 1) {
        for (let nextIndex = index + 1; nextIndex < entityIds.length; nextIndex += 1) {
          const fromId = entityIds[index];
          const toId = entityIds[nextIndex];
          const key = [fromId, toId].sort().join('::');
          const existing = relationships.get(key);

          if (existing) {
            existing.weight += 1;
            existing.factIds = Array.from(new Set([...existing.factIds, fact.id]));
            continue;
          }

          relationships.set(key, {
            id: `relationship-${key}`,
            fromId,
            toId,
            relation: 'co-mentioned',
            weight: 1,
            factIds: [fact.id],
          });
        }
      }
    });

    return Array.from(relationships.values());
  }
}
