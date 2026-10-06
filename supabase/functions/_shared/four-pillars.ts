import { resolveLocalBirthTime } from '../../../src/features/birth/timezone.ts';
import { Solar } from 'npm:lunar-typescript@1.8.6';

export const FOUR_PILLARS_VERSION = 'lunar-typescript/1.8.6-star-talks/1.1.0';

const stems: Record<string, { roman: string; korean: string; element: string; yinYang: string }> = {
  '甲': { roman: 'Jia', korean: 'Gap', element: 'Wood', yinYang: 'Yang' },
  '乙': { roman: 'Yi', korean: 'Eul', element: 'Wood', yinYang: 'Yin' },
  '丙': { roman: 'Bing', korean: 'Byeong', element: 'Fire', yinYang: 'Yang' },
  '丁': { roman: 'Ding', korean: 'Jeong', element: 'Fire', yinYang: 'Yin' },
  '戊': { roman: 'Wu', korean: 'Mu', element: 'Earth', yinYang: 'Yang' },
  '己': { roman: 'Ji', korean: 'Gi', element: 'Earth', yinYang: 'Yin' },
  '庚': { roman: 'Geng', korean: 'Gyeong', element: 'Metal', yinYang: 'Yang' },
  '辛': { roman: 'Xin', korean: 'Sin', element: 'Metal', yinYang: 'Yin' },
  '壬': { roman: 'Ren', korean: 'Im', element: 'Water', yinYang: 'Yang' },
  '癸': { roman: 'Gui', korean: 'Gye', element: 'Water', yinYang: 'Yin' },
};
const branches: Record<string, { roman: string; korean: string; animal: string; element: string }> = {
  '子': { roman: 'Zi', korean: 'Ja', animal: 'Rat', element: 'Water' },
  '丑': { roman: 'Chou', korean: 'Chuk', animal: 'Ox', element: 'Earth' },
  '寅': { roman: 'Yin', korean: 'In', animal: 'Tiger', element: 'Wood' },
  '卯': { roman: 'Mao', korean: 'Myo', animal: 'Rabbit', element: 'Wood' },
  '辰': { roman: 'Chen', korean: 'Jin', animal: 'Dragon', element: 'Earth' },
  '巳': { roman: 'Si', korean: 'Sa', animal: 'Snake', element: 'Fire' },
  '午': { roman: 'Wu', korean: 'O', animal: 'Horse', element: 'Fire' },
  '未': { roman: 'Wei', korean: 'Mi', animal: 'Goat', element: 'Earth' },
  '申': { roman: 'Shen', korean: 'Sin', animal: 'Monkey', element: 'Metal' },
  '酉': { roman: 'You', korean: 'Yu', animal: 'Rooster', element: 'Metal' },
  '戌': { roman: 'Xu', korean: 'Sul', animal: 'Dog', element: 'Earth' },
  '亥': { roman: 'Hai', korean: 'Hae', animal: 'Pig', element: 'Water' },
};

function partsAt(instant: Date, timeZone: string) {
  const fields = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' }).formatToParts(instant);
  const number = (type: string) => Number(fields.find(field => field.type === type)?.value);
  return { year: number('year'), month: number('month'), day: number('day'), hour: number('hour'), minute: number('minute'), second: number('second') };
}

function describePillar(id: string, glyphs: string) {
  const stem = stems[glyphs[0]];
  const branch = branches[glyphs[1]];
  if (!stem || !branch) throw new Error(`Unsupported pillar symbols for ${id}`);
  return { id: `pillar:${id}`, characters: glyphs, chinese: `${stem.roman} ${branch.roman}`,
    korean: `${stem.korean}${branch.korean}`, stem: stem.roman, stemKorean: stem.korean, branch: branch.roman,
    animal: branch.animal, stemElement: stem.element, branchElement: branch.element,
    yinYang: stem.yinYang };
}

export function calculateFourPillars(input: { birthDate: string; birthTime: string | null; birthInstant: string | null; timeZone: string }) {
  const [year, month, day] = input.birthDate.split('-').map(Number);
  const date=new Date(input.birthDate+'T12:00:00Z');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==input.birthDate)throw new Error('A valid calendar birth date is required for Four Pillars.');
  if(input.birthTime&&!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(input.birthTime))throw new Error('A valid local birth time is required.');
  if(input.birthTime&&!input.birthInstant)throw new Error('Resolve the local birth time before calculating Four Pillars.');
  const localHour = input.birthTime ? Number(input.birthTime.slice(0, 2)) : 12;
  const localMinute = input.birthTime ? Number(input.birthTime.slice(3, 5)) : 0;
  const localSecond=input.birthTime?Number(input.birthTime.slice(6,8)||0):0;
  const local = Solar.fromYmdHms(year, month, day, localHour, localMinute, localSecond).getLunar().getEightChar();
  local.setSect(2); // Civil midnight day boundary; preserve the explicit late-Zi convention.

  // The library's jieqi table is in China Standard Time. Compare the actual
  // birth instant in that zone for year/month boundaries; use local civil
  // date and time for the day/hour pillar. Noon is used only as an explicitly
  // limited date-only calculation when the birth hour is unknown.
  const noon=resolveLocalBirthTime({year,month,day,hour:12,minute:0},input.timeZone);
  if(noon.status!=='resolved')throw new Error('The local birth date could not be resolved in its time zone.');
  const instant=input.birthTime?new Date(input.birthInstant!):noon.instant;
  if(!Number.isFinite(instant.getTime()))throw new Error('A valid birth instant is required.');
  if(input.birthTime){const actual=partsAt(instant,input.timeZone);if(actual.year!==year||actual.month!==month||actual.day!==day||actual.hour!==localHour||actual.minute!==localMinute||actual.second!==localSecond)throw new Error('Birth instant does not match the saved local date and time.');}
  const china=partsAt(instant,'Etc/GMT-8');
  const solarTerms=Solar.fromYmdHms(china.year,china.month,china.day,china.hour,china.minute,china.second).getLunar().getEightChar();
  solarTerms.setSect(2);
  const pillars = [
    describePillar('year', solarTerms.getYear()),
    describePillar('month', solarTerms.getMonth()),
    describePillar('day', local.getDay()),
    ...(input.birthTime ? [describePillar('hour', local.getTime())] : []),
  ];
  const elementBalance = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  for (const pillar of pillars) { elementBalance[pillar.stemElement as keyof typeof elementBalance]++; elementBalance[pillar.branchElement as keyof typeof elementBalance]++; }
  return {
    version: FOUR_PILLARS_VERSION,
    birthTimeKnown: Boolean(input.birthTime),
    boundary: 'Solar terms at actual instant in China Standard Time; day and hour from historical local civil time, midnight day boundary (sect 2); date-only uses local noon',
    pillars,
    dayMaster: pillars[2].stem,
    ilgan: pillars[2].stemKorean,
    elementBalance,
    animals: { year: pillars[0].animal, inner: pillars[1].animal, secret: pillars[3]?.animal ?? null },
    warnings: input.birthTime ? [] : ['Birth hour is unknown. Hour pillar and secret animal are omitted; year/month may be uncertain on a solar-term boundary.'],
  };
}
