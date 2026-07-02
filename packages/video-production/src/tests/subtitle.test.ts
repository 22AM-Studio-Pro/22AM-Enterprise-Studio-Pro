import { describe, it, expect, beforeEach } from 'vitest';
import { SubtitleGenerator } from '../voice/SubtitleGenerator';

describe('SubtitleGenerator', () => {
  let gen: SubtitleGenerator;

  beforeEach(() => {
    gen = new SubtitleGenerator({ maxCharsPerLine: 42, language: 'en', format: 'srt' });
  });

  it('generates subtitle lines from narration', () => {
    const lines = gen.generateFromNarration(
      'Welcome to this video. Today we will explore the history of ancient civilizations around the world.',
      0,
      15,
    );
    expect(lines.length).toBeGreaterThan(0);
    expect(lines[0].startTimeSeconds).toBe(0);
    expect(lines[lines.length - 1].endTimeSeconds).toBeLessThanOrEqual(16);
  });

  it('respects maxCharsPerLine', () => {
    const lines = gen.generateFromNarration(
      'This is a very long sentence that should be split across multiple subtitle lines for readability and display.',
      0,
      20,
    );
    for (const line of lines) {
      expect(line.text.length).toBeLessThanOrEqual(60);
    }
  });

  it('generates SRT format output', () => {
    const track = gen.generateBatch([
      { id: 's1', narration: 'Hello world.', startTimeSeconds: 0, durationSeconds: 5 },
      { id: 's2', narration: 'Welcome to the show.', startTimeSeconds: 5, durationSeconds: 6 },
    ]);
    const srt = gen.serialize(track);
    expect(srt).toContain('-->');
    expect(srt).toContain('Hello');
  });

  it('generates VTT format output', () => {
    const vttGen = new SubtitleGenerator({ format: 'vtt', language: 'en' });
    const track = vttGen.generateBatch([
      { id: 's1', narration: 'Test line one.', startTimeSeconds: 0, durationSeconds: 4 },
    ]);
    const vtt = vttGen.serialize(track);
    expect(vtt).toContain('WEBVTT');
    expect(vtt).toContain('-->');
  });

  it('generates JSON format output', () => {
    const jsonGen = new SubtitleGenerator({ format: 'json', language: 'en' });
    const track = jsonGen.generateBatch([
      { id: 's1', narration: 'Hello.', startTimeSeconds: 0, durationSeconds: 2 },
    ]);
    const json = jsonGen.serialize(track);
    const parsed = JSON.parse(json);
    expect(parsed.format).toBe('json');
    expect(Array.isArray(parsed.lines)).toBe(true);
  });

  it('sets correct language on the track', () => {
    const esGen = new SubtitleGenerator({ language: 'es', format: 'srt' });
    const track = esGen.generateBatch([
      { id: 's1', narration: 'Hola mundo.', startTimeSeconds: 0, durationSeconds: 3 },
    ]);
    expect(track.language).toBe('es');
  });

  it('handles empty narration gracefully', () => {
    const lines = gen.generateFromNarration('', 0, 5);
    expect(lines).toHaveLength(0);
  });

  it('returns totalDurationSeconds matching last scene end', () => {
    const track = gen.generateBatch([
      { id: 's1', narration: 'Scene one.', startTimeSeconds: 0, durationSeconds: 10 },
      { id: 's2', narration: 'Scene two.', startTimeSeconds: 10, durationSeconds: 10 },
    ]);
    expect(track.totalDurationSeconds).toBe(20);
  });

  it('assigns incrementing indices to lines', () => {
    const track = gen.generateBatch([
      { id: 's1', narration: 'Line one text here.', startTimeSeconds: 0, durationSeconds: 5 },
      { id: 's2', narration: 'Line two text here.', startTimeSeconds: 5, durationSeconds: 5 },
    ]);
    const indices = track.lines.map((l) => l.index);
    for (let i = 0; i < indices.length; i++) {
      expect(indices[i]).toBe(i + 1);
    }
  });
});
