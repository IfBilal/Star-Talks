import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import { preferences } from '@/lib/preferences';
import { resources } from './resources';
import { SUPPORTED_LANGUAGE_CODES, isRtlLanguage, isSupportedLanguage, type LanguageCode } from './languages';

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';
const defaultLanguage: LanguageCode = isSupportedLanguage(deviceLanguage) ? deviceLanguage : 'en';

let ready = false;

/** Resolves the starting language (saved preference, else device locale) and boots i18next. */
export async function initI18n(): Promise<LanguageCode> {
  const stored = await preferences.getLanguage();
  const initialLanguage: LanguageCode = isSupportedLanguage(stored) ? stored : defaultLanguage;

  if (!ready) {
    await i18n.use(initReactI18next).init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });
    ready = true;
  }

  I18nManager.allowRTL(true);
  // Matches the layout direction to a previously saved language on cold start.
  // A direction actually flipping mid-session still needs the restart handled by setAppLanguage.
  const shouldBeRtl = isRtlLanguage(initialLanguage);
  if (I18nManager.isRTL !== shouldBeRtl) {
    I18nManager.forceRTL(shouldBeRtl);
  }

  return initialLanguage;
}

/**
 * Switches the active language and persists it. Returns true when the RTL/LTR
 * writing direction changed, since React Native only applies that to layout
 * after the app restarts.
 */
export async function setAppLanguage(code: LanguageCode): Promise<boolean> {
  await i18n.changeLanguage(code);
  await preferences.setLanguage(code);
  const shouldBeRtl = isRtlLanguage(code);
  const directionChanged = I18nManager.isRTL !== shouldBeRtl;
  if (directionChanged) {
    I18nManager.forceRTL(shouldBeRtl);
  }
  return directionChanged;
}

export { SUPPORTED_LANGUAGE_CODES };
export default i18n;
