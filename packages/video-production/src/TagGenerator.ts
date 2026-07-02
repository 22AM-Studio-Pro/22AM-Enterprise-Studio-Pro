export class TagGenerator {
  generate(keywords: string[]): string[] {
    return keywords.map((keyword) => keyword.toLowerCase().replace(/\s+/g, '-')).slice(0, 15);
  }
}
