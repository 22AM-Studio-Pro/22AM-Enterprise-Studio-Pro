export interface MixTrackInput {
  id: string;
  filePath: string;
  startTimeSeconds: number;
  volumeDb: number;
  filters?: string[];
}

export interface MixOutput {
  ffmpegCommand: string[];
  outputPath: string;
}

export class MusicMixer {
  buildMixCommand(tracks: MixTrackInput[], outputPath: string, totalDurationSeconds: number): MixOutput {
    const inputs = tracks.flatMap((t) => ['-i', t.filePath]);
    const filterParts = tracks.map((t, i) => {
      const vol = Math.pow(10, t.volumeDb / 20).toFixed(4);
      const delay = Math.round(t.startTimeSeconds * 1000);
      const extraFilters = t.filters ? t.filters.join(',') : '';
      const base = `[${i}]volume=${vol},adelay=${delay}|${delay}${extraFilters ? `,${extraFilters}` : ''}[a${i}]`;
      return base;
    });

    const mixInputs = tracks.map((_, i) => `[a${i}]`).join('');
    const filterComplex = `${filterParts.join(';')};${mixInputs}amix=inputs=${tracks.length}:duration=longest[out]`;

    return {
      ffmpegCommand: [
        'ffmpeg',
        ...inputs,
        '-filter_complex', filterComplex,
        '-map', '[out]',
        '-t', String(totalDurationSeconds),
        '-c:a', 'aac',
        '-b:a', '192k',
        outputPath,
      ],
      outputPath,
    };
  }

  buildNormalizeCommand(inputPath: string, outputPath: string, targetLufs = -16): string[] {
    return [
      'ffmpeg', '-i', inputPath,
      '-af', `loudnorm=I=${targetLufs}:TP=-1.5:LRA=7`,
      '-c:a', 'aac', '-b:a', '192k',
      outputPath,
    ];
  }
}
