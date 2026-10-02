export const SUPPORTED_LANGUAGES = [
  { code: 'en', flag: '🇬🇧', label: 'English', rtl: false },
  { code: 'hi', flag: '🇮🇳', label: 'हिन्दी', rtl: false },
  { code: 'ur', flag: '🇵🇰', label: 'اردو', rtl: true },
  { code: 'es', flag: '🇪🇸', label: 'Español', rtl: false },
  { code: 'fr', flag: '🇫🇷', label: 'Français', rtl: false },
  { code: 'ar', flag: '🇸🇦', label: 'العربية', rtl: true },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map(l => l.code);

export const isSupportedLanguage = (code: string | null | undefined): code is LanguageCode =>
  !!code && (SUPPORTED_LANGUAGE_CODES as string[]).includes(code);

export const isRtlLanguage = (code: string) =>
  SUPPORTED_LANGUAGES.some(l => l.code === code && l.rtl);
