import { calculateChart, CALCULATOR_VERSION } from './chart';

const input={birthInstant:'1995-01-12T05:30:00.000Z',latitude:28.6139,longitude:77.209,timeKnown:true,timeZone:'Asia/Kolkata'};

describe('calculateChart',()=>{
  it('returns deterministic versioned western and vedic placements',()=>{
    const first=calculateChart(input);const second=calculateChart(input);
    expect(first).toEqual(second);
    expect(first.calculatorVersion).toBe(CALCULATOR_VERSION);
    expect(first.western.planets).toHaveLength(10);
    expect(first.vedic.planets).toHaveLength(10);
    expect(first.western.houseCusps).toHaveLength(12);
    expect(first.vedic.moonNakshatra.pada).toBeGreaterThanOrEqual(1);
    expect(first.vedic.moonNakshatra.pada).toBeLessThanOrEqual(4);
  });

  it('rejects invalid instants instead of storing made-up chart data',()=>{
    expect(()=>calculateChart({...input,birthInstant:'not-a-date'})).toThrow('Birth instant is invalid.');
  });

  it('moves the ascendant forward through a full civil day',()=>{
    const start=Date.parse(input.birthInstant);const longitudes=Array.from({length:25},(_,hour)=>calculateChart({...input,birthInstant:new Date(start+hour*3600000).toISOString()}).western.ascendantLongitude);let travel=0;
    for(let index=1;index<longitudes.length;index++)travel+=((longitudes[index]-longitudes[index-1]+360)%360);
    expect(travel).toBeGreaterThan(360);
    expect(travel).toBeLessThan(362);
  });
});
