import { handleAction } from './index.ts';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.117.2';

// In-memory PostgREST boundary. The real action handler/calculators/provider adapter
// execute; no real auth user, uploaded photo, paid request or network is used.
type Row=Record<string,any>;
const user='11111111-1111-4111-8111-111111111111';
const profileId='22222222-2222-4222-8222-222222222222';
const mediaId='33333333-3333-4333-8333-333333333333';
function fixture(){
 const rows:Record<string,Row[]>={
  profiles:[{id:user,language_code:'en'}],
  birth_profiles:[{id:profileId,user_id:user,relationship:'self',display_name:'Synthetic fixture',birth_date:'1995-05-15',birth_time:'12:00:00',birth_instant:'1995-05-15T06:30:00Z',birth_time_known:true,latitude:28.6139,longitude:77.209,time_zone:'Asia/Kolkata',numerology_name:'Ada Test'}],
  ai_consent:['birth_and_questions','palm_image','face_image'].map(scope=>({user_id:user,scope,text_version:'2026-10-04-v1',revoked_at:null})),
  ai_modules:['vedic','western','numerology','tarot','lal-kitab','chinese-zodiac','korean-astrology','palmistry','face-reading'].map(module_id=>({module_id,is_active:true})),
  ai_media:[{id:mediaId,user_id:user,kind:'palm',storage_path:`${user}/fixture.jpg`,consent_at:new Date().toISOString(),metadata:{}}],
  ai_conversations:[],ai_messages:[],ai_feedback:[],compatibility_analyses:[],
 };
 const claims=new Map<string,{fingerprint?:string;leased?:boolean;completed?:boolean}>();
 const events:string[]=[];
 let nextSequence=0;
 const db={from(table:string){
  let filters:Array<(r:Row)=>boolean>=[],operation='read',payload:Row|Row[]={},single=false,cap=Infinity,start=0,descending=false,selected='*';
  const q:any={
   select(fields='*'){selected=fields;return q},eq(k:string,v:unknown){filters.push(r=>r[k]===v);return q},lt(k:string,v:number){filters.push(r=>r[k]<v);return q},is(k:string,v:unknown){filters.push(r=>(r[k]??null)===v);return q},in(k:string,v:unknown[]){filters.push(r=>v.includes(r[k]));return q},order(_k:string,o:{ascending:boolean}){descending=!o.ascending;return q},range(a:number,b:number){start=a;cap=b-a+1;return q},limit(n:number){cap=n;return q},or(){return q},
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
   if(item?.fingerprint&&args.p_fingerprint&&item.fingerprint!==args.p_fingerprint)return {data:null,error:{code:'22023'}};
   if(!item)claims.set(id,{fingerprint:args.p_fingerprint});return {data:true,error:null};
  }
  if(name==='lease_ai_preview_request'){if(!item)throw Error('Unclaimed');if(item.leased)return {data:'busy',error:null};if(item.completed)return {data:'complete',error:null};item.leased=true;return {data:'acquired',error:null};}
  if(name==='finish_ai_preview_request'){if(!item)throw Error('Unclaimed');item.leased=false;item.completed=args.p_success;return {data:null,error:null};}
  throw Error(name);
 },storage:{from:()=>({createSignedUrl:async()=>({data:{signedUrl:'https://example.invalid/private'},error:null})})}};
 return {db:db as unknown as SupabaseClient,rows,claims,events};
}
const assert=(value:unknown,message:string)=>{if(!value)throw Error(message);};
Deno.test('All nine real module handlers persist grounded first readings, followups and idempotent retries with mocked provider',async()=>{
 const originalFetch=globalThis.fetch;const originalKey=Deno.env.get('OPENAI_API_KEY');Deno.env.set('OPENAI_API_KEY','offline-fixture');
 try{
  for(const moduleId of ['vedic','western','numerology','tarot','lal-kitab','chinese-zodiac','korean-astrology','palmistry','face-reading']){
   const f=fixture();if(moduleId==='face-reading')f.rows.ai_media[0].kind='face';let providerCalls=0;
   globalThis.fetch=async(url,init)=>{
    providerCalls++;assert([...f.claims.values()].some(c=>c.leased),'Provider called without an exclusive lease');f.events.push('provider');
    const body=JSON.parse(String(init?.body));
    if(String(url).endsWith('/moderations'))return Response.json({results:[{flagged:false}]});
    let result:unknown;
    if(body.text.format.name==='conversation_summary')result={summary:'Synthetic summary of the conversation',userFacts:[],openQuestions:['Work direction']};
    else if(body.text.format.name==='visible_features')result={quality:'clear',retakeReason:null,observations:[{id:'a',feature:'Shape',description:'Broad visible shape',location:'centre',confidence:'high'},{id:'b',feature:'Line',description:'Visible curved line',location:'upper',confidence:'high'}]};
    else{
     const input=JSON.parse(body.input);const factors=input.evidence.factors;const first=body.instructions.includes('This is the First Instinct Reading');
     result={scopeDecision:'in_scope',directAnswer:'Synthetic provider response for '+moduleId,insights:first?factors.slice(0,3).map((v:Row)=>({title:v.label,body:'Symbolic fixture interpretation',sourceRefs:[v.id]})):[],supportingFactors:factors.slice(0,2).map((f:Row)=>({sourceRef:f.id,explanation:'Based on the supplied factor'})),conflictingFactors:[],timing:null,uncertainty:'Symbolic, not certain.',plainLanguageExplanation:'A reflection.',followUps:['Explore this theme?'],sourceRefs:[factors[0].id]};
    }
    return Response.json({output:[{content:[{type:'output_text',text:JSON.stringify(result)}]}]});
   };
   const request={action:'start-reading',moduleId,profileId,mediaId,requestId:crypto.randomUUID()};
   const first:any=await handleAction(f.db,user,request);
   assert(first.messages.length===1&&first.conversation.module_id===moduleId,moduleId+' first reading');
   const calls=providerCalls;await handleAction(f.db,user,request);assert(calls===providerCalls,moduleId+' duplicate provider call');
   let conflict=false;try{await handleAction(f.db,user,{...request,moduleId:moduleId==='tarot'?'western':'tarot'});}catch(e){conflict=(e as {status?:number}).status===409;}assert(conflict,'Request binding');
   const follow={action:'ask-module',conversationId:first.conversation.id,question:'What does that mean for my work?',requestId:crypto.randomUUID()};
   const second:any=await handleAction(f.db,user,follow);assert(second.messages.length===2,moduleId+' followup');
   const later=providerCalls;await handleAction(f.db,user,follow);assert(later===providerCalls,moduleId+' followup retry');
   assert(f.rows.ai_messages.length===3,moduleId+' duplicate messages persisted');
   const offTopic={action:'ask-module',conversationId:first.conversation.id,question:'How do I make tea?',requestId:crypto.randomUUID()};
   const offTopicCalls=providerCalls;
   const blocked:any=await handleAction(f.db,user,offTopic);
   assert(providerCalls===offTopicCalls&&blocked.messages[1].kind==='blocked',moduleId+' off-topic request used the provider');
   const blockedRetry:any=await handleAction(f.db,user,offTopic);
   assert(providerCalls===offTopicCalls&&blockedRetry.messages[1].kind==='blocked',moduleId+' off-topic retry used the provider');
   if(moduleId==='tarot'){
    for(let i=0;i<26;i++)await handleAction(f.db,user,{...follow,question:'Clarify work theme '+i,requestId:crypto.randomUUID()});
    assert(f.rows.ai_conversations[0].summary_message_count>=8,'Memory was not summarized');
    assert(f.rows.ai_conversations[0].summary.includes('Synthetic summary'),'Missing persisted summary');
    const newest:any=await handleAction(f.db,user,{action:'get-conversation',conversationId:first.conversation.id});
    assert(newest.messages.length===50&&newest.nextMessageCursor,'Latest message page missing');
    const older:any=await handleAction(f.db,user,{action:'get-conversation',conversationId:first.conversation.id,messageCursor:newest.nextMessageCursor});
    assert(older.messages.length===7&&!older.nextMessageCursor,'Older message page missing');
    const all=[...older.messages,...newest.messages];
    assert(new Set(all.map(message=>message.id)).size===57,'Pagination duplicated messages');
    assert(all.every((message,index)=>index===0||message.sequence>all[index-1].sequence),'Question and answer order changed');
   }
   assert(f.events.indexOf('lease_ai_preview_request')<f.events.indexOf('provider'),moduleId+' provider before lease');
  }
 }finally{globalThis.fetch=originalFetch;if(originalKey)Deno.env.set('OPENAI_API_KEY',originalKey);else Deno.env.delete('OPENAI_API_KEY');}
});

