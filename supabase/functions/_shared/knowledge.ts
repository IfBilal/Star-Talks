// Runtime lookup over Star Talks' own interpretation library (original wording; sources are recorded in
// docs/source-register.md and never shown to users). Rules are selected by exact key from calculated facts:
// no search over books and no source text at runtime.
import { KNOWLEDGE, KNOWLEDGE_VERSION, type KnowledgeRule } from './knowledge.generated.ts';

export { KNOWLEDGE_VERSION };
export const getRule = (id: string): KnowledgeRule | undefined => KNOWLEDGE[id];
const text = (id: string): string | undefined => KNOWLEDGE[id]?.explanation;

// ---------- Tarot ----------
export type Orientation = 'upright' | 'reversed';
const DOMAIN_LABELS: Array<[string, string]> = [['love', 'Love'], ['career', 'Career'], ['money', 'Money'], ['growth', 'Growth'], ['reflection', 'Reflection']];

/** Our own card reading for the drawn orientation, across love, career, money, growth and reflection. */
export function tarotCardText(cardId: string, orientation: Orientation): string {
  const rule = KNOWLEDGE['tarot.card.' + cardId];
  if (!rule?.upright || !rule.reversed || !rule.domains) throw new Error(`No Tarot rule for ${cardId}.`);
  const base = orientation === 'upright' ? rule.upright : rule.reversed;
  const index = orientation === 'upright' ? 0 : 1;
  const domains = DOMAIN_LABELS.map(([key, label]) => `${label}: ${rule.domains![key][index]}`).join(' ');
  return `${base} ${domains}`;
}

const RANK_RULE: Record<string, string> = { king: 'kings', queen: 'queens', knight: 'knights', page: 'pages', ten: 'tens', nine: 'nines', eight: 'eights', seven: 'sevens', six: 'sixes', five: 'fives', four: 'fours', three: 'threes', two: 'twos', ace: 'aces' };
export function tarotRank(cardId: string): string | null {
  const match = /^([a-z]+)-of-/.exec(cardId);
  return match && RANK_RULE[match[1]] ? match[1] : null;
}
/** Combination factors when two or more cards of the same rank appear in one spread. */
export function tarotCombinationFactors(cards: Array<{ cardId: string; orientation: Orientation }>) {
  const byRank = new Map<string, Array<{ cardId: string; orientation: Orientation }>>();
  for (const card of cards) { const rank = tarotRank(card.cardId); if (rank) byRank.set(rank, [...(byRank.get(rank) ?? []), card]); }
  const out: Array<{ id: string; label: string; value: string; rule: string }> = [];
  for (const [rank, group] of byRank) {
    if (group.length < 2) continue;
    const rule = KNOWLEDGE['tarot.combo.' + RANK_RULE[rank]];
    if (!rule) continue;
    const upright = group.filter(card => card.orientation === 'upright').length;
    out.push({ id: `tarot:combo:${rank}`, label: `${group.length} ${RANK_RULE[rank]} in the spread`, value: `${upright} upright, ${group.length - upright} reversed`, rule: rule.explanation });
  }
  return out;
}

// ---------- Numerology (Pythagorean) ----------
const POSITION_RULE: Record<string, string> = {
  'numerology:life-path': 'numerology.position.life-path',
  'numerology:expression': 'numerology.position.expression',
  'numerology:soul-urge': 'numerology.position.soul-urge',
  'numerology:personality': 'numerology.position.personality',
};
export function numerologyRuleText(evidenceId: string, value: number, fallback: string): string {
  const position = text(POSITION_RULE[evidenceId] ?? '');
  const number = text(`numerology.number.${value}`);
  return [position, number ?? `Number ${value}: ${fallback}.`].filter(Boolean).join(' ');
}

// ---------- BaZi / Korean Saju ----------
type StemInfo = { element: string; yinYang: string };
const GENERATES: Record<string, string> = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' };
const CONTROLS: Record<string, string> = { Wood: 'Earth', Earth: 'Water', Water: 'Fire', Fire: 'Metal', Metal: 'Wood' };
/** The Ten Gods relationship of another stem to the Day Master, from element cycle and polarity. */
export function tenGodKey(day: StemInfo, other: StemInfo): string {
  const same = day.yinYang === other.yinYang;
  if (day.element === other.element) return same ? 'peer' : 'rob';
  if (GENERATES[day.element] === other.element) return same ? 'eating' : 'hurting';
  if (CONTROLS[day.element] === other.element) return same ? 'indirect-wealth' : 'direct-wealth';
  if (CONTROLS[other.element] === day.element) return same ? 'seven-killings' : 'direct-officer';
  return same ? 'indirect-resource' : 'direct-resource';
}
export const dayMasterRule = (roman: string): string | undefined => stemRuleText(roman);
export const stemRuleText = (roman: string): string | undefined => text('bazi.stem.' + roman.toLowerCase());
export const tenGodText = (key: string): { id: string; text: string } | undefined => {
  const rule = KNOWLEDGE['bazi.tengod.' + key];
  return rule ? { id: rule.id, text: rule.explanation.replace(' Meaning wording is general tradition; the source fixes the classification and name.', '') } : undefined;
};
export const ilganText = (): string | undefined => text('korean-saju.ilgan');
export const koreanGapText = (): string | undefined => text('korean-saju.korean-tradition');

// ---------- Vedic ----------
export const grahaText = (planet: string): string | undefined => text('vedic.graha.' + planet.toLowerCase());
export const grahaClassificationText = (): string | undefined => text('vedic.graha.classification');
export const signRulersText = (): string | undefined => text('vedic.sign.rulers');
export const signModalityText = (): string | undefined => text('vedic.sign.modality');
export const dignityResultText = (): string | undefined => text('vedic.dignity.result-strength');

