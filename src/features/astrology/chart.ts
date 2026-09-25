import { Body, EclipticLongitude, SiderealTime, SunPosition } from 'astronomy-engine';

export const CALCULATOR_VERSION = 'star-talks-chart/0.2.0-astronomy-engine-2.1.19';
const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const nakshatras=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const dashaLords=['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const dashaYears=[7,20,6,10,7,18,16,19,17];
const bodies: [string,Body][]=[['Sun',Body.Sun],['Moon',Body.Moon],['Mercury',Body.Mercury],['Venus',Body.Venus],['Mars',Body.Mars],['Jupiter',Body.Jupiter],['Saturn',Body.Saturn],['Uranus',Body.Uranus],['Neptune',Body.Neptune],['Pluto',Body.Pluto]];
const norm=(angle:number)=>((angle%360)+360)%360;
const signAt=(longitude:number)=>signs[Math.floor(norm(longitude)/30)];
const eclipticLongitude=(body:Body,date:Date)=>body===Body.Sun?SunPosition(date).elon:EclipticLongitude(body,date);
export type Planet = { name:string; tropicalLongitude:number; tropicalSign:string; siderealLongitude:number; siderealSign:string; degree:number; retrograde:boolean };
export type ChartInput = { birthInstant:string; latitude:number; longitude:number; timeKnown:boolean; timeZone:string };
export type ChartResult = {
  calculatorVersion:string; ephemeris:'Astronomy Engine'; input:ChartInput;
  western:{zodiac:'tropical';houseSystem:'whole-sign';ascendantLongitude:number;ascendantSign:string;houseCusps:string[];planets:Planet[]};
  vedic:{zodiac:'sidereal';ayanamsa:{name:'Lahiri';longitude:number;methodology:string};houseSystem:'whole-sign';ascendantLongitude:number;ascendantSign:string;houseCusps:string[];planets:Array<{name:string;longitude:number;sign:string;degree:number}>;moonNakshatra:{name:string;number:number;pada:number};vimshottariAtBirth:{mahadashaLord:string;remainingYears:number};meanLunarNode:{rahuLongitude:number;ketuLongitude:number}};
};

function lahiriAyanamsa(date:Date){
  // J2000 epoch base and mean precession rate; versioned for reproducibility.
  const year=date.getUTCFullYear()+(date.getUTCMonth()+.5)/12;
  const t=year-2000;
  return 23.85675+0.013968*t+0.00000012*t*t;
}

function ascendant(date:Date,latitude:number,longitude:number){
  const t=(date.getTime()/86400000+2440587.5-2451545)/36525;
  const obliquity=(23.439291-0.0130042*t-0.00000016*t*t+0.0000005*t*t*t)*Math.PI/180;
  const theta=norm((SiderealTime(date)*15+longitude))*Math.PI/180;
  const phi=Math.max(-89.999,Math.min(89.999,latitude))*Math.PI/180;
  return norm(Math.atan2(Math.cos(theta),-(Math.sin(theta)*Math.cos(obliquity)+Math.tan(phi)*Math.sin(obliquity)))*180/Math.PI);
}

function meanNode(date:Date){
  const jd=date.getTime()/86400000+2440587.5;const t=(jd-2451545)/36525;
  return norm(125.04452-1934.136261*t+0.0020708*t*t+t*t*t/450000);
}

function cusps(asc:number){const rising=Math.floor(norm(asc)/30);return Array.from({length:12},(_,i)=>signs[(rising+i)%12]);}

export function calculateChart(input:ChartInput):ChartResult {
  const instant=new Date(input.birthInstant);if(!Number.isFinite(instant.getTime()))throw new Error('Birth instant is invalid.');
  const ayanamsa=lahiriAyanamsa(instant);const tropicalAsc=ascendant(instant,input.latitude,input.longitude);const siderealAsc=norm(tropicalAsc-ayanamsa);
  const planets=bodies.map(([name,body])=>{
    const tropicalLongitude=norm(eclipticLongitude(body,instant));const next=new Date(instant.getTime()+86400000);const previous=new Date(instant.getTime()-86400000);
    const movement=norm(eclipticLongitude(body,next)-eclipticLongitude(body,previous)+180)-180;
    return{name,tropicalLongitude,tropicalSign:signAt(tropicalLongitude),siderealLongitude:norm(tropicalLongitude-ayanamsa),siderealSign:signAt(tropicalLongitude-ayanamsa),degree:Number((tropicalLongitude%30).toFixed(3)),retrograde:name!=='Sun'&&name!=='Moon'&&movement<0};
  });
  const moon=planets.find(p=>p.name==='Moon')!;const lunarNode=norm(meanNode(instant)-ayanamsa);const nakshatraSpan=360/27;const nakshatraIndex=Math.floor(moon.siderealLongitude/nakshatraSpan);const progress=(moon.siderealLongitude%nakshatraSpan)/nakshatraSpan;const dashaIndex=nakshatraIndex%9;
  return{
    calculatorVersion:CALCULATOR_VERSION,ephemeris:'Astronomy Engine',input,
    western:{zodiac:'tropical',houseSystem:'whole-sign',ascendantLongitude:Number(tropicalAsc.toFixed(5)),ascendantSign:signAt(tropicalAsc),houseCusps:cusps(tropicalAsc),planets},
    vedic:{zodiac:'sidereal',ayanamsa:{name:'Lahiri',longitude:Number(ayanamsa.toFixed(6)),methodology:'Lahiri mean ayanamsa using J2000 base and linear precession approximation; see calculator version.'},houseSystem:'whole-sign',ascendantLongitude:Number(siderealAsc.toFixed(5)),ascendantSign:signAt(siderealAsc),houseCusps:cusps(siderealAsc),planets:planets.map(({name,siderealLongitude})=>({name,longitude:siderealLongitude,sign:signAt(siderealLongitude),degree:Number((siderealLongitude%30).toFixed(3))})),moonNakshatra:{name:nakshatras[nakshatraIndex],number:nakshatraIndex+1,pada:Math.min(4,Math.floor(progress*4)+1)},vimshottariAtBirth:{mahadashaLord:dashaLords[dashaIndex],remainingYears:Number(((1-progress)*dashaYears[dashaIndex]).toFixed(3))},meanLunarNode:{rahuLongitude:lunarNode,ketuLongitude:norm(lunarNode+180)}}
  };
}
