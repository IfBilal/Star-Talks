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

  it('matches JPL Horizons geocentric apparent ecliptic longitudes',()=>{
    // Reference: JPL Horizons DE441, observer ephemeris, geocenter,
    // quantity 31 (apparent ecliptic-of-date longitude), 1995-01-12 05:30 UT.
    const chart=calculateChart(input);
    const expected:Record<string,number>={Sun:291.536589,Moon:60.266636,Mercury:308.247544,Venus:244.683805,Mars:152.095769,Jupiter:246.914386,Saturn:338.997238,Uranus:296.127908,Neptune:292.991201,Pluto:239.862098};
    for(const planet of chart.western.planets)expect(planet.tropicalLongitude).toBeCloseTo(expected[planet.name],2);
  });

  it('computes the ascendant from local sidereal time and the eastern ecliptic crossing',()=>{
    // Independent geometry check using JPL Horizons local apparent sidereal
    // time (18.0638249113 h) for Delhi at this instant.
    expect(calculateChart(input).western.ascendantLongitude).toBeCloseTo(1.36446,3);
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
