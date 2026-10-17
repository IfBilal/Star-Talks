import { handleAction } from './index.ts';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.117.2';

import { fixture, user, profileId, mediaId, type Row } from './test-fixture.ts';
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
    return Response.json({output:[{content:[{type:'output_text',text:JSON.stringify(result)}]}],usage:{input_tokens:120,output_tokens:30}});
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
   assert([...f.claims.values()].some(claim=>(claim.inputTokens??0)>=120&&(claim.outputTokens??0)>=30),moduleId+' provider usage was not recorded');
  }
 }finally{globalThis.fetch=originalFetch;if(originalKey)Deno.env.set('OPENAI_API_KEY',originalKey);else Deno.env.delete('OPENAI_API_KEY');}
});

Deno.test('A rejected AI request releases its reserved usage allowance',async()=>{
 const f=fixture();let rejected=false;
 try{await handleAction(f.db,user,{action:'ask-module',conversationId:crypto.randomUUID(),question:'What about work?',requestId:crypto.randomUUID()});}
 catch{rejected=true;}
 assert(rejected,'Missing conversation was accepted');
 assert(f.events.includes('finish_ai_preview_request'),'Rejected claim was not released');
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

Deno.test('First readings are not questions: own daily cap, widened claim ceiling, 10/100 question limits',async()=>{
 const originalFetch=globalThis.fetch;const originalKey=Deno.env.get('OPENAI_API_KEY');Deno.env.set('OPENAI_API_KEY','offline-fixture');
 const prev=Deno.env.get('AI_FIRST_READING_DAILY_LIMIT');Deno.env.set('AI_FIRST_READING_DAILY_LIMIT','2');
 try{
  const f=fixture();
  globalThis.fetch=async(url,init)=>{
   const body=JSON.parse(String(init?.body));
   if(String(url).endsWith('/moderations'))return Response.json({results:[{flagged:false}]});
   const input=JSON.parse(body.input);const factors=input.evidence.factors;const first=body.instructions.includes('This is the First Instinct Reading');
   const result={scopeDecision:'in_scope',directAnswer:'Synthetic answer',insights:first?factors.slice(0,3).map((v:Row)=>({title:v.label,body:'x',sourceRefs:[v.id]})):[],supportingFactors:factors.slice(0,2).map((v:Row)=>({sourceRef:v.id,explanation:'x'})),conflictingFactors:[],timing:null,uncertainty:'Symbolic',plainLanguageExplanation:'x',followUps:['Next?'],sourceRefs:factors.slice(0,2).map((v:Row)=>v.id)};
   return Response.json({output:[{content:[{type:'output_text',text:JSON.stringify(result)}]}],usage:{input_tokens:100,output_tokens:20}});
  };
  const one:any=await handleAction(f.db,user,{action:'start-reading',moduleId:'tarot',requestId:crypto.randomUUID()});
  assert(f.claimArgs[0].p_daily_limit===11&&f.claimArgs[0].p_global_daily_limit===101,'First reading claim should be 10+1 and 100+1');
  await handleAction(f.db,user,{action:'ask-module',conversationId:one.conversation.id,question:'What does that mean for my work?',requestId:crypto.randomUUID()});
  assert(f.claimArgs[1].p_daily_limit===11&&f.claimArgs[1].p_global_daily_limit===101,'Question after one reading keeps a 10-question allowance');
  assert(f.claimArgs[1].p_user_daily_unit_limit===120000&&f.claimArgs[1].p_global_daily_unit_limit===700000,'Token budgets');
  await handleAction(f.db,user,{action:'start-reading',moduleId:'tarot',requestId:crypto.randomUUID()});
  let capped=0;try{await handleAction(f.db,user,{action:'start-reading',moduleId:'tarot',requestId:crypto.randomUUID()});}catch(e){capped=(e as {status?:number}).status??0;}
  assert(capped===429,'Third new reading in a day must be refused when the first-reading cap is 2');
 }finally{globalThis.fetch=originalFetch;if(prev===undefined)Deno.env.delete('AI_FIRST_READING_DAILY_LIMIT');else Deno.env.set('AI_FIRST_READING_DAILY_LIMIT',prev);if(originalKey)Deno.env.set('OPENAI_API_KEY',originalKey);else Deno.env.delete('OPENAI_API_KEY');}
});
