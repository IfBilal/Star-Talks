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
