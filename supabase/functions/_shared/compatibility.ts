import { calculateChart } from '../../../src/features/astrology/chart.ts';
import { calculateFourPillars } from './four-pillars.ts';
import { calculateNumerology } from './numerology.ts';
import { drawTarot } from './tarot.ts';

export const COMPATIBILITY_VERSION = 'symbolic-compatibility/1.1.0';
export type CompatibilityMethod = 'western'|'vedic'|'numerology'|'chinese-zodiac'|'korean-astrology'|'tarot';
type Person = { birth_date:string;birth_time:string|null;birth_instant:string|null;birth_time_known:boolean;latitude:number;longitude:number;time_zone:string;numerology_name:string|null;display_name:string };
type Factor = {id:string;label:string;value:string;explanation:string};

const signElement:Record<string,string> = {Aries:'Fire',Taurus:'Earth',Gemini:'Air',Cancer:'Water',Leo:'Fire',Virgo:'Earth',Libra:'Air',Scorpio:'Water',Sagittarius:'Fire',Capricorn:'Earth',Aquarius:'Air',Pisces:'Water'};
const supportive = (a:string,b:string) => a===b || (a==='Fire'&&b==='Air') || (a==='Air'&&b==='Fire') || (a==='Earth'&&b==='Water') || (a==='Water'&&b==='Earth');
const distance = (a:number,b:number) => {const d=Math.abs(a-b)%360;return Math.min(d,360-d);};
const findPlanet = (chart:ReturnType<typeof calculateChart>,name:string,method:'western'|'vedic') => {
  const p=chart.western.planets.find(item=>item.name===name)!;
  return method==='western'?p.tropicalLongitude:p.siderealLongitude;
};

