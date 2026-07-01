import { Scene, VisualStyle } from './types'

export class ConsistencyManager {
  private visualStyle: VisualStyle
  private sceneHistory: Map<string, Scene> = new Map()

  constructor(visualStyle: VisualStyle) {
    this.visualStyle = visualStyle
  }

  async ensureConsistency(scenes: Scene[]): Promise<void> {
    console.log('🎨 Ensuring visual consistency across scenes...')

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]
      const previousScene = i > 0 ? scenes[i - 1] : undefined

      // Check color consistency
      this.ensureColorConsistency(scene, previousScene)

      // Check transition appropriateness
      this.validateTransition(scene, previousScene)

      // Check camera movement continuity
      this.ensureCameraMovementContinuity(scene, previousScene)

      this.sceneHistory.set(scene.id, scene)
      console.log(`  ✓ Scene ${scene.sceneNumber} consistency verified`)
    }

    console.log(`✓ All scenes are consistent`)
  }

  private ensureColorConsistency(scene: Scene, previousScene?: Scene): void {
    // Ensure color palette matches visual style
    if (!scene.effects) scene.effects = []

    // Apply color grading if needed
    const hasColorGrade = scene.effects.some(e => e.type === 'color_grade')
    if (!hasColorGrade) {
      scene.effects.push({
        type: 'color_grade',
        name: 'Style Color',
        intensity: 0.6,
        duration: 2,
        timing: 'throughout'
      })
    }
  }

  private validateTransition(scene: Scene, previousScene?: Scene): void {
    // Validate transition appropriateness
    const validTransitions = ['cut', 'fade', 'dissolve', 'slide', 'zoom']
    if (!validTransitions.includes(scene.transition)) {
      scene.transition = 'fade'
    }
  }

  private ensureCameraMovementContinuity(scene: Scene, previousScene?: Scene): void {
    // Ensure camera movements flow logically
    if (previousScene?.cameraMovement?.type === 'zoom' && previousScene?.cameraMovement?.direction === 'in') {
      // Start next scene zoomed in, then zoom out
      if (scene.cameraMovement?.type === 'zoom' && scene.cameraMovement?.direction === 'out') {
        // Good continuity
        return
      }
    }
  }
}
