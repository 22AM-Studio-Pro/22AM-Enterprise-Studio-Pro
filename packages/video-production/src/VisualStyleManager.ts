import { VisualStyle } from './types'

export class VisualStyleManager {
  private globalStyle: VisualStyle

  constructor(style?: VisualStyle) {
    this.globalStyle = style || this.getDefaultStyle()
  }

  setStyle(style: VisualStyle): void {
    this.globalStyle = style
    console.log('🎨 Visual style updated')
  }

  getStyle(): VisualStyle {
    return this.globalStyle
  }

  applyTheme(theme: string): void {
    const themes: Record<string, Partial<VisualStyle>> = {
      modern: {
        colorPalette: ['#ffffff', '#000000', '#0066cc', '#ff6b6b'],
        fontFamily: 'Inter, sans-serif',
        theme: 'modern'
      },
      vintage: {
        colorPalette: ['#8b7355', '#d4a373', '#c9a961', '#1a1a1a'],
        fontFamily: 'Georgia, serif',
        theme: 'vintage',
        filterStyle: 'sepia'
      },
      neon: {
        colorPalette: ['#ff00ff', '#00ffff', '#ffff00', '#000000'],
        fontFamily: 'Arial, sans-serif',
        theme: 'neon',
        filterStyle: 'neon_glow'
      },
      cinematic: {
        colorPalette: ['#1a1a1a', '#cccccc', '#ff6b35', '#004e89'],
        fontFamily: 'Helvetica, sans-serif',
        theme: 'cinematic',
        filterStyle: 'cinematic'
      }
    }

    const selectedTheme = themes[theme] || themes.cinematic
    this.globalStyle = { ...this.globalStyle, ...selectedTheme }
  }

  private getDefaultStyle(): VisualStyle {
    return {
      colorPalette: ['#1a1a1a', '#ffffff', '#0066cc', '#ff6b6b'],
      fontFamily: 'Inter, sans-serif',
      aspectRatio: '16:9',
      resolution: '1080p',
      theme: 'modern',
      filterStyle: 'cinematic'
    }
  }
}
