import { calculateChart } from '../../src/features/astrology/chart.ts';
const cases=JSON.parse(process.argv[2]);
const out=cases.map(c=>{const r=calculateChart({birthInstant:c.utc,latitude:c.lat,longitude:c.lon,timeKnown:true,timeZone:'UTC'});
 const v=r.vedic;const p=Object.fromEntries(v.planets.map(x=>[x.name,x.longitude]));
 return {id:c.id,ayan:v.ayanamsa.longitude,asc:v.ascendantLongitude,sun:p.Sun,moon:p.Moon,mars:p.Mars,jupiter:p.Jupiter,saturn:p.Saturn,rahu:v.meanLunarNode.rahuLongitude,nak:v.moonNakshatra.name,pada:v.moonNakshatra.pada,dasha:v.vimshottariAtBirth.mahadashaLord,rem:v.vimshottariAtBirth.remainingYears}});
console.log(JSON.stringify(out));
