export type AstrologyModule = {
  id: string;
  name: string;
  methodology: string;
  requiresBirthTime: boolean;
  requiresPalmImage?: boolean;
  requiresFaceImage?: boolean;
  domains: readonly string[];
};

export const AI_MODULES: readonly AstrologyModule[] = [
  { id: 'tarot', name: 'AI Tarot', methodology: '78-card Tarot deck and position-aware spreads', requiresBirthTime: false, domains: ['tarot', 'cards', 'spreads'] },
  { id: 'vedic', name: 'AI Vedic Astrology', methodology: 'Vedic chart, nakshatra, dasha, houses, and transits', requiresBirthTime: true, domains: ['vedic', 'nakshatra', 'dasha', 'kundli'] },
  { id: 'numerology', name: 'AI Numerology', methodology: 'Core numbers and personal cycles', requiresBirthTime: false, domains: ['numerology', 'life path', 'personal year'] },
  { id: 'western', name: 'AI Western Astrology', methodology: 'Tropical natal chart, houses, aspects, and transits', requiresBirthTime: true, domains: ['western', 'tropical', 'transits'] },
  { id: 'lal-kitab', name: 'AI Lal Kitab', methodology: 'Lal Kitab planetary rules and remedies', requiresBirthTime: true, domains: ['lal kitab', 'remedies'] },
  { id: 'palmistry', name: 'AI Palmistry', methodology: 'Visible palm features only', requiresBirthTime: false, requiresPalmImage: true, domains: ['palm', 'hand lines'] },
  { id: 'chinese-zodiac', name: 'AI Chinese Zodiac', methodology: 'Chinese zodiac year and element system', requiresBirthTime: false, domains: ['chinese zodiac', 'bazi', 'four pillars'] },
  { id: 'korean-astrology', name: 'AI Korean Astrology', methodology: 'Korean astrology method metadata', requiresBirthTime: true, domains: ['saju', 'korean astrology'] },
  { id: 'face-reading', name: 'AI Face Reading', methodology: 'Visible Mian Xiang facial structures only', requiresBirthTime: false, requiresFaceImage: true, domains: ['face reading', 'mian xiang'] },
];

export function getModuleById(id: string) {
  return AI_MODULES.find((module) => module.id === id) ?? null;
}

export function classifyModule(question: string) {
  const normalized = question.toLocaleLowerCase();
  return AI_MODULES.find((module) => module.domains.some((domain) => normalized.includes(domain))) ?? null;
}
