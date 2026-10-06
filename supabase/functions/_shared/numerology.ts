export const NUMEROLOGY_VERSION = 'pythagorean/1.1.0';

// Pythagorean mapping: A/J/S=1, B/K/T=2, ... I/R=9. Y is treated as a
// consonant consistently; callers must obtain a user-confirmed Latin spelling.
const values = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce<Record<string,number>>((map, letter, index) => {
  map[letter] = index % 9 + 1; return map;
}, {});
const vowels = new Set(['A','E','I','O','U']);
export const NUMBER_MEANINGS: Record<number, string> = {
  1: 'initiative, independence and learning to lead without isolation',
  2: 'cooperation, sensitivity and finding balanced partnerships',
  3: 'expression, creative communication and focused follow-through',
  4: 'structure, patient work and flexibility within routine',
  5: 'change, curiosity and the need for grounded freedom',
  6: 'care, responsibility and healthy limits around helping others',
  7: 'inquiry, reflection and sharing insight instead of withdrawing',
  8: 'practical ambition, resources and ethical use of influence',
  9: 'compassion, closure and discerning where to invest energy',
  11: 'heightened insight paired with a need for practical grounding',
  22: 'large-scale building paired with patient, realistic steps',
  33: 'service and teaching paired with sustainable personal boundaries',
};

function reduce(value: number): number {
  while (value > 9 && value !== 11 && value !== 22 && value !== 33) {
    value = String(value).split('').reduce((total, digit) => total + Number(digit), 0);
  }
  return value;
}

function digits(value: string): number { return value.replace(/\D/g, '').split('').reduce((sum, digit) => sum + Number(digit), 0); }

export function calculateNumerology(birthDate: string, confirmedLatinName: string | null, at: Date, timeZone: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new Error('A valid birth date is required.');
  const [year, month, day] = birthDate.split('-').map(Number);
  const parsed=new Date(birthDate+'T12:00:00Z');
  if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==birthDate||year<1)throw new Error('A valid calendar birth date is required.');
  if(!Number.isFinite(at.getTime()))throw new Error('A valid reading date is required.');
  const warnings: string[]=[];
  const calendar = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric' }).formatToParts(at);
  const currentYear = Number(calendar.find(part => part.type === 'year')?.value);
  const currentMonth = Number(calendar.find(part => part.type === 'month')?.value);
  const evidence: Array<{ id: string; label: string; value: number; meaning: string }> = [
    { id: 'numerology:life-path', label: 'Life Path', value: reduce(digits(birthDate)), meaning: 'A symbolic theme derived from the complete birth date.' },
    { id: 'numerology:birthday', label: 'Birthday', value: reduce(day), meaning: 'A symbolic theme derived from the birth day.' },
    { id: 'numerology:personal-year', label: 'Personal Year', value: reduce(digits(`${month}${day}${currentYear}`)), meaning: `A symbolic cycle for ${currentYear}.` },
    { id: 'numerology:personal-month', label: 'Personal Month', value: reduce(reduce(digits(`${month}${day}${currentYear}`)) + currentMonth), meaning: `A symbolic cycle for month ${currentMonth} of ${currentYear}.` },
  ];
  let normalizedName: string | null = null;
  if (confirmedLatinName) {
    const transliterated=confirmedLatinName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    // Never silently discard parts of a name written in another alphabet.
    if(/[^A-Z\s.'’\-]/.test(transliterated))throw new Error('Please confirm a full Latin spelling of your birth name for numerology.');
    normalizedName = transliterated.replace(/[^A-Z]/g, '');
    if (!normalizedName) normalizedName = null;
  }
  if (normalizedName) {
    const letters = [...normalizedName];
    const sum = (filter: (letter: string) => boolean) => reduce(letters.filter(filter).reduce((total, letter) => total + values[letter], 0));
    evidence.push(
      { id: 'numerology:expression', label: 'Destiny / Expression', value: sum(() => true), meaning: 'A symbolic pattern derived from every letter in the confirmed name.' },
      { id: 'numerology:soul-urge', label: 'Soul Urge', value: sum(letter => vowels.has(letter)), meaning: 'A symbolic pattern derived from vowels in the confirmed name.' },
      { id: 'numerology:personality', label: 'Personality', value: sum(letter => !vowels.has(letter)), meaning: 'A symbolic pattern derived from consonants in the confirmed name.' },
    );
  }
  if(!normalizedName)warnings.push('A confirmed Latin spelling of the full birth name is needed for name-based numbers.');
  for(let index=evidence.length-1;index>=0;index--){if(evidence[index].value===0){warnings.push(`${evidence[index].label} is omitted because the name has no letters for that factor.`);evidence.splice(index,1);}}
  return { version: NUMEROLOGY_VERSION, normalizedName, birthDate, evidence,
    warnings,
  };
}
