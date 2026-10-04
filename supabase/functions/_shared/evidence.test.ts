import { calculateFourPillars } from './four-pillars.ts';
import { calculateNumerology } from './numerology.ts';
import { drawTarot, TAROT_DECK } from './tarot.ts';

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
