import { ChannelProfile, ChannelNiche } from './ChannelProfile';

export interface ContentIdea {
  title: string;
  summary: string;
  estimatedDurationMinutes: number;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
}

const NICHE_IDEAS: Record<ChannelNiche, ContentIdea[]> = {
  history: [
    { title: 'The Rise and Fall of the Roman Empire', summary: 'From republic to empire to collapse', estimatedDurationMinutes: 30, tags: ['rome', 'ancient'], priority: 'high' },
    { title: 'World War II Turning Points', summary: 'Key battles that changed the war', estimatedDurationMinutes: 35, tags: ['ww2', 'war'], priority: 'high' },
    { title: 'The Cold War Explained', summary: 'US vs Soviet Union 1947-1991', estimatedDurationMinutes: 30, tags: ['cold-war', 'politics'], priority: 'medium' },
    { title: 'Ancient Civilizations of Mesopotamia', summary: 'Sumer, Babylon, and Assyria', estimatedDurationMinutes: 25, tags: ['ancient', 'mesopotamia'], priority: 'medium' },
  ],
  finance: [
    { title: 'How the Stock Market Works', summary: 'Complete beginner guide', estimatedDurationMinutes: 20, tags: ['stocks', 'investing'], priority: 'high' },
    { title: 'Real Estate Investing Basics', summary: 'Getting started in property', estimatedDurationMinutes: 25, tags: ['realestate', 'investing'], priority: 'high' },
    { title: 'Compound Interest Explained', summary: 'The eighth wonder of the world', estimatedDurationMinutes: 15, tags: ['compound', 'savings'], priority: 'medium' },
  ],
  science: [
    { title: 'How Black Holes Form', summary: 'From star death to singularity', estimatedDurationMinutes: 25, tags: ['space', 'blackholes'], priority: 'high' },
    { title: 'The Theory of Evolution', summary: "Darwin's legacy explained", estimatedDurationMinutes: 30, tags: ['evolution', 'biology'], priority: 'high' },
  ],
  motivation: [
    { title: 'The Psychology of Success', summary: 'What separates winners from losers', estimatedDurationMinutes: 15, tags: ['success', 'psychology'], priority: 'high' },
    { title: 'Building Unbreakable Habits', summary: 'Atomic habits framework', estimatedDurationMinutes: 20, tags: ['habits', 'productivity'], priority: 'high' },
  ],
  news: [
    { title: 'Global Economic Outlook 2025', summary: 'Key trends shaping the economy', estimatedDurationMinutes: 12, tags: ['economy', 'global'], priority: 'high' },
  ],
  education: [
    { title: 'How to Learn Anything Fast', summary: 'Accelerated learning techniques', estimatedDurationMinutes: 20, tags: ['learning', 'memory'], priority: 'high' },
  ],
  documentary: [
    { title: 'Life in the Deep Ocean', summary: 'Creatures of the abyss', estimatedDurationMinutes: 45, tags: ['ocean', 'nature'], priority: 'high' },
  ],
  technology: [
    { title: 'How the Internet Works', summary: 'From packets to websites', estimatedDurationMinutes: 20, tags: ['internet', 'networking'], priority: 'high' },
    { title: 'The Rise of AI', summary: 'From rule-based to deep learning', estimatedDurationMinutes: 25, tags: ['ai', 'machinelearning'], priority: 'high' },
  ],
  health: [
    { title: 'The Science of Sleep', summary: 'Why sleep is your superpower', estimatedDurationMinutes: 18, tags: ['sleep', 'health'], priority: 'high' },
  ],
  travel: [
    { title: 'Hidden Gems of Europe', summary: 'Lesser-known must-visit destinations', estimatedDurationMinutes: 22, tags: ['europe', 'travel'], priority: 'high' },
  ],
  sports: [
    { title: 'The History of the Olympics', summary: 'Ancient Greece to modern games', estimatedDurationMinutes: 20, tags: ['olympics', 'sports'], priority: 'high' },
  ],
  entertainment: [
    { title: 'The Golden Age of Hollywood', summary: '1930s-1960s cinema history', estimatedDurationMinutes: 20, tags: ['hollywood', 'movies'], priority: 'high' },
  ],
  kids: [
    { title: 'Why is the Sky Blue?', summary: 'Science for young minds', estimatedDurationMinutes: 8, tags: ['science', 'kids'], priority: 'high' },
  ],
  'self-improvement': [
    { title: 'Morning Routines of Successful People', summary: 'Build a powerful morning', estimatedDurationMinutes: 15, tags: ['morning', 'routine'], priority: 'high' },
  ],
};

export class ChannelPlanner {
  getContentIdeas(profile: ChannelProfile, count = 8): ContentIdea[] {
    const ideas = NICHE_IDEAS[profile.niche] ?? [];
    const repeated: ContentIdea[] = [];
    while (repeated.length < count) {
      repeated.push(...ideas);
    }
    return repeated.slice(0, count).sort((a, b) => (a.priority === 'high' ? -1 : 1) - (b.priority === 'high' ? -1 : 1));
  }

  prioritize(ideas: ContentIdea[]): ContentIdea[] {
    return [...ideas].sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 };
      return rank[a.priority] - rank[b.priority];
    });
  }
}
