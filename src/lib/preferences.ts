import AsyncStorage from '@react-native-async-storage/async-storage';

export type RegionChoice = { code: string; name: string; currency: string; timezone: string; dateFormat: string };

const keys = {
  region: 'star-talks.region',
  language: 'star-talks.language',
  onboardingComplete: 'star-talks.onboarding-complete',
};

export const preferences = {
  getRegion: () => AsyncStorage.getItem(keys.region),
  setRegion: (region: RegionChoice) => AsyncStorage.setItem(keys.region, JSON.stringify(region)),
  getLanguage: () => AsyncStorage.getItem(keys.language),
  setLanguage: (language: string) => AsyncStorage.setItem(keys.language, language),
  getOnboardingComplete: () => AsyncStorage.getItem(keys.onboardingComplete),
  setOnboardingComplete: (complete: boolean) => AsyncStorage.setItem(keys.onboardingComplete, String(complete)),
};

export function readRegion(raw: string | null): RegionChoice | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as RegionChoice; } catch { return null; }
}
