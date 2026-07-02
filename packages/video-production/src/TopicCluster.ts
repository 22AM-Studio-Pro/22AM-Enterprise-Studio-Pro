import type { GraphCluster, GraphEntity, GraphRelationship } from './KnowledgeGraph';

export class TopicCluster {
  cluster(entities: GraphEntity[], relationships: GraphRelationship[]): GraphCluster[] {
    const adjacency = new Map<string, Set<string>>();

    entities.forEach((entity) => adjacency.set(entity.id, new Set()));
    relationships.forEach((relationship) => {
      adjacency.get(relationship.fromId)?.add(relationship.toId);
      adjacency.get(relationship.toId)?.add(relationship.fromId);
    });

    const visited = new Set<string>();
    const clusters: GraphCluster[] = [];

    entities.forEach((entity) => {
      if (visited.has(entity.id)) {
        return;
      }

      const queue = [entity.id];
      const entityIds: string[] = [];
      visited.add(entity.id);

      while (queue.length > 0) {
        const current = queue.shift()!;
        entityIds.push(current);

        for (const neighbor of adjacency.get(current) ?? []) {
          if (visited.has(neighbor)) {
            continue;
          }

          visited.add(neighbor);
          queue.push(neighbor);
        }
      }

      const representative = entityIds
        .map((entityId) => entities.find((candidate) => candidate.id === entityId))
        .filter((candidate): candidate is GraphEntity => Boolean(candidate))
        .sort((left, right) => right.mentions - left.mentions)[0];

      clusters.push({
        id: `cluster-${clusters.length + 1}`,
        label: representative?.name ?? `Cluster ${clusters.length + 1}`,
        entityIds,
      });
    });

    return clusters;
  }
}
