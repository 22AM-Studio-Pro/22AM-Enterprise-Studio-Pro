export type EncodingPreset = 'ultrafast' | 'superfast' | 'veryfast' | 'fast' | 'medium' | 'slow' | 'veryslow';
export type VideoResolution = '720p' | '1080p' | '1440p' | '4k' | '8k';
export type VideoCodec = 'h264' | 'h265' | 'vp9' | 'av1';

export interface EncodingProfile {
  preset: EncodingPreset;
  crf: number;
  codec: VideoCodec;
  resolution: VideoResolution;
  targetBitrateKbps?: number;
  audioBitrateKbps: number;
  hwAcceleration: boolean;
  hwCodec?: string;
}

const RESOLUTION_FILTERS: Record<VideoResolution, string> = {
  '720p': 'scale=1280:720',
  '1080p': 'scale=1920:1080',
  '1440p': 'scale=2560:1440',
  '4k': 'scale=3840:2160',
  '8k': 'scale=7680:4320',
};

export class EncodingOptimizer {
  selectProfile(totalMinutes: number, targetResolution: VideoResolution = '1080p'): EncodingProfile {
    if (totalMinutes >= 60) {
      return { preset: 'fast', crf: 23, codec: 'h264', resolution: targetResolution, audioBitrateKbps: 192, hwAcceleration: true, hwCodec: 'h264_nvenc' };
    }
    if (totalMinutes >= 30) {
      return { preset: 'medium', crf: 20, codec: 'h264', resolution: targetResolution, audioBitrateKbps: 192, hwAcceleration: true, hwCodec: 'h264_nvenc' };
    }
    return { preset: 'slow', crf: 18, codec: 'h264', resolution: targetResolution, audioBitrateKbps: 320, hwAcceleration: false };
  }

  buildFfmpegArgs(inputPath: string, outputPath: string, profile: EncodingProfile): string[] {
    const videoFilter = RESOLUTION_FILTERS[profile.resolution];
    const codec = profile.hwAcceleration && profile.hwCodec ? profile.hwCodec : `lib${profile.codec}`;
    const crf = profile.hwAcceleration ? [] : ['-crf', String(profile.crf)];

    return [
      'ffmpeg',
      ...(profile.hwAcceleration ? ['-hwaccel', 'auto'] : []),
      '-i', inputPath,
      '-vf', videoFilter,
      '-c:v', codec,
      '-preset', profile.preset,
      ...crf,
      '-c:a', 'aac',
      '-b:a', `${profile.audioBitrateKbps}k`,
      '-movflags', '+faststart',
      outputPath,
    ];
  }

  estimateSizeBytes(durationSeconds: number, profile: EncodingProfile): number {
    const bitrateKbps = profile.targetBitrateKbps ?? (profile.crf <= 18 ? 8000 : profile.crf <= 22 ? 5000 : 3500);
    return Math.round((bitrateKbps * 1000 * durationSeconds) / 8);
  }
}
