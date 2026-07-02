export class ThumbnailPromptGenerator {
  generate(topic: string, tonePreset: string, keywords: string[]): string {
    return `${topic}, bold cinematic thumbnail, ${tonePreset} tone, emphasis on ${keywords.slice(0, 3).join(', ')}`;
  }
}
