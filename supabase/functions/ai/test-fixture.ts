import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.117.2';

// In-memory PostgREST boundary shared by the contract tests and the live-reading script.
// The real action handler/calculators/provider adapter execute; no real auth user, uploaded photo or paid request is implied.
export type Row=Record<string,any>;
export const user='11111111-1111-4111-8111-111111111111';
export const profileId='22222222-2222-4222-8222-222222222222';
export const mediaId='33333333-3333-4333-8333-333333333333';
export function fixture(options:{signedUrl?:string;profile?:Row}={}){
 const rows:Record<string,Row[]>={
  profiles:[{id:user,language_code:'en'}],
  birth_profiles:[{id:profileId,user_id:user,relationship:'self',display_name:'Synthetic fixture',birth_date:'1995-05-15',birth_time:'12:00:00',birth_instant:'1995-05-15T06:30:00Z',birth_time_known:true,latitude:28.6139,longitude:77.209,time_zone:'Asia/Kolkata',numerology_name:'Ada Test',...(options.profile??{})}],
  ai_consent:['birth_and_questions','palm_image','face_image'].map(scope=>({user_id:user,scope,text_version:'2026-10-04-v1',revoked_at:null})),
  ai_modules:['vedic','western','numerology','tarot','lal-kitab','chinese-zodiac','korean-astrology','palmistry','face-reading'].map(module_id=>({module_id,is_active:true})),
  ai_media:[{id:mediaId,user_id:user,kind:'palm',storage_path:`${user}/fixture.jpg`,consent_at:new Date().toISOString(),metadata:{}}],
  ai_conversations:[],ai_messages:[],ai_feedback:[],compatibility_analyses:[],
 };
 const claims=new Map<string,{fingerprint?:string;leased?:boolean;completed?:boolean;inputTokens?:number;outputTokens?:number}>();
 const events:string[]=[];
 const claimArgs:Row[]=[];
 let nextSequence=0;
 const db={from(table:string){
  let filters:Array<(r:Row)=>boolean>=[],operation='read',payload:Row|Row[]={},single=false,cap=Infinity,start=0,descending=false,selected='*';
  const q:any={
   select(fields='*'){selected=fields;return q},eq(k:string,v:unknown){filters.push(r=>r[k]===v);return q},lt(k:string,v:number){filters.push(r=>r[k]<v);return q},gte(k:string,v:string){filters.push(r=>String(r[k]??'')>=v);return q},is(k:string,v:unknown){filters.push(r=>(r[k]??null)===v);return q},in(k:string,v:unknown[]){filters.push(r=>v.includes(r[k]));return q},order(_k:string,o:{ascending:boolean}){descending=!o.ascending;return q},range(a:number,b:number){start=a;cap=b-a+1;return q},limit(n:number){cap=n;return q},or(){return q},
   insert(value:Row|Row[]){operation='insert';payload=value;return q},update(value:Row){operation='update';payload=value;return q},
   maybeSingle(){single=true;return q},single(){single=true;return q},
   then(resolve:(v:unknown)=>unknown){
    let data=(rows[table]??[]).filter(row=>filters.every(filter=>filter(row)));const count=data.length;if(descending)data.reverse();data=data.slice(start,start+cap);
    if(operation==='insert'){data=(Array.isArray(payload)?payload:[payload]).map(row=>({id:crypto.randomUUID(),sequence:++nextSequence,created_at:new Date().toISOString(),summary:'',first_reading_status:'pending',...row}));(rows[table]??=[]).push(...data);}
    if(operation==='update')data.forEach(row=>Object.assign(row,payload));
    const visible=selected==='*'?data:data.map(row=>Object.fromEntries(selected.split(',').map(field=>[field,row[field]])));
    return Promise.resolve(resolve({data:single?visible[0]??null:visible,error:null,count}));
   },
  };return q;
 },async rpc(name:string,args:Row){
  events.push(name);const id=args.p_request_id;const item=claims.get(id);
  if(name==='claim_ai_preview_request'){
   claimArgs.push(args);
   if(item?.fingerprint&&args.p_fingerprint&&item.fingerprint!==args.p_fingerprint)return {data:null,error:{code:'22023'}};
   if(!item)claims.set(id,{fingerprint:args.p_fingerprint});return {data:item?'existing':'claimed',error:null};
  }
  if(name==='record_ai_provider_usage'){if(!item)throw Error('Unclaimed');item.inputTokens=(item.inputTokens??0)+args.p_input_tokens;item.outputTokens=(item.outputTokens??0)+args.p_output_tokens;return {data:null,error:null};}
  if(name==='lease_ai_preview_request'){if(!item)throw Error('Unclaimed');if(item.leased)return {data:'busy',error:null};if(item.completed)return {data:'complete',error:null};item.leased=true;return {data:'acquired',error:null};}
  if(name==='finish_ai_preview_request'){if(!item)throw Error('Unclaimed');item.leased=false;item.completed=args.p_success;return {data:null,error:null};}
  throw Error(name);
 },storage:{from:()=>({createSignedUrl:async()=>({data:{signedUrl:options.signedUrl??'https://example.invalid/private'},error:null})})}};
 return {db:db as unknown as SupabaseClient,rows,claims,events,claimArgs};
}
