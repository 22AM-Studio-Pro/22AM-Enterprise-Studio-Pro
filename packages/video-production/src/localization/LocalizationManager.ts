import { SupportedLanguage } from './TranslationManager';

export interface LocaleConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  rtl: boolean;
  fontFamily: string;
  subtitleCharLimit: number;
  dateFormat: string;
  numberFormat: Intl.NumberFormatOptions;
}

export const LOCALE_CONFIGS: Record<SupportedLanguage, LocaleConfig> = {
  en: { code: 'en', name: 'English', nativeName: 'English', rtl: false, fontFamily: 'Inter', subtitleCharLimit: 80, dateFormat: 'MM/DD/YYYY', numberFormat: { notation: 'standard' } },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false, fontFamily: 'Inter', subtitleCharLimit: 85, dateFormat: 'DD/MM/YYYY', numberFormat: { notation: 'standard' } },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', rtl: false, fontFamily: 'Inter', subtitleCharLimit: 85, dateFormat: 'DD/MM/YYYY', numberFormat: { notation: 'standard' } },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false, fontFamily: 'Inter', subtitleCharLimit: 75, dateFormat: 'DD.MM.YYYY', numberFormat: { notation: 'standard' } },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false, fontFamily: 'Inter', subtitleCharLimit: 85, dateFormat: 'DD/MM/YYYY', numberFormat: { notation: 'standard' } },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false, fontFamily: 'Inter', subtitleCharLimit: 85, dateFormat: 'DD/MM/YYYY', numberFormat: { notation: 'standard' } },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false, fontFamily: 'Noto Sans Devanagari', subtitleCharLimit: 60, dateFormat: 'DD/MM/YYYY', numberFormat: { notation: 'standard' } },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true, fontFamily: 'Noto Sans Arabic', subtitleCharLimit: 60, dateFormat: 'DD/MM/YYYY', numberFormat: { notation: 'standard' } },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false, fontFamily: 'Noto Sans JP', subtitleCharLimit: 30, dateFormat: 'YYYY/MM/DD', numberFormat: { notation: 'standard' } },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false, fontFamily: 'Noto Sans SC', subtitleCharLimit: 25, dateFormat: 'YYYY/MM/DD', numberFormat: { notation: 'standard' } },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', rtl: false, fontFamily: 'Noto Sans KR', subtitleCharLimit: 30, dateFormat: 'YYYY.MM.DD', numberFormat: { notation: 'standard' } },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false, fontFamily: 'Inter', subtitleCharLimit: 70, dateFormat: 'DD.MM.YYYY', numberFormat: { notation: 'standard' } },
};

export class LocalizationManager {
  getLocale(language: SupportedLanguage): LocaleConfig {
    return LOCALE_CONFIGS[language];
  }

  isRtl(language: SupportedLanguage): boolean {
    return LOCALE_CONFIGS[language]?.rtl ?? false;
  }

  getFontFamily(language: SupportedLanguage): string {
    return LOCALE_CONFIGS[language]?.fontFamily ?? 'Inter';
  }

  formatNumber(value: number, language: SupportedLanguage): string {
    return new Intl.NumberFormat(language, LOCALE_CONFIGS[language]?.numberFormat).format(value);
  }

  all(): LocaleConfig[] {
    return Object.values(LOCALE_CONFIGS);
  }
}
