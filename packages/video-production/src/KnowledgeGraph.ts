import type { ResearchFact } from './ResearchEngine';
import { EntityExtractor } from './EntityExtractor';
import { RelationshipBuilder } from './RelationshipBuilder';
import { FactStore } from './FactStore';
import { TopicCluster } from './TopicCluster';

export interface GraphEntity {
  id: string;
  name: string;
  mentions: number;
  factIds: string[];
}

export interface GraphRelationship {
  id: string;
  fromId: string;
  toId: string;
  relation: string;
  weight: number;
  factIds: string[];
}

export interface GraphCluster {
  id: string;
  label: string;
  entityIds: string[];
}

export interface KnowledgeGraphResult {
  entities: GraphEntity[];
  relationships: GraphRelationship[];
  facts: ResearchFact[];
  clusters: GraphCluster[];
}

export class KnowledgeGraph {
  constructor(
    private readonly entityExtractor = new EntityExtractor(),
    private readonly relationshipBuilder = new RelationshipBuilder(),
    private readonly factStore = new FactStore(),
    private readonly topicCluster = new TopicCluster(),
  ) {}

  build(facts: ResearchFact[]): KnowledgeGraphResult {
    this.factStore.addMany(facts);
    const uniqueFacts = this.factStore.getAll();
    const entities = this.entityExtractor.extract(uniqueFacts);
    const relationships = this.relationshipBuilder.build(entities, uniqueFacts);
    const clusters = this.topicCluster.cluster(entities, relationships);

    return {
      entities,
      relationships,
      facts: uniqueFacts,
      clusters,
    };
  }
}
