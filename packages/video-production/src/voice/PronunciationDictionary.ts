export interface PronunciationEntry {
  word: string;
  phoneme: string;
  alphabet: 'ipa' | 'x-sampa';
  language?: string;
}

export interface DictionaryDomain {
  name: string;
  entries: PronunciationEntry[];
}

const GENERAL_ENTRIES: PronunciationEntry[] = [
  { word: 'AI', phoneme: 'eɪ aɪ', alphabet: 'ipa' },
  { word: 'GIF', phoneme: 'dʒɪf', alphabet: 'ipa' },
  { word: 'SQL', phoneme: 'ɛs kjuː ɛl', alphabet: 'ipa' },
  { word: 'NGINX', phoneme: 'ɛn dʒɪnks', alphabet: 'ipa' },
  { word: 'API', phoneme: 'eɪ piː aɪ', alphabet: 'ipa' },
];

const FINANCE_ENTRIES: PronunciationEntry[] = [
  { word: 'NASDAQ', phoneme: 'næz dæk', alphabet: 'ipa' },
  { word: 'NYSE', phoneme: 'ɛn waɪ ɛs iː', alphabet: 'ipa' },
  { word: 'ETF', phoneme: 'iː tiː ɛf', alphabet: 'ipa' },
  { word: 'REIT', phoneme: 'riːt', alphabet: 'ipa' },
];

const SCIENCE_ENTRIES: PronunciationEntry[] = [
  { word: 'RNA', phoneme: 'ɑːr ɛn eɪ', alphabet: 'ipa' },
  { word: 'DNA', phoneme: 'diː ɛn eɪ', alphabet: 'ipa' },
  { word: 'CRISPR', phoneme: 'krɪspər', alphabet: 'ipa' },
];

export class PronunciationDictionary {
  private readonly entries = new Map<string, PronunciationEntry>();

  constructor(domains: DictionaryDomain[] = []) {
    this.loadDomain({ name: 'general', entries: GENERAL_ENTRIES });
    for (const domain of domains) {
      this.loadDomain(domain);
    }
  }

  loadDomain(domain: DictionaryDomain): void {
    for (const entry of domain.entries) {
      this.entries.set(entry.word.toLowerCase(), entry);
    }
  }

  add(word: string, phoneme: string, alphabet: 'ipa' | 'x-sampa' = 'ipa', language?: string): void {
    this.entries.set(word.toLowerCase(), { word, phoneme, alphabet, language });
  }

  lookup(word: string): PronunciationEntry | undefined {
    return this.entries.get(word.toLowerCase());
  }

  findInText(text: string): PronunciationEntry[] {
    const tokens = text.split(/\b/).filter((t) => t.trim().length > 0);
    const seen = new Set<string>();
    const results: PronunciationEntry[] = [];

    for (const token of tokens) {
      const lower = token.toLowerCase();
      if (!seen.has(lower)) {
        const entry = this.entries.get(lower);
        if (entry) {
          results.push(entry);
          seen.add(lower);
        }
      }
    }
    return results;
  }

  applyToSsml(ssml: string): string {
    let result = ssml;
    for (const [word, entry] of this.entries) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(
        regex,
        `<phoneme alphabet="${entry.alphabet}" ph="${entry.phoneme}">${word}</phoneme>`,
      );
    }
    return result;
  }

  static createFinanceDictionary(): PronunciationDictionary {
    return new PronunciationDictionary([{ name: 'finance', entries: FINANCE_ENTRIES }]);
  }

  static createScienceDictionary(): PronunciationDictionary {
    return new PronunciationDictionary([{ name: 'science', entries: SCIENCE_ENTRIES }]);
  }
}