export function buildCompatibility(a:Person,b:Person,method:CompatibilityMethod) {
  const factors:Factor[]=[];
  const warnings:string[]=[];
  let score=50;
  if(method==='tarot') {
    const roles=['Shared background','Current dynamic','Possible direction'];
    const cards=drawTarot('three');
    cards.forEach((card,index)=>factors.push({id:card.id,label:`${roles[index]} — ${card.cardName} (${card.orientation})`,value:card.meaning,explanation:`${card.positionMeaning}; a symbolic relationship card for ${a.display_name} and ${b.display_name}.`}));
    return {version:COMPATIBILITY_VERSION+'+tarot-rules/1.0.0',method,factors,warnings,score:null,scoreExplanation:'A Tarot relationship spread has no numerical compatibility score. The cards are symbolic guidance, not a prediction.'};
  }
  if(method==='western'||method==='vedic') {
    if(!a.birth_instant||!b.birth_instant||!a.birth_time_known||!b.birth_time_known)
      throw new Error('Both profiles need known birth times for this chart compatibility method.');
    const first=calculateChart({birthInstant:a.birth_instant,latitude:a.latitude,longitude:a.longitude,timeZone:a.time_zone,timeKnown:true});
    const second=calculateChart({birthInstant:b.birth_instant,latitude:b.latitude,longitude:b.longitude,timeZone:b.time_zone,timeKnown:true});
    if(method==='vedic'){
      const moons=[first.vedic.planets.find(p=>p.name==='Moon')!,second.vedic.planets.find(p=>p.name==='Moon')!];
      const relative=((Math.floor(moons[1].longitude/30)-Math.floor(moons[0].longitude/30)+12)%12)+1;
      factors.push({id:'compat:vedic:moon-rashis',label:'Sidereal Moon signs',value:`${moons[0].sign} / ${moons[1].sign}`,explanation:`The second Moon is ${relative} signs from the first, counted inclusively. Interpret as lunar relationship context, not a complete traditional marriage assessment.`});
      factors.push({id:'compat:vedic:moon-nakshatras',label:'Moon nakshatras',value:`${first.vedic.moonNakshatra.name} / ${second.vedic.moonNakshatra.name}`,explanation:'Computed lunar mansions for each profile. No traditional guna total has been calculated.'});
      for(const name of ['Venus','Mars','Jupiter','Saturn']){
        const left=first.vedic.planets.find(p=>p.name===name)!,right=second.vedic.planets.find(p=>p.name===name)!;
        factors.push({id:`compat:vedic:pair:${name.toLowerCase()}`,label:`Sidereal ${name} pair`,value:`${left.sign} / ${right.sign}`,explanation:`Compare the symbolic ${name} themes in the two sidereal signs; no Western trine, square or sextile rule is applied.`});
      }
      warnings.push('This is a sidereal chart comparison, not a complete Ashtakoota/guna or marriage suitability assessment.');
      return {version:COMPATIBILITY_VERSION,method,factors,warnings,score:null,scoreExplanation:'A qualitative sidereal comparison. No traditional guna score or numerical relationship probability is claimed.'};
    }
    for(const [left,right] of [['Sun','Moon'],['Moon','Moon'],['Venus','Mars'],['Mercury','Mercury'],['Saturn','Sun']] as const) {
      const angle=distance(findPlanet(first,left,method),findPlanet(second,right,method));
      const harmonious=Math.abs(angle-120)<=7||Math.abs(angle-60)<=5||angle<=7;
      const tense=Math.abs(angle-90)<=7||Math.abs(angle-180)<=7;
      score += harmonious ? 7 : tense ? -7 : 0;
      factors.push({id:`compat:${method}:${left.toLowerCase()}-${right.toLowerCase()}`,label:`${a.display_name} ${left} / ${b.display_name} ${right}`,
        value:`${angle.toFixed(1)}° angular separation`,
        explanation:harmonious?'A close conjunction or flowing aspect in this chart method.':tense?'A square or opposition that may require conscious adjustment.':'No major close aspect under the configured orb.'});
    }
    const suns=[first,second].map(chart=>method==='western'?chart.western.planets.find(p=>p.name==='Sun')!.tropicalSign:chart.vedic.planets.find(p=>p.name==='Sun')!.sign);
    factors.push({id:`compat:${method}:sun-elements`,label:'Sun sign elements',value:suns.map(sign=>`${sign} (${signElement[sign]})`).join(' / '),explanation:supportive(signElement[suns[0]],signElement[suns[1]])?'The element pairing is traditionally considered supportive.':'The element pairing may need more deliberate balance.'});
    score += supportive(signElement[suns[0]],signElement[suns[1]]) ? 8 : -3;

  } else if(method==='numerology') {
    const first=calculateNumerology(a.birth_date,a.numerology_name,new Date(),a.time_zone);
    const second=calculateNumerology(b.birth_date,b.numerology_name,new Date(),b.time_zone);
    for(const key of ['life-path','expression','soul-urge']) {
      const left=first.evidence.find(f=>f.id.endsWith(key));const right=second.evidence.find(f=>f.id.endsWith(key));
      if(!left||!right){warnings.push(`Both confirmed names are needed to compare ${key}.`);continue;}
      factors.push({id:`compat:numerology:${key}`,label:key.replace('-',' '),value:`${left.value} / ${right.value}`,explanation:left.value===right.value?'A matching number suggests a shared symbolic theme.':'Different numbers may describe complementary needs or different priorities.'});
      score += left.value===right.value ? 10 : 1;
    }
  } else {
    const first=calculateFourPillars({birthDate:a.birth_date,birthTime:a.birth_time,birthInstant:a.birth_instant,timeZone:a.time_zone});
    const second=calculateFourPillars({birthDate:b.birth_date,birthTime:b.birth_time,birthInstant:b.birth_instant,timeZone:b.time_zone});
    factors.push({id:`compat:${method}:day-masters`,label:method==='korean-astrology'?'Ilgan pair':'Day Master pair',value:`${first.dayMaster} / ${second.dayMaster}`,explanation:'The two day stems are the central comparison in this method.'});
    factors.push({id:`compat:${method}:element-balance`,label:'Element balance',value:`${JSON.stringify(first.elementBalance)} / ${JSON.stringify(second.elementBalance)}`,explanation:'Compares the elements counted across the available pillars for each profile.'});
    const elements=Object.keys(first.elementBalance) as (keyof typeof first.elementBalance)[];
    const overlap=elements.reduce((sum,key)=>sum+Math.min(first.elementBalance[key],second.elementBalance[key]),0);
    const union=elements.reduce((sum,key)=>sum+Math.max(first.elementBalance[key],second.elementBalance[key]),0);
    score=40+Math.round(45*overlap/Math.max(union,1));
    if(!a.birth_time||!b.birth_time)warnings.push('At least one birth hour is unknown, so hour-pillar compatibility is omitted.');
  }
  return {version:COMPATIBILITY_VERSION,method,factors,warnings,
    score:Math.max(20,Math.min(85,score)),
    scoreExplanation:'Illustrative symbolic alignment from the listed factors, not a probability or a prediction of relationship success.'};
}
