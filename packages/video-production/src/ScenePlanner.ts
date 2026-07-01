import { Scene, CameraMovement } from './types'

export class ScenePlanner {
  async planScene(
    topic: string,
    sceneDescription: string,
    duration: number,
    index: number
  ): Promise<Scene> {
    console.log(`📹 Planning scene: ${sceneDescription}`)

    // Determine camera movement
    const cameraMovement = this.determineCameraMovement(index, duration)

    // Generate image/video prompts
    const imagePrompts = this.generateImagePrompts(sceneDescription)
    const videoPrompts = this.generateVideoPrompts(sceneDescription)

    // Decide transition
    const transition = this.decideTransition(index)

    // Plan narration
    const narration = await this.planNarration(sceneDescription, duration)

    return {
      id: `scene-${index}`,
      chapterId: 'chapter-1',
      sceneNumber: index,
      title: sceneDescription,
      description: sceneDescription,
      duration,
      narration,
      imagePrompts,
      videoPrompts,
      transition,
      cameraMovement,
      subtitles: [narration],
      effects: []
    }
  }

  private determineCameraMovement(index: number, duration: number): CameraMovement | undefined {
    const movements: CameraMovement[] = [
      { type: 'zoom', direction: 'in', duration: duration * 0.3, easing: 'easeInOut' },
      { type: 'pan', direction: 'left', duration: duration * 0.4, easing: 'linear' },
      { type: 'zoom', direction: 'out', duration: duration * 0.25, easing: 'easeIn' }
    ]

    return movements[index % movements.length]
  }

  private generateImagePrompts(description: string): string[] {
    return [
      `Professional cinematic image: ${description}`,
      `High quality visual representation of ${description}`,
      `Detailed illustration for ${description}`
    ]
  }

  private generateVideoPrompts(description: string): string[] {
    return [
      `Cinematic video footage: ${description}`,
      `Motion video for ${description}`
    ]
  }

  private decideTransition(index: number): string {
    const transitions = ['cut', 'fade', 'dissolve', 'slide', 'zoom', 'wipe']
    return transitions[index % transitions.length]
  }

  private async planNarration(description: string, duration: number): Promise<string> {
    const wordCount = Math.floor(duration / 2.5) // ~2.5 seconds per 10 words
    return `Narration for: ${description} (approximately ${wordCount} words)`
  }
}
