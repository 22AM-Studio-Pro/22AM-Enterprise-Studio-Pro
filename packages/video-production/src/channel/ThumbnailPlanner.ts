import { ChannelNiche } from './ChannelProfile';

export interface ThumbnailSpec {
  title: string;
  imagePrompt: string;
  style: string;
  colorScheme: string;
  textOverlay: string;
  overlayPosition: 'top' | 'bottom' | 'left' | 'right';
}

const NICHE_STYLES: Record<ChannelNiche, { style: string; colorScheme: string }> = {
  history: { style: 'dramatic cinematic, film grain, dark atmosphere', colorScheme: 'dark gold on black' },
  finance: { style: 'clean professional, charts, bold typography', colorScheme: 'yellow on dark navy' },
  science: { style: 'futuristic glowing elements, space imagery', colorScheme: 'neon blue on black' },
  motivation: { style: 'vibrant energetic, silhouette, sunrise', colorScheme: 'orange gradient' },
  news: { style: 'bold news-style, serious expression, red banner', colorScheme: 'red and white' },
  education: { style: 'clean bright, icons, approachable', colorScheme: 'blue and yellow' },
  documentary: { style: 'cinematic, natural imagery, muted film tones', colorScheme: 'muted earth tones' },
  technology: { style: 'sleek tech, circuit board, neon glow', colorScheme: 'electric blue on dark' },
  health: { style: 'fresh natural, greens and whites, energetic', colorScheme: 'green and white' },
  travel: { style: 'vibrant landscape, golden hour, wanderlust', colorScheme: 'warm golden tones' },
  sports: { style: 'action shot, dynamic motion blur, high contrast', colorScheme: 'vivid red and black' },
  entertainment: { style: 'pop culture, vivid colors, fun energy', colorScheme: 'bright multicolor' },
  kids: { style: 'colorful, friendly characters, cartoon style', colorScheme: 'rainbow pastels' },
  'self-improvement': { style: 'clean minimal, upward arrow motif, positive', colorScheme: 'purple on white' },
};

export class ThumbnailPlanner {
  build(title: string, niche: ChannelNiche): ThumbnailSpec {
    const style = NICHE_STYLES[niche];
    return {
      title,
      imagePrompt: `${style.style}, thumbnail for video titled "${title}", highly detailed, 1280x720`,
      style: style.style,
      colorScheme: style.colorScheme,
      textOverlay: title.slice(0, 60),
      overlayPosition: 'bottom',
    };
  }

  buildBatch(titles: string[], niche: ChannelNiche): ThumbnailSpec[] {
    return titles.map((t) => this.build(t, niche));
  }
}
