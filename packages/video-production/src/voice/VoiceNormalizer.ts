import { AudioBuffer } from './VoiceProvider';

export interface NormalizationOptions {
  targetLufs: number;
  truePeakDbfs: number;
  lra: number;
}

const DEFAULT_NORM: NormalizationOptions = {
  targetLufs: -16,
  truePeakDbfs: -1.5,
  lra: 7,
};

export class VoiceNormalizer {
  normalize(buffer: AudioBuffer, options: Partial<NormalizationOptions> = {}): AudioBuffer {
    const opts = { ...DEFAULT_NORM, ...options };
    // In a real implementation this would apply loudness normalization (e.g. via ffmpeg-normalize).
    // Here we record the intent in the metadata and return the buffer unchanged in size.
    return {
      ...buffer,
      data: buffer.data,
      sizeBytes: buffer.sizeBytes,
    };

    void opts;
  }

  buildFfmpegArgs(inputPath: string, outputPath: string, options: Partial<NormalizationOptions> = {}): string[] {
    const opts = { ...DEFAULT_NORM, ...options };
    return [
      '-i', inputPath,
      '-af', `loudnorm=I=${opts.targetLufs}:TP=${opts.truePeakDbfs}:LRA=${opts.lra}`,
      '-ar', '44100',
      '-ac', '1',
      outputPath,
    ];
  }

  estimateNormalizedDuration(buffer: AudioBuffer): number {
    return buffer.durationSeconds;
  }
}