Deno.test('Compatibility uses one quota claim and replays a completed request without another provider call',async()=>{
 const originalFetch=globalThis.fetch;const originalKey=Deno.env.get('OPENAI_API_KEY');Deno.env.set('OPENAI_API_KEY','offline-fixture');
 const f=fixture();const secondId='44444444-4444-4444-8444-444444444444';
 f.rows.birth_profiles.push({...f.rows.birth_profiles[0],id:secondId,display_name:'Second fixture',relationship:'partner'});
 let providerCalls=0;
 globalThis.fetch=async(url,init)=>{
  providerCalls++;
  if(String(url).endsWith('/moderations'))return Response.json({results:[{flagged:false}]});
  const body=JSON.parse(String(init?.body));const args=JSON.parse(body.input);
  assert(body.text.format.name==='compatibility_result','Unexpected provider request');
  return Response.json({output:[{content:[{type:'output_text',text:JSON.stringify({overview:'A symbolic comparison.',strengths:['Shared themes'],challenges:['Different emphasis'],dynamics:'A balanced reading.',longTermOutlook:'Possibilities vary.',timing:null,sourceRefs:[args.factors[0].id]})}]}]});
 };
 try{
  const request={action:'analyze-compatibility',firstProfileId:profileId,secondProfileId:secondId,method:'tarot',relationshipType:'friendship',requestId:crypto.randomUUID()};
  const first:any=await handleAction(f.db,user,request);
  assert(first.analysis.module_id==='tarot','Compatibility was not saved');
  assert(f.events.filter(event=>event==='claim_ai_preview_request').length===1,'Compatibility claimed quota twice');
  const calls=providerCalls;
  const again:any=await handleAction(f.db,user,request);
  assert(again.analysis.id===first.analysis.id&&providerCalls===calls,'Compatibility retry invoked provider');
 }finally{globalThis.fetch=originalFetch;if(originalKey)Deno.env.set('OPENAI_API_KEY',originalKey);else Deno.env.delete('OPENAI_API_KEY');}
});
