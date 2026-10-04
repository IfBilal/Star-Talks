import { calculateChart, CALCULATOR_VERSION, type ChartResult } from '../../../src/features/astrology/chart.ts';
import { lalKitabHouseRule, LAL_KITAB_RULES_VERSION } from './lal-kitab.ts';

export const CHART_RULES_VERSION = 'chart-rules/1.0.0';
type Profile = { birth_date: string; birth_instant: string | null; birth_time_known: boolean; latitude: number; longitude: number; time_zone: string };
type Factor = { id: string; label: string; value: string; rule: string };

const planetThemes: Record<string,string> = {
  Sun: 'identity, direction and vitality', Moon: 'emotional needs and response patterns',
  Mercury: 'communication and learning', Venus: 'relationships, values and attraction',
  Mars: 'initiative, conflict and drive', Jupiter: 'growth, belief and opportunity',
  Saturn: 'discipline, limits and long-term work', Uranus: 'change and independence',
  Neptune: 'imagination and ambiguity', Pluto: 'deep change and power',
};
const signStyles: Record<string,string> = {
  Aries: 'direct and initiating', Taurus: 'steady and tangible', Gemini: 'curious and varied',
  Cancer: 'protective and responsive', Leo: 'expressive and visible', Virgo: 'careful and practical',
  Libra: 'relational and balancing', Scorpio: 'intense and investigative', Sagittarius: 'exploratory and candid',
  Capricorn: 'structured and goal-minded', Aquarius: 'independent and future-minded', Pisces: 'imaginative and porous',
};
const houseThemes = [
  'self and presentation','resources and values','communication and nearby life','home and roots',
  'creativity and pleasure','daily work and health routines','partnerships','shared resources and change',
  'study and wider horizons','career and public life','friends and community','retreat and the private inner life',
];
const dashaLords = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const dashaYears = [7,20,6,10,7,18,16,19,17];
const msPerYear = 365.2425 * 86400000;
const mod = (n:number, m:number) => ((n % m) + m) % m;

function houseFor(sign: string, ascendantSign: string): number {
  const names = Object.keys(signStyles);
  return mod(names.indexOf(sign) - names.indexOf(ascendantSign), 12) + 1;
}

function angularDistance(a:number,b:number) { const d=Math.abs(a-b)%360; return Math.min(d,360-d); }

function majorAspects(chart: ChartResult, zodiac: 'western'|'vedic'): Factor[] {
  const planets = chart.western.planets.filter(p => !['Uranus','Neptune','Pluto'].includes(p.name) || zodiac === 'western');
  const definitions: Array<[string,number,number,string]> = [
    ['conjunction',0,6,'themes merge and intensify'],['sextile',60,4,'an opportunity to cooperate'],
    ['square',90,6,'friction calls for adjustment'],['trine',120,6,'a natural flow or talent'],
    ['opposition',180,6,'two needs seek balance'],
  ];
  const factors: Factor[] = [];
  for (let i=0;i<planets.length;i++) for(let j=i+1;j<planets.length;j++) {
    const a=planets[i], b=planets[j];
    const distance=angularDistance(zodiac==='western'?a.tropicalLongitude:a.siderealLongitude,zodiac==='western'?b.tropicalLongitude:b.siderealLongitude);
    const aspect=definitions.find(([,angle,orb])=>Math.abs(distance-angle)<=orb);
    if (aspect) factors.push({ id:`${zodiac}:aspect:${a.name.toLowerCase()}-${b.name.toLowerCase()}-${aspect[0]}`,
      label:`${a.name} ${aspect[0]} ${b.name}`, value:`${distance.toFixed(1)}° separation`, rule:aspect[3] });
  }
  return factors.slice(0,20);
}

function currentDasha(chart: ChartResult, birthInstant: string, asOf: Date): Factor[] {
  const lord=chart.vedic.vimshottariAtBirth.mahadashaLord;
  const index=dashaLords.indexOf(lord);
  if(index<0)return [];
  let start=new Date(birthInstant).getTime()-(dashaYears[index]-chart.vedic.vimshottariAtBirth.remainingYears)*msPerYear;
  const now=asOf.getTime();
  for(let cycle=0;cycle<18;cycle++) {
    const i=(index+cycle)%9;
    const end=start+dashaYears[i]*msPerYear;
    if(now>=start&&now<end) {
      const result: Factor[]=[{id:'vedic:dasha:mahadasha',label:'Current Vimshottari mahadasha',value:`${dashaLords[i]} (${new Date(start).toISOString().slice(0,10)} to ${new Date(end).toISOString().slice(0,10)})`,rule:'A symbolic planetary period calculated from the Moon nakshatra at birth.'}];
      let subStart=start;
      for(let part=0;part<9;part++) {
        const sub=(i+part)%9;const subEnd=subStart+(dashaYears[i]*dashaYears[sub]/120)*msPerYear;
        if(now>=subStart&&now<subEnd){result.push({id:'vedic:dasha:antardasha',label:'Current antardasha',value:`${dashaLords[sub]} (${new Date(subStart).toISOString().slice(0,10)} to ${new Date(subEnd).toISOString().slice(0,10)})`,rule:'A subperiod of the current mahadasha.'});break;}
        subStart=subEnd;
      }
      return result;
    }
    start=end;
  }
  return [];
}

