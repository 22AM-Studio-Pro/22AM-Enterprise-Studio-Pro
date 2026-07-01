import fs from 'fs-extra'

export type Preview = {
  type: 'image' | 'video' | 'audio' | 'text' | 'json'
  content: string | Buffer
  mimeType: string
}

export class PreviewEngine {
  async generatePreview(filePath: string, mimeType: string): Promise<Preview> {
    if (mimeType.startsWith('image/')) {
      const content = await fs.readFile(filePath)
      return { type: 'image', content, mimeType }
    }
    if (mimeType.startsWith('video/')) {
      // Stub: return a placeholder
      return { type: 'video', content: `<video src="file://${filePath}" controls></video>`, mimeType: 'text/html' }
    }
    if (mimeType.startsWith('audio/')) {
      return { type: 'audio', content: `<audio src="file://${filePath}" controls></audio>`, mimeType: 'text/html' }
    }
    if (mimeType === 'application/json') {
      const content = await fs.readFile(filePath, 'utf-8')
      return { type: 'json', content, mimeType: 'application/json' }
    }
    if (mimeType.startsWith('text/')) {
      const content = await fs.readFile(filePath, 'utf-8')
      return { type: 'text', content, mimeType }
    }
    // Default: binary preview stub
    const content = await fs.readFile(filePath)
    return { type: 'text', content: `[Binary content: ${mimeType}]`, mimeType: 'text/plain' }
  }
}
