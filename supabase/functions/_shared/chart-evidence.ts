import { resolveLocalBirthTime } from '../../../src/features/birth/timezone.ts';
import { calculateChart, transitLongitudes, CALCULATOR_VERSION, type ChartResult } from '../../../src/features/astrology/chart.ts';
import { lalKitabHouseRule, LAL_KITAB_RULES_VERSION } from './lal-kitab.ts';

export const CHART_RULES_VERSION = 'chart-rules/1.1.0';
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

/** Traditional whole-sign graha drishti. Node aspects vary by school and are omitted. */
function vedicAspects(chart: ChartResult): Factor[] {
  const planets=chart.vedic.planets.filter(p=>!['Uranus','Neptune','Pluto'].includes(p.name));
  const factors: Factor[]=[];
  for(const from of planets)for(const to of planets){
    if(from.name===to.name)continue;
    const house=mod(Math.floor(to.longitude/30)-Math.floor(from.longitude/30),12)+1;
    const aspects=from.name==='Mars'?[4,7,8]:from.name==='Jupiter'?[5,7,9]:from.name==='Saturn'?[3,7,10]:[7];
    if(aspects.includes(house))factors.push({id:`vedic:drishti:${from.name.toLowerCase()}-${to.name.toLowerCase()}`,label:`${from.name} aspects ${to.name}`,value:`${house}th sign from ${from.name}`,rule:'Whole-sign graha drishti: seven classical planets; special Mars, Jupiter and Saturn aspects. No Western degree-orb interpretation or disputed node aspects.'});
  }
  return factors;
}

/** Daily samples, not exact event times. Windows clipped to a 30-day horizon. */
export function westernTransitWindows(chart: ChartResult, asOf: Date): Factor[] {
  const natal=chart.western.planets.filter(p=>['Sun','Moon','Mercury','Venus','Mars'].includes(p.name));
  const aspects: Array<[string,number]>=[['conjunction',0],['square',90],['trine',120],['opposition',180]];
  const windows=new Map<string,{label:string;start:string;end:string;orb:number;lastDay:number}>();
  const active=new Map<string,string>();
  for(let day=0;day<=30;day++){
    const date=new Date(asOf.getTime()+day*86400000),stamp=date.toISOString().slice(0,10);
    for(const moving of transitLongitudes(date))for(const target of natal)for(const [name,angle] of aspects){
      const orb=Math.abs(angularDistance(moving.longitude,target.tropicalLongitude)-angle);
      if(orb>3)continue;
      const key=`western:window:${moving.name.toLowerCase()}-${target.name.toLowerCase()}-${name}`;
      const activeKey=active.get(key);
      const window=activeKey?windows.get(activeKey):undefined;
      if(window&&window.lastDay===day-1){window.end=stamp;window.orb=Math.min(window.orb,orb);window.lastDay=day;}
      else {const newKey=key+':'+stamp;active.set(key,newKey);windows.set(newKey,{label:`Transiting ${moving.name} ${name} natal ${target.name}`,start:stamp,end:stamp,orb,lastDay:day});}
    }
  }
  return [...windows].sort((a,b)=>a[1].start.localeCompare(b[1].start)||a[1].orb-b[1].orb).slice(0,8).map(([id,w])=>({id,label:w.label,value:`${w.start} through ${w.end}; closest sampled orb ${w.orb.toFixed(2)}°`,rule:'Tropical geocentric transit within a 3° orb, sampled every 24 hours over the next 30 days. Endpoints are approximate sampled days, clipped to this horizon, not exact ingress/egress or guaranteed life events.'}));
}

export function vimshottariTimeline(chart: ChartResult, birthInstant: string) {
  const index=dashaLords.indexOf(chart.vedic.vimshottariAtBirth.mahadashaLord);
  if(index<0)throw new Error('Unknown Vimshottari lord.');
  let start=new Date(birthInstant).getTime()-(dashaYears[index]-chart.vedic.vimshottariAtBirth.remainingYears)*msPerYear;
  return Array.from({length:10},(_,cycle)=>{
    const i=(index+cycle)%9,end=start+dashaYears[i]*msPerYear;
    let subStart=start;
    const subperiods=Array.from({length:9},(_,part)=>{
      const sub=(i+part)%9,subEnd=subStart+dashaYears[i]*dashaYears[sub]/120*msPerYear;
      const period={lord:dashaLords[sub],start:new Date(subStart).toISOString(),end:new Date(subEnd).toISOString()};subStart=subEnd;return period;
    });
    const period={lord:dashaLords[i],start:new Date(start).toISOString(),end:new Date(end).toISOString(),subperiods};start=end;return period;
  });
}

