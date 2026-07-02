export type Emotion = 'neutral' | 'excited' | 'serious' | 'empathetic' | 'inspirational' | 'dramatic' | 'calm' | 'urgent';

export interface EmotionProfile {
  emotion: Emotion;
  pitchShiftSemitones: number;
  speakingRateMultiplier: number;
  volumeGainDb: number;
  ssmlStyle?: string;
  keywords: string[];
}

export interface EmotionCue {
  sceneId: string;
  emotion: Emotion;
  intensity: number; // 0-1
  transitionSeconds: number;
}

const EMOTION_PROFILES: Record<Emotion, EmotionProfile> = {
  neutral: {
    emotion: 'neutral',
    pitchShiftSemitones: 0,
    speakingRateMultiplier: 1.0,
    volumeGainDb: 0,
    keywords: [],
  },
  excited: {
    emotion: 'excited',
    pitchShiftSemitones: 2,
    speakingRateMultiplier: 1.1,
    volumeGainDb: 1,
    ssmlStyle: 'excited',
    keywords: ['amazing', 'incredible', 'shocking', 'breaking', 'massive', 'record'],
  },
  serious: {
    emotion: 'serious',
    pitchShiftSemitones: -2,
    speakingRateMultiplier: 0.9,
    volumeGainDb: -1,
    ssmlStyle: 'serious',
    keywords: ['warning', 'crisis', 'danger', 'critical', 'urgent', 'threat'],
  },
  empathetic: {
    emotion: 'empathetic',
    pitchShiftSemitones: 0,
    speakingRateMultiplier: 0.95,
    volumeGainDb: -0.5,
    ssmlStyle: 'empathetic',
    keywords: ['difficult', 'struggle', 'pain', 'hope', 'together', 'support'],
  },
  inspirational: {
    emotion: 'inspirational',
    pitchShiftSemitones: 1,
    speakingRateMultiplier: 1.0,
    volumeGainDb: 0.5,
    ssmlStyle: 'inspirational',
    keywords: ['achieve', 'success', 'dream', 'goal', 'overcome', 'believe', 'power'],
  },
  dramatic: {
    emotion: 'dramatic',
    pitchShiftSemitones: -1,
    speakingRateMultiplier: 0.85,
    volumeGainDb: 0,
    ssmlStyle: 'dramatic',
    keywords: ['suddenly', 'never before', 'changed everything', 'revolution', 'collapse'],
  },
  calm: {
    emotion: 'calm',
    pitchShiftSemitones: -1,
    speakingRateMultiplier: 0.9,
    volumeGainDb: -2,
    keywords: ['peace', 'relax', 'breathe', 'gentle', 'slowly'],
  },
  urgent: {
    emotion: 'urgent',
    pitchShiftSemitones: 1,
    speakingRateMultiplier: 1.15,
    volumeGainDb: 2,
    ssmlStyle: 'excited',
    keywords: ['immediately', 'now', 'emergency', 'deadline', 'quickly', 'time is running out'],
  },
};

export class EmotionController {
  detectFromText(text: string): Emotion {
    const lower = text.toLowerCase();
    let bestMatch: Emotion = 'neutral';
    let bestScore = 0;

    for (const [emotion, profile] of Object.entries(EMOTION_PROFILES) as [Emotion, EmotionProfile][]) {
      const score = profile.keywords.filter((kw) => lower.includes(kw)).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = emotion;
      }
    }

    return bestMatch;
  }

  detectFromTone(tone: string): Emotion {
    const toneMap: Record<string, Emotion> = {
      dramatic: 'dramatic',
      serious: 'serious',
      inspirational: 'inspirational',
      educational: 'neutral',
      empathetic: 'empathetic',
      exciting: 'excited',
      calm: 'calm',
      urgent: 'urgent',
    };
    return toneMap[tone.toLowerCase()] ?? 'neutral';
  }

  getProfile(emotion: Emotion): EmotionProfile {
    return EMOTION_PROFILES[emotion];
  }

  buildSsmlEmotion(text: string, emotion: Emotion): string {
    const profile = EMOTION_PROFILES[emotion];
    const rate = profile.speakingRateMultiplier >= 1.1 ? 'fast' : profile.speakingRateMultiplier <= 0.9 ? 'slow' : 'medium';
    const pitch = profile.pitchShiftSemitones > 0 ? `+${profile.pitchShiftSemitones}st` : profile.pitchShiftSemitones < 0 ? `${profile.pitchShiftSemitones}st` : 'medium';

    return `<prosody rate="${rate}" pitch="${pitch}">${text}</prosody>`;
  }

  buildCues(sceneIds: string[], tones: string[]): EmotionCue[] {
    return sceneIds.map((sceneId, i) => ({
      sceneId,
      emotion: this.detectFromTone(tones[i] ?? 'neutral'),
      intensity: 0.7,
      transitionSeconds: 0.5,
    }));
  }
}
