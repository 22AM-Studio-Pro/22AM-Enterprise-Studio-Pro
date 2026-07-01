export type VideoLength = '20min' | '30min' | '45min' | '60min+'

export type Chapter = {
  id: string
  number: number
  title: string
  description: string
  duration: number // seconds
  scenes: Scene[]
  keyPoints: string[]
  narration?: string
}

export type Scene = {
  id: string
  chapterId: string
  sceneNumber: number
  title: string
  description: string
  duration: number // seconds
  narration: string
  imagePrompts: string[]
  videoPrompts: string[]
  transition: TransitionType
  music?: MusicSegment
  subtitles: string[]
  effects: Effect[]
  cameraMovement?: CameraMovement
}

export type TransitionType = 'cut' | 'fade' | 'dissolve' | 'slide' | 'zoom' | 'wipe' | 'morph'

export type CameraMovement = {
  type: 'zoom' | 'pan' | 'tilt' | 'dolly' | 'orbit'
  direction: 'in' | 'out' | 'left' | 'right' | 'up' | 'down'
  duration: number // seconds
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
}

export type Effect = {
  type: string
  name: string
  intensity: number // 0-1
  duration: number // seconds
  timing: 'start' | 'throughout' | 'end'
}

export type MusicSegment = {
  type: 'intro' | 'background' | 'outro' | 'transition'
  duration: number
  intensity: 'low' | 'medium' | 'high'
  mood: string
  volumeLevel: number // 0-1
}

export type VisualStyle = {
  colorPalette: string[]
  fontFamily: string
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3'
  resolution: '720p' | '1080p' | '1440p' | '4k'
  filterStyle?: string
  theme: string
}

export type Storyboard = {
  id: string
  title: string
  topic: string
  videoLength: VideoLength
  estimatedDuration: number // seconds
  chapters: Chapter[]
  visualStyle: VisualStyle
  narrators: Narrator[]
  pace: 'slow' | 'medium' | 'fast'
  music: MusicMetadata
  metadata: StoryboardMetadata
}

export type Narrator = {
  id: string
  name: string
  voice: string
  language: string
  gender?: 'male' | 'female' | 'neutral'
  emotionalTone?: string
}

export type MusicMetadata = {
  genre: string
  mood: string
  tempo: 'slow' | 'medium' | 'fast'
  style: string
}

export type StoryboardMetadata = {
  createdAt: string
  updatedAt: string
  version: number
  author?: string
  tags: string[]
  description?: string
}

export type DirectorContext = {
  topic: string
  videoLength: VideoLength
  targetAudience?: string
  style?: string
  tone?: string
  additionalNotes?: string
}

export type SceneContext = {
  chapterIndex: number
  sceneIndex: number
  chapter: Chapter
  previousScene?: Scene
  nextScene?: Scene
  visualStyle: VisualStyle
}
