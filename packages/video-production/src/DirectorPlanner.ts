import { DirectorContext, Storyboard, Chapter, Scene, VisualStyle } from './types'

export class DirectorPlanner {
  private context: DirectorContext
  private chapters: Chapter[] = []
  private totalScenes: number = 0

  constructor(context: DirectorContext) {
    this.context = context
  }

  async planStructure(): Promise<{ chapters: Chapter[]; scenes: Scene[] }> {
    // Plan overall structure
    console.log('📋 Planning video structure...')

    // Determine chapter count based on video length
    const chapterCount = this.determineChapterCount()
    console.log(`• Target chapters: ${chapterCount}`)

    // Plan scenes per chapter
    const scenesPerChapter = this.determineScenesPerChapter()
    console.log(`• Scenes per chapter: ${scenesPerChapter}`)

    // Calculate timing
    this.calculateTiming(chapterCount, scenesPerChapter)

    return {
      chapters: this.chapters,
      scenes: this.chapters.flatMap(ch => ch.scenes)
    }
  }

  private determineChapterCount(): number {
    const map: Record<string, number> = {
      '20min': 5,
      '30min': 6,
      '45min': 8,
      '60min+': 10
    }
    return map[this.context.videoLength] || 6
  }

  private determineScenesPerChapter(): number {
    const map: Record<string, number> = {
      '20min': 3,
      '30min': 4,
      '45min': 5,
      '60min+': 6
    }
    return map[this.context.videoLength] || 4
  }

  private calculateTiming(chapterCount: number, scenesPerChapter: number): void {
    const durationMap: Record<string, number> = {
      '20min': 1200,
      '30min': 1800,
      '45min': 2700,
      '60min+': 3600
    }

    const totalDuration = durationMap[this.context.videoLength]
    const chapterDuration = Math.floor(totalDuration / chapterCount)
    const sceneDuration = Math.floor(chapterDuration / scenesPerChapter)

    for (let i = 0; i < chapterCount; i++) {
      this.chapters.push({
        id: `chapter-${i}`,
        number: i + 1,
        title: `Chapter ${i + 1}`,
        description: '',
        duration: chapterDuration,
        scenes: [],
        keyPoints: [],
        narration: undefined
      })
    }
  }
}