export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
/** Sign rulers from Brihat Parashara Hora Shastra ch. 4 (Rahu and Ketu rule no sign here). */
export const SIGN_RULER: Record<string, string> = { Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter' };
const EXALT: Record<string, string> = { Sun: 'Aries', Moon: 'Taurus', Mars: 'Capricorn', Mercury: 'Virgo', Jupiter: 'Cancer', Venus: 'Pisces', Saturn: 'Libra' };
const DEBIL: Record<string, string> = { Sun: 'Libra', Moon: 'Scorpio', Mars: 'Cancer', Mercury: 'Pisces', Jupiter: 'Capricorn', Venus: 'Virgo', Saturn: 'Aries' };
// Moolatrikona as read from BPHS ch. 3 (degrees within the sign). For the Moon in Taurus and Mercury in Virgo the
// first 3 and 15 degrees are the exaltation portion and the moolatrikona follows.
const MOOLATRIKONA: Record<string, [string, number, number]> = { Sun: ['Leo', 0, 20], Moon: ['Taurus', 3, 30], Mars: ['Aries', 0, 12], Mercury: ['Virgo', 15, 20], Jupiter: ['Sagittarius', 0, 10], Venus: ['Libra', 0, 15], Saturn: ['Aquarius', 0, 20] };
const EXALT_PORTION: Record<string, number> = { Moon: 3, Mercury: 15 };

export type Dignity = 'exalted' | 'debilitated' | 'moolatrikona' | 'own sign' | 'neutral';
export function dignity(planet: string, sign: string, degreeInSign: number): Dignity {
  if (!EXALT[planet]) return 'neutral'; // Rahu, Ketu and outer planets are not graded here
  if (EXALT[planet] === sign && degreeInSign < (EXALT_PORTION[planet] ?? 30)) return 'exalted';
  const root = MOOLATRIKONA[planet];
  if (root && root[0] === sign && degreeInSign >= root[1] && degreeInSign < root[2]) return 'moolatrikona';
  if (DEBIL[planet] === sign) return 'debilitated';
  if (SIGN_RULER[sign] === planet) return 'own sign';
  return 'neutral';
}

// ---------- Palmistry / face reading: pick the rules matching what the image actually shows ----------
type KeyGroup = { pattern: RegExp; prefixes: string[]; ids?: string[]; cap: number };
// Each visible feature pulls its own few rules, so a broad word like "palm shape" cannot crowd out the lines.
const PALM_KEYS: KeyGroup[] = [
  { pattern: /shape|palm|hand|size|firm/i, prefixes: [], ids: ['palmistry.hand.square', 'palmistry.hand.spatulate', 'palmistry.hand.conic', 'palmistry.hand.philosophic', 'palmistry.hand.psychic', 'palmistry.hand.mixed'], cap: 6 },
  { pattern: /heart/i, prefixes: ['palmistry.line.heart.'], cap: 4 }, { pattern: /head/i, prefixes: ['palmistry.line.head.'], cap: 4 },
  { pattern: /life/i, prefixes: ['palmistry.line.life.'], cap: 3 }, { pattern: /fate|destiny/i, prefixes: ['palmistry.line.fate.'], cap: 3 },
  { pattern: /sun line|apollo/i, prefixes: ['palmistry.line.sun.'], cap: 2 },
  { pattern: /mount|venus|jupiter|saturn|mercury|mars|luna/i, prefixes: ['palmistry.mount.'], cap: 7 },
  { pattern: /thumb/i, prefixes: ['palmistry.thumb.'], cap: 3 },
  { pattern: /joint|knuckle/i, prefixes: ['palmistry.fingers.joints'], cap: 2 }, { pattern: /finger/i, prefixes: ['palmistry.fingers.'], cap: 4 },
  { pattern: /line|crease|mark|branch|break|island|chain|depth/i, prefixes: [], ids: ['palmistry.lines.general-quality', 'palmistry.lines.branches'], cap: 2 },
];
const FACE_KEYS: KeyGroup[] = [
  { pattern: /forehead|upper zone|hairline|zone/i, prefixes: ['face.forehead.'], cap: 3 }, { pattern: /nose|nostril|bridge/i, prefixes: ['face.nose.'], cap: 5 },
  { pattern: /eye|brow/i, prefixes: ['face.eyes.'], cap: 3 }, { pattern: /mouth|lip/i, prefixes: ['face.mouth.'], cap: 3 }, { pattern: /ear/i, prefixes: ['face.ears.'], cap: 1 },
];
export function selectImageRules(kind: 'palm' | 'face', features: string[], limit = 40): Array<{ id: string; concept: string; text: string }> {
  const table = kind === 'palm' ? PALM_KEYS : FACE_KEYS;
  const chosen = new Map<string, KnowledgeRule>();
  const all = Object.values(KNOWLEDGE);
  for (const group of table) {
    if (!features.some(feature => group.pattern.test(feature))) continue;
    const priority = (id: string) => (id.endsWith('.meaning') ? 0 : id.endsWith('.start') ? 1 : 2);
    const candidates = group.ids ? group.ids.map(id => KNOWLEDGE[id]).filter(Boolean) : all.filter(rule => group.prefixes.some(prefix => rule.id.startsWith(prefix))).sort((a, b) => priority(a.id) - priority(b.id));
    let added = 0;
    for (const rule of candidates) { if (added >= group.cap || chosen.size >= limit) break; if (!chosen.has(rule.id)) { chosen.set(rule.id, rule); added++; } }
  }
  if (kind === 'palm' && chosen.size < limit) { const extra = KNOWLEDGE['palmistry.hands.left-right']; if (extra) chosen.set(extra.id, extra); }
  return [...chosen.values()].map(rule => ({ id: rule.id, concept: rule.concept, text: rule.explanation }));
}
