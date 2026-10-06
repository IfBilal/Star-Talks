import { calculateFourPillars } from './four-pillars.ts';
import { calculateNumerology } from './numerology.ts';
import { drawTarot, TAROT_DECK } from './tarot.ts';
import { buildCompatibility } from './compatibility.ts';
import { buildChartEvidence } from './chart-evidence.ts';

function equal(actual:unknown,expected:unknown,label:string) {
  if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

Deno.test('Tarot has 78 unique cards and draws without replacement',()=>{
  equal(TAROT_DECK.length,78,'deck size');
  equal(new Set(TAROT_DECK.map(card=>card.id)).size,78,'unique card IDs');
  for(let attempt=0;attempt<25;attempt++){
    const draw=drawTarot('celtic');
    equal(draw.length,10,'Celtic spread size');
    equal(new Set(draw.map(card=>card.cardId)).size,10,'drawn card IDs');
    if(draw.some(card=>!['upright','reversed'].includes(card.orientation)||!card.positionMeaning))throw new Error('Missing orientation or position meaning');
  }
});

Deno.test('Numerology uses date-only values until a full name is confirmed',()=>{
  const at=new Date('2026-10-04T00:00:00Z');
  const limited=calculateNumerology('1990-01-01',null,at,'UTC');
  equal(limited.evidence.map(item=>item.value),[3,1,3,4],'date-only numbers');
  equal(limited.warnings.length,1,'missing name warning');
  const full=calculateNumerology('1990-01-01','John Doe',at,'UTC');
  equal(full.evidence.slice(4).map(item=>item.value),[8,8,9],'name numbers');
});

Deno.test('Four Pillars changes year at Lichun and omits an unknown hour',()=>{
  const before=calculateFourPillars({birthDate:'2024-02-03',birthTime:'12:00',birthInstant:'2024-02-03T04:00:00Z',timeZone:'Asia/Shanghai'});
  const after=calculateFourPillars({birthDate:'2024-02-05',birthTime:'12:00',birthInstant:'2024-02-05T04:00:00Z',timeZone:'Asia/Shanghai'});
  equal(before.pillars[0].characters,'癸卯','pre-Lichun year');
  equal(after.pillars[0].characters,'甲辰','post-Lichun year');
  const unknown=calculateFourPillars({birthDate:'2024-02-05',birthTime:null,birthInstant:null,timeZone:'Asia/Shanghai'});
  equal(unknown.pillars.length,3,'unknown-hour pillars');
  equal(unknown.animals.secret,null,'unknown secret animal');
});

Deno.test('Tarot compatibility stores pair-specific cards without inventing a percentage',()=>{
  const first={birth_date:'1990-01-01',birth_time:null,birth_instant:null,birth_time_known:false,latitude:0,longitude:0,time_zone:'UTC',numerology_name:null,display_name:'Ada'};
  const second={...first,birth_date:'1992-02-02',display_name:'Sam'};
  const result=buildCompatibility(first,second,'tarot');
  equal(result.score,null,'Tarot has no percentage');
  equal(result.factors.length,3,'relationship spread size');
  equal(new Set(result.factors.map(factor=>factor.id)).size,3,'relationship cards unique');
  if(result.factors.some(factor=>!factor.explanation.includes('Ada')||!factor.explanation.includes('Sam')))throw new Error('Pair names missing from Tarot evidence');
});

Deno.test('Lal Kitab uses house rules distinct from Vedic chart evidence',()=>{
  const profile={birth_date:'1995-05-15',birth_instant:'1995-05-15T06:30:00.000Z',birth_time_known:true,latitude:28.6139,longitude:77.209,time_zone:'Asia/Kolkata'};
  const at=new Date('2026-10-04T00:00:00Z');
  const lal=buildChartEvidence(profile,'lal-kitab',at);
  const vedic=buildChartEvidence(profile,'vedic',at);
  equal(lal.factors.length,9,'traditional planets and nodes');
  if(lal.factors.some(factor=>!factor.id.startsWith('lal-kitab:rule:')))throw new Error('Lal Kitab rule ID missing');
  if(vedic.factors.some(factor=>factor.id.startsWith('lal-kitab:rule:')))throw new Error('Lal Kitab evidence leaked into Vedic');
});

Deno.test('Numerology rejects impossible dates and partial-script names; never invents zero numbers',()=>{
 const at=new Date('2026-10-05T00:00:00Z');
 for(const date of ['2025-02-29','1990-13-01','1990-00-01','1990-04-31']){
  let failed=false;try{calculateNumerology(date,null,at,'UTC');}catch{failed=true;}if(!failed)throw new Error('Invalid date accepted: '+date);
 }
 let rejected=false;try{calculateNumerology('1990-01-01','Ali علی',at,'UTC');}catch{rejected=true;}if(!rejected)throw new Error('Partial transliteration accepted');
 for(const name of ['Rhys','Ae']){
  const result=calculateNumerology('1990-01-01',name,at,'UTC');
  if(result.evidence.some(f=>f.value===0))throw new Error('Invented zero number');
  if(!result.warnings.length)throw new Error('Missing-letter limitation omitted');
 }
 equal(calculateNumerology('2000-02-29','José',at,'UTC').normalizedName,'JOSE','accent normalization');
});

Deno.test('Four Pillars honors local civil time across DST and rejects inconsistent instants',()=>{
 const summer=calculateFourPillars({birthDate:'1990-07-01',birthTime:'12:00:00',birthInstant:'1990-07-01T16:00:00Z',timeZone:'America/New_York'});
 const winter=calculateFourPillars({birthDate:'1990-01-01',birthTime:'12:00:00',birthInstant:'1990-01-01T17:00:00Z',timeZone:'America/New_York'});
 equal(summer.pillars.length,4,'DST profile');equal(winter.pillars.length,4,'standard-time profile');
 let rejected=false;try{calculateFourPillars({birthDate:'1990-07-01',birthTime:'12:00:00',birthInstant:'1990-07-01T17:00:00Z',timeZone:'America/New_York'});}catch{rejected=true;}if(!rejected)throw Error('Wrong historical offset accepted');
 for(const date of ['2024-02-30','2024-13-01']){
  let invalid=false;try{calculateFourPillars({birthDate:date,birthTime:null,birthInstant:null,timeZone:'UTC'});}catch{invalid=true;}if(!invalid)throw Error('Invalid calendar date accepted');
 }
});

Deno.test('Chart evidence separates Vedic drishti from Western aspects and supplies sampled transit windows',()=>{
 const profile={birth_date:'1995-05-15',birth_instant:'1995-05-15T06:30:00Z',birth_time_known:true,latitude:28.6139,longitude:77.209,time_zone:'Asia/Kolkata'};
 const at=new Date('2026-10-05T00:00:00Z');
 const vedic=buildChartEvidence(profile,'vedic',at),western=buildChartEvidence(profile,'western',at);
 if(!vedic.factors.some(f=>f.id.startsWith('vedic:drishti:')))throw Error('Missing graha drishti');
 if(vedic.factors.some(f=>/sextile|square|trine/.test(f.id)))throw Error('Western aspects leaked into Vedic');
 if(vedic.factors.some(f=>/natal:(uranus|neptune|pluto)/.test(f.id)))throw Error('Outer planets mixed into classical Vedic');
 if(!western.factors.some(f=>f.id.startsWith('western:window:')))throw Error('Missing sampled transit windows');
 const unknown=buildChartEvidence({...profile,birth_instant:null,birth_time_known:false},'western',at);
 if(unknown.factors.some(f=>/ascendant|aspect:|window:|natal:moon/.test(f.id)))throw Error('Time-sensitive evidence exposed for unknown birth hour');
 if(!unknown.warnings.some(w=>w.includes('local noon')))throw Error('Date-only convention not disclosed');
 if(unknown.factors.filter(f=>f.id.includes('natal:')).some(f=>f.value.includes('°')))throw Error('False date-only precision');
});

Deno.test('Vedic compatibility has distinct sidereal evidence and never labels a heuristic as a guna score',()=>{
 const person={birth_date:'1995-05-15',birth_time:'12:00:00',birth_instant:'1995-05-15T06:30:00Z',birth_time_known:true,latitude:28.6139,longitude:77.209,time_zone:'Asia/Kolkata',numerology_name:null,display_name:'A'};
 const result=buildCompatibility(person,{...person,display_name:'B'},'vedic');
 equal(result.score,null,'no invented guna percentage');
 if(!result.factors.some(f=>f.id==='compat:vedic:moon-rashis'))throw Error('Missing sidereal Moon comparison');
 if(result.factors.some(f=>f.value.includes('angular separation')))throw Error('Western aspect scoring leaked into Vedic');
});

Deno.test('Vimshottari timeline is contiguous and subperiods cover each full period',()=>{
 const profile={birth_date:'1995-05-15',birth_instant:'1995-05-15T06:30:00Z',birth_time_known:true,latitude:28.6139,longitude:77.209,time_zone:'Asia/Kolkata'};
 const periods=buildChartEvidence(profile,'vedic',new Date('2026-10-05T00:00:00Z')).dashaTimeline!;
 equal(periods.length,10,'period coverage');
 for(let i=0;i<periods.length;i++){
  const p=periods[i];if(i)equal(p.start,periods[i-1].end,'contiguous major periods');
  equal(p.subperiods.length,9,'nine subperiods');
  equal(p.subperiods[0].start,p.start,'subperiod start');
  if(Math.abs(Date.parse(p.subperiods[8].end)-Date.parse(p.end))>1)throw Error('Subperiod end mismatch');
 }
});
