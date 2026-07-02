import type { ValidatedFact } from './ResearchEngine';

export class NarrativePlanner {
  createHook(topic: string, facts: ValidatedFact[]): string {
    const strongestFact = facts.slice().sort((left, right) => right.confidence - left.confidence)[0];
    return strongestFact
      ? `Open with the sharpest angle on ${topic}: ${strongestFact.statement}`
      : `Open with a compelling promise about why ${topic} matters right now.`;
  }

  createIntroduction(topic: string, facts: ValidatedFact[]): string {
    const supportingThemes = Array.from(new Set(facts.flatMap((fact) => fact.tags))).slice(0, 3);
    return supportingThemes.length > 0
      ? `Frame ${topic} through ${supportingThemes.join(', ')} before expanding the story.`
      : `Frame ${topic} with enough context to orient the audience quickly.`;
  }

  createRecap(topic: string, facts: ValidatedFact[]): string {
    const verifiedCount = facts.filter((fact) => fact.verified).length;
    return `Recap the ${verifiedCount} strongest verified takeaways that explain ${topic}.`;
  }

  createConclusion(topic: string): string {
    return `Close ${topic} with a clear synthesis of the most important ideas and what they mean next.`;
  }

  createCallToAction(topic: string): string {
    return `Invite the audience to keep exploring ${topic} and apply the key takeaway immediately.`;
  }
}
