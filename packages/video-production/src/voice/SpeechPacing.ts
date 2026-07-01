export type PacingPreset = 'slow' | 'normal' | 'fast' | 'conversational' | 'presentation' | 'dramatic';

export interface PauseMarker {
  type: 'sentence' | 'paragraph' | 'chapter' | 'emphasis' | 'breath';
  durationMs: number;
  ssmlTag: string;
}

export interface PacingOptions {
  preset: PacingPreset;
  wordsPerMinute?: number;
  sentencePauseMs?: number;
  paragraphPauseMs?: number;
  emphasisPauseMs?: number;
}

export interface PacedText {
  originalText: string;
  ssmlText: string;
  estimatedDurationSeconds: number;
  pauseCount: number;
  wordCount: number;
  effectiveWpm: number;
}

const PRESET_WPM: Record<PacingPreset, number> = {
  slow: 110,
  normal: 140,
  fast: 170,
  conversational: 150,
  presentation: 120,
  dramatic: 95,
};

const PRESET_SENTENCE_PAUSE: Record<PacingPreset, number> = {
  slow: 600,
  normal: 400,
  fast: 200,
  conversational: 300,
  presentation: 500,
  dramatic: 800,
};

const PRESET_PARAGRAPH_PAUSE: Record<PacingPreset, number> = {
  slow: 1200,
  normal: 800,
  fast: 400,
  conversational: 600,
  presentation: 1000,
  dramatic: 1500,
};

export class SpeechPacing {
  processText(text: string, options: PacingOptions): PacedText {
    const wpm = options.wordsPerMinute ?? PRESET_WPM[options.preset];
    const sentencePauseMs = options.sentencePauseMs ?? PRESET_SENTENCE_PAUSE[options.preset];
    const paragraphPauseMs = options.paragraphPauseMs ?? PRESET_PARAGRAPH_PAUSE[options.preset];

    const paragraphs = text.split(/\n{2,}/);
    let totalPauseMs = 0;
    let pauseCount = 0;

    const processedParagraphs = paragraphs.map((paragraph, pIdx) => {
      const sentences = paragraph.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [paragraph];

      const processedSentences = sentences.map((sentence, sIdx) => {
        const trimmed = sentence.trim();
        const isLast = sIdx === sentences.length - 1;
        const pauseMs = isLast ? 0 : sentencePauseMs;

        if (pauseMs > 0) {
          totalPauseMs += pauseMs;
          pauseCount++;
          return `${trimmed}<break time="${pauseMs}ms"/>`;
        }
        return trimmed;
      });

      const paragraphText = processedSentences.join(' ');
      const isLastParagraph = pIdx === paragraphs.length - 1;

      if (!isLastParagraph) {
        totalPauseMs += paragraphPauseMs;
        pauseCount++;
        return `${paragraphText}<break time="${paragraphPauseMs}ms"/>`;
      }
      return paragraphText;
    });

    const ssmlInner = processedParagraphs.join('\n');
    const ssmlText = `<speak>${ssmlInner}</speak>`;

    const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
    const speechDurationSeconds = (wordCount / wpm) * 60;
    const estimatedDurationSeconds = speechDurationSeconds + totalPauseMs / 1000;
    const effectiveWpm = wordCount / (estimatedDurationSeconds / 60);

    return {
      originalText: text,
      ssmlText,
      estimatedDurationSeconds,
      pauseCount,
      wordCount,
      effectiveWpm,
    };
  }

  estimateDuration(text: string, preset: PacingPreset = 'normal'): number {
    const wpm = PRESET_WPM[preset];
    const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
    return (wordCount / wpm) * 60;
  }

  fitToTarget(text: string, targetSeconds: number): PacingOptions {
    const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
    const requiredWpm = (wordCount / targetSeconds) * 60;

    let preset: PacingPreset = 'normal';
    if (requiredWpm < 110) preset = 'slow';
    else if (requiredWpm < 130) preset = 'presentation';
    else if (requiredWpm < 155) preset = 'normal';
    else if (requiredWpm < 165) preset = 'conversational';
    else preset = 'fast';

    return { preset, wordsPerMinute: Math.round(requiredWpm) };
  }

  addEmphasisPauses(ssml: string, keywords: string[], durationMs = 200): string {
    let result = ssml;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
      result = result.replace(regex, `$1<break time="${durationMs}ms"/>`);
    }
    return result;
  }
}
