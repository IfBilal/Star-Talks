export type LocalBirthTime={year:number;month:number;day:number;hour:number;minute:number};
function partsAt(instant:Date,zone:string){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(instant);return Object.fromEntries(parts.map(p=>[p.type,p.value]));}
export function resolveLocalBirthTime(local:LocalBirthTime,zone:string):{status:'resolved';instant:Date}|{status:'ambiguous'}|{status:'nonexistent'} {
  try{new Intl.DateTimeFormat('en',{timeZone:zone}).format(new Date());}catch{return{status:'nonexistent'}}
  const target=Date.UTC(local.year,local.month-1,local.day,local.hour,local.minute);const offsets=new Set<number>();
  for(let hours=-48;hours<=48;hours+=3){const d=new Date(target+hours*3600000);const p=partsAt(d,zone);const asUtc=Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day),Number(p.hour),Number(p.minute));offsets.add(asUtc-d.getTime());}
  const matches=[...offsets].map(offset=>new Date(target-offset)).filter(d=>{const p=partsAt(d,zone);return Number(p.year)===local.year&&Number(p.month)===local.month&&Number(p.day)===local.day&&Number(p.hour)===local.hour&&Number(p.minute)===local.minute;});
  if(matches.length===1)return{status:'resolved',instant:matches[0]};return{status:matches.length?'ambiguous':'nonexistent'};
}
