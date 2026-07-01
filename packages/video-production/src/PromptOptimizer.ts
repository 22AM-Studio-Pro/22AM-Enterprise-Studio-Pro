export class PromptOptimizer {
  async optimizePrompt(rawPrompt: string, context: string): Promise<string> {
    console.log(`🔍 Optimizing prompt: "${rawPrompt.substring(0, 50)}..."`)

    // Add context
    let optimized = rawPrompt

    // Add quality directives
    if (!optimized.includes('high quality')) {
      optimized += ', high quality, professional'
    }

    // Add cinema directives if needed
    if (context.includes('cinematic')) {
      optimized += ', cinematic lighting, 4k, professional photography'
    }

    // Remove redundant words
    optimized = this.removeRedundancy(optimized)

    // Limit to reasonable length (150 tokens)
    if (optimized.split(' ').length > 150) {
      optimized = optimized.split(' ').slice(0, 150).join(' ')
    }

    console.log(`  ✓ Optimized: "${optimized.substring(0, 50)}..."`)
    return optimized
  }

  private removeRedundancy(prompt: string): string {
    const words = prompt.split(' ')
    const seen = new Set<string>()
    const unique: string[] = []

    for (const word of words) {
      const lower = word.toLowerCase()
      if (!seen.has(lower)) {
        unique.push(word)
        seen.add(lower)
      }
    }

    return unique.join(' ')
  }
}
