import { SupportedLanguage } from './TranslationManager';
import { LocalizationManager } from './LocalizationManager';

export interface SubtitleLine {
  index: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  text: string;
}

export interface LocalizedSubtitleTrack {
  language: SupportedLanguage;
  format: 'srt' | 'vtt';
  isRtl: boolean;
  fontFamily: string;
  lines: SubtitleLine[];
}

export class SubtitleLocalizer {
  constructor(private readonly localizationManager: LocalizationManager) {}

  localize(
    lines: SubtitleLine[],
    translatedTexts: Record<number, string>,
    language: SupportedLanguage,
    format: 'srt' | 'vtt' = 'srt',
  ): LocalizedSubtitleTrack {
    const locale = this.localizationManager.getLocale(language);
    const charLimit = locale.subtitleCharLimit;

    const localizedLines = lines.map((line) => {
      const translated = translatedTexts[line.index] ?? line.text;
      const trimmed = translated.length > charLimit ? translated.slice(0, charLimit) + '…' : translated;
      return { ...line, text: trimmed };
    });

    return {
      language,
      format,
      isRtl: locale.rtl,
      fontFamily: locale.fontFamily,
      lines: localizedLines,
    };
  }
}