export function buildChartEvidence(profile: Profile, moduleId: 'vedic'|'western'|'lal-kitab', asOf = new Date()) {
  const warnings: string[] = [];
  const exact = Boolean(profile.birth_time_known && profile.birth_instant);
  const instant = exact ? profile.birth_instant! : `${profile.birth_date}T12:00:00.000Z`;
  if (!exact) warnings.push('Birth time is unknown. Planet signs are date-only approximations; ascendant, houses, dasha and precise timing are withheld. Moon sign near a boundary may be uncertain.');
  const chart = calculateChart({ birthInstant: instant, latitude: profile.latitude, longitude: profile.longitude, timeKnown: exact, timeZone: profile.time_zone });
  const factors: Factor[] = [];
  const system=moduleId==='western'?'western':'vedic';
  const planets = system==='western' ? chart.western.planets.map(p=>({name:p.name,sign:p.tropicalSign,degree:p.tropicalLongitude%30})) : chart.vedic.planets.map(p=>({name:p.name,sign:p.sign,degree:p.degree}));
  const rising = system==='western'?chart.western.ascendantSign:chart.vedic.ascendantSign;
  if(moduleId==='lal-kitab'){
    if(!exact)throw new Error('A known birth time is needed for Lal Kitab house rules.');
    const zodiac=Object.keys(signStyles);
    const nodePoints=[
      {name:'Rahu',sign:zodiac[Math.floor(chart.vedic.meanLunarNode.rahuLongitude/30)]},
      {name:'Ketu',sign:zodiac[Math.floor(chart.vedic.meanLunarNode.ketuLongitude/30)]},
    ];
    for(const point of [...planets.filter(planet=>['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'].includes(planet.name)),...nodePoints]){
      const house=houseFor(point.sign,rising);const rule=lalKitabHouseRule(point.name,house);
      factors.push({id:rule.id,label:rule.label,value:`Sidereal ${point.sign}; whole-sign house ${house}`,rule:`${rule.interpretation} ${rule.optionalPractice}`});
    }
    return {version:`${CALCULATOR_VERSION}+${LAL_KITAB_RULES_VERSION}`,method:moduleId,asOf:asOf.toISOString(),exactBirthTime:true,factors,warnings};
  }
  for(const planet of planets) {
    if(!exact&&planet.name==='Moon')continue;
    const theme=planetThemes[planet.name]??'a planetary theme';
    const style=signStyles[planet.sign]??'its sign style';
    const house=exact?houseFor(planet.sign,rising):null;
    factors.push({id:`${moduleId}:natal:${planet.name.toLowerCase()}`,label:`Natal ${planet.name}`,
      value:`${planet.sign} ${planet.degree.toFixed(1)}°${house?`, whole-sign house ${house}`:''}`,
      rule:`${planet.name} relates symbolically to ${theme}; ${planet.sign} expresses this in a ${style} way${house?` in ${houseThemes[house-1]}`:''}.`});
  }
  if(exact){
    factors.push({id:`${moduleId}:ascendant`,label:'Ascendant',value:rising,rule:`Whole-sign houses begin with ${rising}.`});
    factors.push(...majorAspects(chart,system));
    if(moduleId==='vedic'){
      factors.push({id:'vedic:nakshatra:moon',label:'Moon nakshatra',value:`${chart.vedic.moonNakshatra.name}, pada ${chart.vedic.moonNakshatra.pada}`,rule:'Lunar mansion from the sidereal Moon.'});
      factors.push(...currentDasha(chart,instant,asOf));
    }
  }
  {
    const transit=calculateChart({birthInstant:asOf.toISOString(),latitude:profile.latitude,longitude:profile.longitude,timeKnown:true,timeZone:profile.time_zone});
    const moving=system==='western'?transit.western.planets.map(p=>({name:p.name,sign:p.tropicalSign})):transit.vedic.planets.map(p=>({name:p.name,sign:p.sign}));
    for(const p of moving.filter(p=>['Sun','Mars','Jupiter','Saturn'].includes(p.name)))
      factors.push({id:`${moduleId}:transit:${p.name.toLowerCase()}`,label:`Current ${p.name} transit`,value:`${p.sign} as of ${asOf.toISOString().slice(0,10)}`,rule:'Current transit position; no personal timing window is established by sign alone.'});
  }
  return {version:`${CALCULATOR_VERSION}+${CHART_RULES_VERSION}`,method:moduleId,asOf:asOf.toISOString(),exactBirthTime:exact,factors,warnings};
}
