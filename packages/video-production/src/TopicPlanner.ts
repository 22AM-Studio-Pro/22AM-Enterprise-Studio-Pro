import { TopicResearchPlan } from './ResearchEngine';

export class TopicPlanner {
  createPlan(topic: string, goal: string, audience: string): TopicResearchPlan {
    const normalizedTopic = topic.trim();

    return {
      topic: normalizedTopic,
      goal,
      audience,
      searchQueries: [
        `${normalizedTopic} timeline and key events`,
        `${normalizedTopic} expert analysis`,
        `${normalizedTopic} current impact for ${audience}`,
      ],
      requiredSourceTypes: ['academic', 'news', 'primary', 'industry-report'],
    };
  }
}