function currentDasha(chart: ChartResult, birthInstant: string, asOf: Date): Factor[] {
  const now=asOf.getTime();
  const timeline=vimshottariTimeline(chart,birthInstant);
  const result:Factor[]=timeline.map((period,index)=>({id:`vedic:dasha:timeline:${index}`,label:`${period.lord} mahadasha period`,value:`${period.start.slice(0,10)} to ${period.end.slice(0,10)}`,rule:'Vimshottari timeline from natal sidereal Moon; uses a 365.2425-day year and the versioned approximate Lahiri ayanamsa. Dates are symbolic calculation estimates, not guaranteed events.'}));
  const major=timeline.find(p=>now>=Date.parse(p.start)&&now<Date.parse(p.end));
  if(!major)return result;
  result.push({id:'vedic:dasha:mahadasha',label:'Current Vimshottari mahadasha',value:`${major.lord} (${major.start.slice(0,10)} to ${major.end.slice(0,10)})`,rule:'Current major period within the calculated timeline.'});
  const sub=major.subperiods.find(p=>now>=Date.parse(p.start)&&now<Date.parse(p.end));
  if(sub)result.push({id:'vedic:dasha:antardasha',label:'Current antardasha',value:`${sub.lord} (${sub.start.slice(0,10)} to ${sub.end.slice(0,10)})`,rule:'Subperiod within the calculated current major period.'});
  return result;
}

export function buildChartEvidence(profile: Profile, moduleId: 'vedic'|'western'|'lal-kitab', asOf = new Date()) {
  const warnings: string[] = [];
  const exact = Boolean(profile.birth_time_known && profile.birth_instant);
  const [year,month,day]=profile.birth_date.split('-').map(Number);
  const noon=resolveLocalBirthTime({year,month,day,hour:12,minute:0},profile.time_zone);
  if(!exact&&noon.status!=='resolved')throw new Error('The birth date could not be resolved in its time zone.');
  const instant=exact?profile.birth_instant!:(noon.status==='resolved'?noon.instant.toISOString():'');
  if (!exact) warnings.push('Birth time is unknown. Planet signs use local noon as date-only approximations; ascendant, houses, dasha and precise timing are withheld. Moon sign near a boundary may be uncertain.');
  const chart = calculateChart({ birthInstant: instant, latitude: profile.latitude, longitude: profile.longitude, timeKnown: exact, timeZone: profile.time_zone });
  const factors: Factor[] = [];
  const system=moduleId==='western'?'western':'vedic';
  const planets = system==='western' ? chart.western.planets.map(p=>({name:p.name,sign:p.tropicalSign,degree:p.tropicalLongitude%30})) : chart.vedic.planets.filter(p=>!['Uranus','Neptune','Pluto'].includes(p.name)).map(p=>({name:p.name,sign:p.sign,degree:p.degree}));
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
      value:`${planet.sign}${exact?` ${planet.degree.toFixed(1)}°`:' (date-only estimate)'}${house?`, whole-sign house ${house}`:''}`,
      rule:`${planet.name} relates symbolically to ${theme}; ${planet.sign} expresses this in a ${style} way${house?` in ${houseThemes[house-1]}`:''}.`});
  }
  if(exact){
    factors.push({id:`${moduleId}:ascendant`,label:'Ascendant',value:rising,rule:`Whole-sign houses begin with ${rising}.`});
    factors.push(...(system==='western'?majorAspects(chart,system):vedicAspects(chart)));
    if(system==='western')factors.push(...westernTransitWindows(chart,asOf));
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
  return {version:`${CALCULATOR_VERSION}+${CHART_RULES_VERSION}`,method:moduleId,asOf:asOf.toISOString(),exactBirthTime:exact,factors,warnings,dashaTimeline:moduleId==='vedic'&&exact?vimshottariTimeline(chart,instant):undefined};
}
