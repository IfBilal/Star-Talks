import { resolveLocalBirthTime } from './timezone';

describe('resolveLocalBirthTime',()=>{
  it('resolves a standard local time using the historical zone offset',()=>{
    const result=resolveLocalBirthTime({year:2024,month:1,day:15,hour:12,minute:30},'America/New_York');
    expect(result.status).toBe('resolved');
    if(result.status==='resolved')expect(result.instant.toISOString()).toBe('2024-01-15T17:30:00.000Z');
  });

  it('identifies local times skipped when daylight saving begins',()=>{
    expect(resolveLocalBirthTime({year:2024,month:3,day:10,hour:2,minute:30},'America/New_York')).toEqual({status:'nonexistent'});
  });

  it('identifies local times repeated when daylight saving ends',()=>{
    expect(resolveLocalBirthTime({year:2024,month:11,day:3,hour:1,minute:30},'America/New_York')).toEqual({status:'ambiguous'});
  });

  it('handles a zone without daylight saving changes',()=>{
    const result=resolveLocalBirthTime({year:1995,month:1,day:12,hour:10,minute:30},'Asia/Karachi');
    expect(result.status).toBe('resolved');
    if(result.status==='resolved')expect(result.instant.toISOString()).toBe('1995-01-12T05:30:00.000Z');
  });
});
