import { Chapter, Scene } from './types'

export class SceneScheduler {
  async scheduleScenes(chapters: Chapter[]): Promise<Map<string, Scene[]>> {
    console.log('⏱️ Scheduling scenes...')

    const schedule = new Map<string, Scene[]>()

    for (const chapter of chapters) {
      const scenes = chapter.scenes || []
      schedule.set(chapter.id, scenes)

      // Calculate cumulative duration
      let cumulativeDuration = 0
      for (const scene of scenes) {
        scene.duration = Math.floor(scene.duration)
        cumulativeDuration += scene.duration
        console.log(
          `  • Chapter ${chapter.number}, Scene ${scene.sceneNumber}: ${scene.duration}s (total: ${cumulativeDuration}s)`
        )
      }
    }

    console.log(`✓ All scenes scheduled`)
    return schedule
  }
}
