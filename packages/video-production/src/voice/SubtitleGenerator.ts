export type SubtitleFormat = 'srt' | 'vtt' | 'ass' | 'json';

export interface SubtitleLine {
  index: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  text: string;
  speakerId?: string;
}

export interface SubtitleTrack {
  format: SubtitleFormat;
  language: string;
  lines: SubtitleLine[];
  totalDurationSeconds: number;
}

export interface SubtitleOptions {
  maxCharsPerLine: number;
  maxLinesPerCue: number;
  minDurationSeconds: number;
  wordsPerMinute: number;
  format: SubtitleFormat;
  language: string;
}

const DEFAULT_OPTIONS: SubtitleOptions = {
  maxCharsPerLine: 42,
  maxLinesPerCue: 2,
  minDurationSeconds: 1.0,
  wordsPerMinute: 140,
  format: 'srt',
  language: 'en',
};

function padTime(n: number, digits: number): string {
  return String(Math.floor(n)).padStart(digits, '0');
}

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
  return `${padTime(h, 2)}:${padTime(m, 2)}:${padTime(s, 2)},${padTime(ms, 3)}`;
}

function formatVttTime(seconds: number): string {
  return formatSrtTime(seconds).replace(',', '.');
}

export class SubtitleGenerator {
  constructor(private readonly options: Partial<SubtitleOptions> = {}) {}

  private getOptions(): SubtitleOptions {
    return { ...DEFAULT_OPTIONS, ...this.options };
  }

  generateFromNarration(narration: string, startTimeSeconds: number, durationSeconds: number): SubtitleLine[] {
    const opts = this.getOptions();
    const words = narration.split(/\s+/).filter((w) => w.length > 0);
    const secondsPerWord = durationSeconds / Math.max(words.length, 1);
    const lines: SubtitleLine[] = [];
    let currentIndex = 1;
    let buffer = '';
    let lineStart = startTimeSeconds;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const candidate = buffer ? `${buffer} ${word}` : word;

      if (candidate.length > opts.maxCharsPerLine && buffer.length > 0) {
        const end = lineStart + buffer.split(' ').length * secondsPerWord;
        lines.push({
          index: currentIndex++,
          startTimeSeconds: lineStart,
          endTimeSeconds: Math.max(end, lineStart + opts.minDurationSeconds),
          text: buffer,
        });
        lineStart = end;
        buffer = word;
      } else {
        buffer = candidate;
      }
    }

    if (buffer.length > 0) {
      lines.push({
        index: currentIndex,
        startTimeSeconds: lineStart,
        endTimeSeconds: startTimeSeconds + durationSeconds,
        text: buffer,
      });
    }

    return lines;
  }

  generateBatch(
    scenes: { id: string; narration: string; startTimeSeconds: number; durationSeconds: number }[],
  ): SubtitleTrack {
    const opts = this.getOptions();
    const allLines: SubtitleLine[] = [];
    let indexOffset = 1;

    for (const scene of scenes) {
      const lines = this.generateFromNarration(scene.narration, scene.startTimeSeconds, scene.durationSeconds).map(
        (line) => ({ ...line, index: line.index + indexOffset - 1 }),
      );
      allLines.push(...lines);
      indexOffset += lines.length;
    }

    const totalDuration = scenes.reduce((sum, s) => Math.max(sum, s.startTimeSeconds + s.durationSeconds), 0);

    return {
      format: opts.format,
      language: opts.language,
      lines: allLines,
      totalDurationSeconds: totalDuration,
    };
  }

  serialize(track: SubtitleTrack): string {
    switch (track.format) {
      case 'srt':
        return this.toSrt(track);
      case 'vtt':
        return this.toVtt(track);
      case 'json':
        return JSON.stringify(track, null, 2);
      default:
        return this.toSrt(track);
    }
  }

  private toSrt(track: SubtitleTrack): string {
    return track.lines
      .map((line) => `${line.index}\n${formatSrtTime(line.startTimeSeconds)} --> ${formatSrtTime(line.endTimeSeconds)}\n${line.text}\n`)
      .join('\n');
  }

  private toVtt(track: SubtitleTrack): string {
    const header = 'WEBVTT\n\n';
    const body = track.lines
      .map((line) => `${formatVttTime(line.startTimeSeconds)} --> ${formatVttTime(line.endTimeSeconds)}\n${line.text}\n`)
      .join('\n');
    return header + body;
  }
}
