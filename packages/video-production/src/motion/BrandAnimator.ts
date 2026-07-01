export type LogoAnimation = 'reveal' | 'spin' | 'bounce' | 'pulse' | 'draw' | 'scale-in';
export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface BrandAsset {
  logoUrl: string;
  watermarkUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  channelName: string;
}

export interface LogoAnimationSpec {
  sceneId: string;
  logoUrl: string;
  animation: LogoAnimation;
  durationSeconds: number;
  position: WatermarkPosition;
  opacity: number;
  scale: number;
}

export interface WatermarkSpec {
  sceneId: string;
  imageUrl: string;
  position: WatermarkPosition;
  opacity: number;
  scale: number;
  ffmpegOverlayFilter: string;
}

export interface ChapterCardSpec {
  chapterId: string;
  sceneId: string;
  chapterNumber: number;
  title: string;
  backgroundColor: string;
  textColor: string;
  durationSeconds: number;
  animationIn: 'fade' | 'slide-up' | 'zoom-in';
}

export class BrandAnimator {
  buildLogoAnimation(sceneId: string, asset: BrandAsset, animation: LogoAnimation = 'reveal'): LogoAnimationSpec {
    return {
      sceneId,
      logoUrl: asset.logoUrl,
      animation,
      durationSeconds: 2,
      position: 'top-right',
      opacity: 0.9,
      scale: 1.0,
    };
  }

  buildWatermark(sceneId: string, asset: BrandAsset): WatermarkSpec {
    const imageUrl = asset.watermarkUrl ?? asset.logoUrl;
    const overlayFilter = 'overlay=W-w-20:H-h-20';
    return {
      sceneId,
      imageUrl,
      position: 'bottom-right',
      opacity: 0.4,
      scale: 0.12,
      ffmpegOverlayFilter: overlayFilter,
    };
  }

  buildChapterCard(chapterId: string, sceneId: string, chapterNumber: number, title: string, asset: BrandAsset): ChapterCardSpec {
    return {
      chapterId,
      sceneId,
      chapterNumber,
      title,
      backgroundColor: asset.primaryColor,
      textColor: '#FFFFFF',
      durationSeconds: 3.5,
      animationIn: 'slide-up',
    };
  }

  buildBatchWatermarks(sceneIds: string[], asset: BrandAsset): WatermarkSpec[] {
    return sceneIds.map((id) => this.buildWatermark(id, asset));
  }
}
