import { Scene } from './types'

export class QualityController {
  async validateScene(scene: Scene): Promise<{ isValid: boolean; issues: string[] }> {
    console.log(`🔍 Validating scene: ${scene.title}`)

    const issues: string[] = []

    // Check required fields
    if (!scene.narration) issues.push('Missing narration')
    if (!scene.imagePrompts || scene.imagePrompts.length === 0) issues.push('No image prompts')
    if (!scene.videoPrompts || scene.videoPrompts.length === 0) issues.push('No video prompts')
    if (scene.duration <= 0) issues.push('Invalid duration')

    // Check narration length vs duration
    const expectedWords = Math.floor(scene.duration / 2.5)
    const actualWords = scene.narration.split(' ').length
    if (actualWords > expectedWords * 1.5) {
      issues.push(`Narration too long: ${actualWords} words for ${scene.duration}s`)
    }

    // Check effects
    if (!scene.effects || scene.effects.length === 0) {
      console.log('  ⚠️ No effects defined, adding default')
      scene.effects = [
        {
          type: 'color_grade',
          name: 'Default',
          intensity: 0.5,
          duration: 2,
          timing: 'throughout'
        }
      ]
    }

    const isValid = issues.length === 0
    console.log(`  ${isValid ? '✓' : '⚠️'} Validation ${isValid ? 'passed' : 'failed'}: ${issues.length} issues`)

    return { isValid, issues }
  }

  async validateStoryboard(
    scenes: Scene[]
  ): Promise<{ isValid: boolean; totalIssues: number; sceneIssues: Map<string, string[]> }> {
    console.log('🎬 Validating entire storyboard...')

    let totalIssues = 0
    const sceneIssues = new Map<string, string[]>()

    for (const scene of scenes) {
      const result = await this.validateScene(scene)
      if (!result.isValid) {
        sceneIssues.set(scene.id, result.issues)
        totalIssues += result.issues.length
      }
    }

    const isValid = totalIssues === 0
    console.log(`✓ Storyboard validation complete: ${totalIssues} total issues`)

    return { isValid, totalIssues, sceneIssues }
  }
}
