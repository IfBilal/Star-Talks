import { removeOwnedAiMedia } from '../_shared/media-cleanup.ts';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.117.2';
import { buildChartEvidence } from '../_shared/chart-evidence.ts';
import { buildCompatibility, type CompatibilityMethod } from '../_shared/compatibility.ts';
import { calculateFourPillars } from '../_shared/four-pillars.ts';
import { MODULES, MODULE_POLICY_VERSION, explicitlyRequestedOtherModule, isModuleId, type ModuleId } from '../_shared/modules.ts';
import { calculateNumerology, NUMBER_MEANINGS } from '../_shared/numerology.ts';
import { AI_MODEL, generateAnswer, generateCompatibility, moderate, observeImage, summarizeConversation } from '../_shared/openai.ts';
import { drawTarot, TAROT_LIBRARY_VERSION, type SpreadId } from '../_shared/tarot.ts';
import { clearlyOutsideReadingScope, OUT_OF_SCOPE_REPLY } from '../_shared/scope.ts';

const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization,apikey,content-type', 'access-control-allow-methods': 'POST,OPTIONS' };
const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'content-type': 'application/json' } });
const uuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
const must = <T>(value: T | null | undefined, message: string, status = 422): T => { if (value == null) throw new HttpError(status, message); return value; };

type Body = { action?: string; moduleId?: unknown; profileId?: unknown; mediaId?: unknown; spread?: unknown;
  conversationId?: unknown; question?: unknown; requestId?: unknown; title?: unknown; moduleFilter?: unknown;
  search?: unknown; cursor?: unknown; messageCursor?: unknown;
  messageId?: unknown; helpful?: unknown; reasons?: unknown; reportNote?: unknown;
  firstProfileId?: unknown; secondProfileId?: unknown; relationshipType?: unknown; method?: unknown; analysisId?: unknown; confirmation?: unknown; consentScope?: unknown };
const CONSENT_VERSION = '2026-10-04-v1';
const consentScopes = ['birth_and_questions','palm_image','face_image'] as const;
type ConsentScope = typeof consentScopes[number];

async function hasConsent(db:SupabaseClient,userId:string,scope:ConsentScope) {
  const {data,error}=await db.from('ai_consent').select('text_version,revoked_at').eq('user_id',userId).eq('scope',scope).maybeSingle();
  if(error)throw new HttpError(503,'AI consent could not be checked.');
  return Boolean(data && data.text_version===CONSENT_VERSION && !data.revoked_at);
}
async function requireConsent(db:SupabaseClient,userId:string,scope:ConsentScope) {
  if(!await hasConsent(db,userId,scope))throw new HttpError(403,'Review and accept the AI data consent before continuing.');
}
type Profile = { id:string; birth_date:string; birth_time:string|null; birth_instant:string|null; birth_time_known:boolean;
  latitude:number;longitude:number;time_zone:string;numerology_name:string|null;display_name:string };
type Snapshot = { moduleId: ModuleId; version: string; factors: Array<{id:string;label?:string;value?:unknown;rule?:string}>;
  warnings: string[]; profileName?: string; tarotCards?: ReturnType<typeof drawTarot>; mediaId?: string; data?: unknown };

function adminClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new HttpError(503, 'Server data service is not configured.');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function authenticatedUser(request: Request, db: SupabaseClient) {
  const bearer=request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if(!bearer)throw new HttpError(401,'Please sign in again.');
  const {data:{user},error}=await db.auth.getUser(bearer);
  if(error||!user)throw new HttpError(401,'Your session expired. Please sign in again.');
  const {data:gate,error:gateError}=await db.from('phone_gate_settings').select('enabled').eq('id',true).single();
  if(gateError||!gate)throw new HttpError(503,'Phone access policy could not be checked.');
  if(gate.enabled&&(!user.phone||!user.phone_confirmed_at))throw new HttpError(403,'Verify your WhatsApp phone number to continue.');
  return user;
}

async function selectedProfile(db: SupabaseClient, userId: string, profileId: unknown): Promise<Profile> {
  if(profileId!=null&&!uuid(profileId))throw new HttpError(422,'Choose a valid birth profile.');
  let query=db.from('birth_profiles').select('id,birth_date,birth_time,birth_instant,birth_time_known,latitude,longitude,time_zone,numerology_name,display_name').eq('user_id',userId);
  query=uuid(profileId)?query.eq('id',profileId):query.eq('relationship','self');
  const {data,error}=await query.maybeSingle();
  if(error)throw new HttpError(503,'Birth profile could not be loaded.');
  return must(data as Profile|null,'Add a birth profile before starting this module.');
}

async function claim(db: SupabaseClient, userId: string, requestId: string, fingerprint?: string) {
  const limit=Number(Deno.env.get('AI_PREVIEW_DAILY_LIMIT')||10);
  const globalLimit=Number(Deno.env.get('AI_GLOBAL_DAILY_LIMIT')||20);
  const userMinuteLimit=Number(Deno.env.get('AI_USER_MINUTE_LIMIT')||2);
  const globalMinuteLimit=Number(Deno.env.get('AI_GLOBAL_MINUTE_LIMIT')||10);
  const {data,error}=await db.rpc('claim_ai_preview_request',{p_user_id:userId,p_request_id:requestId,p_daily_limit:limit,p_fingerprint:fingerprint??null,p_global_daily_limit:globalLimit,p_user_minute_limit:userMinuteLimit,p_global_minute_limit:globalMinuteLimit});
  if(error?.code==='22023')throw new HttpError(409,'This request ID belongs to different input. Start a new request.');
  if(error)throw new HttpError(503,'Unable to check the AI preview limit.');
  if(!data)throw new HttpError(429,'AI preview is temporarily at its usage limit. Please try again later.');
}
async function lease(db:SupabaseClient,userId:string,requestId:string) {
  const {data,error}=await db.rpc('lease_ai_preview_request',{p_user_id:userId,p_request_id:requestId});
  if(error)throw new HttpError(503,'Unable to reserve this AI request.');
  if(data!=='acquired')throw new HttpError(409,data==='busy'?'This request is still processing. Please wait and retry.':'This request has already completed. Reopen its saved result.');
}
async function finish(db:SupabaseClient,userId:string,requestId:string,success:boolean) {
  const {error}=await db.rpc('finish_ai_preview_request',{p_user_id:userId,p_request_id:requestId,p_success:success});
  if(error)console.error(JSON.stringify({category:'request_lease_release_failed',requestId}));
}
async function requireEnabled(db:SupabaseClient,moduleId:string) {
  if(Deno.env.get('AI_DISABLED')==='true'||Deno.env.get('AI_DISABLED')==='1')throw new HttpError(503,'AI readings are temporarily unavailable. Your saved history is still available.');
  const disabled=(Deno.env.get('AI_DISABLED_MODULES')??'').split(',').map(item=>item.trim());
  if(disabled.includes(moduleId))throw new HttpError(503,'This AI module is temporarily unavailable. Your saved history is still available.');
  const {data,error}=await db.from('ai_modules').select('is_active').eq('module_id',moduleId).maybeSingle();
  if(error||!data||!data.is_active)throw new HttpError(503,'This AI module is temporarily unavailable. Your saved history is still available.');
}

async function evidenceFor(db: SupabaseClient, userId: string, moduleId: ModuleId, body: Body): Promise<{snapshot:Snapshot;profileId:string|null}> {
  if(moduleId==='tarot') {
    const spread:SpreadId=body.spread==='celtic'?'celtic':'three';
    const tarotCards=drawTarot(spread);
    return {profileId:null,snapshot:{moduleId,version:TAROT_LIBRARY_VERSION,factors:tarotCards.map(card=>({id:card.id,label:`${card.cardName} — ${card.position}`,value:card.orientation,rule:`${card.meaning}; position: ${card.positionMeaning}`})),warnings:[],tarotCards}};
  }
  if(moduleId==='palmistry'||moduleId==='face-reading') {
    const mediaId=must(uuid(body.mediaId)?body.mediaId:null,`Upload a ${moduleId==='palmistry'?'palm':'face'} image first.`);
    const expectedKind=moduleId==='palmistry'?'palm':'face';
    const {data:media,error}=await db.from('ai_media').select('id,kind,storage_path,consent_at,metadata').eq('id',mediaId).eq('user_id',userId).maybeSingle();
    if(error||!media||media.kind!==expectedKind||!media.consent_at)throw new HttpError(403,'A consented image owned by this account is required.');
    await requireConsent(db,userId,expectedKind==='palm'?'palm_image':'face_image');
    const {data:signed,error:signError}=await db.storage.from('ai-private').createSignedUrl(media.storage_path,90);
    if(signError||!signed?.signedUrl)throw new HttpError(503,'The image could not be opened securely.');
    const moderation=await moderate([{type:'image_url',image_url:{url:signed.signedUrl}}]);
    if(moderation.flagged)throw new HttpError(422,'This image cannot be used for a reading.');
    const observation=await observeImage(expectedKind,signed.signedUrl);
    if(observation.retakeReason||observation.observations.length<2)throw new HttpError(422,observation.retakeReason||'Please provide a clearer image with the requested features visible.');
    const factors=observation.observations.map((item,index)=>({id:`${expectedKind}:visible:${index+1}`,label:item.feature,value:item.description,rule:`Visible at ${item.location}; confidence: ${item.confidence}. Symbolic interpretation only.`}));
    return {profileId:null,snapshot:{moduleId,version:'visible-features/1.0.0',factors,warnings:[],mediaId,data:{quality:observation.quality,hand:media.metadata?.hand??null}}};
  }
  const profile=await selectedProfile(db,userId,body.profileId);
  if(moduleId==='numerology') {
    const result=calculateNumerology(profile.birth_date,profile.numerology_name,new Date(),profile.time_zone);
    return {profileId:profile.id,snapshot:{moduleId,version:result.version,profileName:profile.display_name,factors:result.evidence.map(item=>({id:item.id,label:item.label,value:item.value,rule:`${item.meaning} Interpretation: ${NUMBER_MEANINGS[item.value]??'a personal theme'}.`})),warnings:result.warnings,data:{normalizedName:result.normalizedName}}};
  }
  if(moduleId==='chinese-zodiac'||moduleId==='korean-astrology') {
    const result=calculateFourPillars({birthDate:profile.birth_date,birthTime:profile.birth_time,birthInstant:profile.birth_instant,timeZone:profile.time_zone});
    const factors=result.pillars.map(pillar=>({id:pillar.id,label:`${pillar.id.slice(7)} pillar`,value:moduleId==='korean-astrology'?pillar.korean:pillar.chinese,rule:`${pillar.yinYang} ${pillar.stemElement} stem over ${pillar.branchElement} ${pillar.animal} branch.`}));
    factors.push({id:'pillar:day-master',label:moduleId==='korean-astrology'?'Ilgan':'Day Master',value:moduleId==='korean-astrology'?result.ilgan:result.dayMaster,rule:'Day stem at the centre of the Four Pillars interpretation.'});
    factors.push({id:'pillar:element-balance',label:'Five-element balance',value:JSON.stringify(result.elementBalance),rule:'Count of the eight stem/branch characters, excluding an unknown hour.'});
    return {profileId:profile.id,snapshot:{moduleId,version:result.version,profileName:profile.display_name,factors,warnings:result.warnings,data:{animals:result.animals,boundary:result.boundary}}};
  }
  if(moduleId==='vedic'||moduleId==='western'||moduleId==='lal-kitab') {
    if(moduleId==='lal-kitab'&&!profile.birth_time_known)throw new HttpError(422,'A known birth time is needed for Lal Kitab house rules. Edit this birth profile to add it.');
    const result=buildChartEvidence(profile,moduleId);
    return {profileId:profile.id,snapshot:{moduleId,version:result.version,profileName:profile.display_name,factors:result.factors,warnings:result.warnings,data:{asOf:result.asOf,exactBirthTime:result.exactBirthTime,dashaTimeline:result.dashaTimeline}}};
  }
  throw new HttpError(400,'Unknown AI module.');
}

async function languageFor(db:SupabaseClient,userId:string) {
  const {data}=await db.from('profiles').select('language_code').eq('id',userId).maybeSingle();
  const names:Record<string,string>={en:'English',hi:'Hindi',ur:'Urdu',es:'Spanish',fr:'French',ar:'Arabic'};
  return names[data?.language_code]??'English';
}

async function storedMessages(db:SupabaseClient,conversationId:string,requestId?:string) {
  let query=db.from('ai_messages').select('id,sequence,role,kind,body,structured_payload,source_refs,created_at,request_id').eq('conversation_id',conversationId);
  if(requestId)query=query.eq('request_id',requestId);
  const {data,error}=await query.order('sequence',{ascending:false}).limit(50);
  if(error)throw new HttpError(503,'Conversation could not be loaded.');
  return (data??[]).reverse();
}
async function pagedMessages(db:SupabaseClient,conversationId:string,cursor:unknown) {
  const pageSize=50;
  let query=db.from('ai_messages').select('id,sequence,role,kind,body,structured_payload,source_refs,created_at,request_id').eq('conversation_id',conversationId).order('sequence',{ascending:false}).limit(pageSize+1);
  const before=cursor as {createdAt?:unknown;id?:unknown}|null;
  if(before&&uuid(before.id)){
    const {data:anchor,error}=await db.from('ai_messages').select('sequence').eq('conversation_id',conversationId).eq('id',before.id).maybeSingle();
    if(error||!anchor)throw new HttpError(422,'This message page is no longer available. Reopen the conversation.');
    query=query.lt('sequence',anchor.sequence);
  }
  const {data,error}=await query;
  if(error)throw new HttpError(503,'Conversation messages could not be loaded.');
  const rows=data??[];const page=rows.slice(0,pageSize);const last=page[page.length-1];
  return {messages:page.reverse(),nextMessageCursor:rows.length>pageSize&&last?{createdAt:last.created_at,id:last.id}:null};
}

async function removeMedia(db:SupabaseClient,userId:string,mediaId:string) {
  const {data:media}=await db.from('ai_media').select('storage_path').eq('id',mediaId).eq('user_id',userId).maybeSingle();
  if(!media)return;
  const {data:other}=await db.from('ai_conversations').select('id').eq('user_id',userId).contains('input_snapshot',{mediaId}).limit(1);
  if(other?.length)return;
  const {error:storageError}=await db.storage.from('ai-private').remove([media.storage_path]);
  if(storageError)throw new HttpError(503,'Conversation was removed, but its photo could not be cleaned up.');
  const {error:removeError}=await db.from('ai_media').delete().eq('id',mediaId).eq('user_id',userId);
  if(removeError)throw new HttpError(503,'Photo metadata could not be removed. Please retry.');
}

async function requireConversationMediaAccess(db:SupabaseClient,userId:string,conversation:{module_id:string;input_snapshot:Snapshot}) {
  const scope=conversation.module_id==='palmistry'?'palm_image':conversation.module_id==='face-reading'?'face_image':null;
  if(!scope)return;
  await requireConsent(db,userId,scope);
  const mediaId=conversation.input_snapshot?.mediaId;
  if(!uuid(mediaId))throw new HttpError(422,'This reading photo is no longer available. Start a new reading with a photo.');
  const {data}=await db.from('ai_media').select('id').eq('id',mediaId).eq('user_id',userId).maybeSingle();
  if(!data)throw new HttpError(422,'This reading photo was deleted. Start a new reading with a photo.');
}

async function commitMessages(db:SupabaseClient,rows:Array<Record<string,unknown>>) {
  // PostgREST bulk inserts use one column set for every row. Supply values
  // explicitly so a question row cannot receive NULL for assistant-only fields.
  const complete=rows.map(row=>({
    ...row,
    structured_payload:row.structured_payload??{},
    source_refs:row.source_refs??[],
    provider_model:row.provider_model??null,
  }));
  const {data,error}=await db.from('ai_messages').insert(complete).select('id,sequence,role,kind,body,structured_payload,source_refs,created_at,request_id');
  if(error)throw new HttpError(503,'Answer could not be saved. Please retry.');
  return data;
}

async function generated(db:SupabaseClient,conversation:{id:string;user_id:string;module_id:ModuleId;input_snapshot:Snapshot;summary:string;summary_message_count?:number},question:string,requestId:string,first:boolean) {
  const snapshot=conversation.input_snapshot;
  const refs=snapshot.factors.map(factor=>factor.id);
  const recent=first?{data:[],count:0,error:null}:await db.from('ai_messages').select('role,body',{count:'exact'}).eq('conversation_id',conversation.id).order('sequence',{ascending:false}).limit(10);
  if(recent.error)throw new HttpError(503,'Conversation context could not be loaded.');
  const messages=(recent.data??[]).reverse();
  const {answer,model}=await generateAnswer({moduleId:conversation.module_id,evidence:snapshot,allowedSourceRefs:refs,question,
    history:messages.slice(-10).map(item=>({role:item.role,body:item.body})),summary:conversation.summary||'',language:await languageFor(db,conversation.user_id),first});
  if(answer.scopeDecision==='in_scope'){
    const postModeration=await moderate(JSON.stringify(answer));
    if(postModeration.flagged)throw new HttpError(422,'The generated answer could not be shown safely. Please ask in another way.');
  }
  const body=answer.directAnswer;
  const rows=first?[{conversation_id:conversation.id,user_id:conversation.user_id,role:'assistant',kind:'first',body,structured_payload:answer,source_refs:answer.sourceRefs,request_id:requestId,provider_model:model}]
    :[{conversation_id:conversation.id,user_id:conversation.user_id,role:'user',kind:'question',body:question,request_id:requestId},
      {conversation_id:conversation.id,user_id:conversation.user_id,role:'assistant',kind:answer.scopeDecision==='out_of_scope'?'blocked':'answer',body,structured_payload:answer,source_refs:answer.sourceRefs,request_id:requestId,provider_model:model}];
  const saved=await commitMessages(db,rows);
  await db.from('ai_conversations').update({first_reading_status:'ready',updated_at:new Date().toISOString()}).eq('id',conversation.id);
  const total=(recent.count??messages.length)+(saved?.length??0);
  const summarized=conversation.summary_message_count??0;
  const summarizeThrough=Math.min(Math.max(0,total-10),summarized+30);
  if(summarizeThrough>=8 && summarizeThrough-summarized>=6) {
    try {
      const {data:older,error}=await db.from('ai_messages').select('role,body').eq('conversation_id',conversation.id).order('sequence',{ascending:true}).range(summarized,summarizeThrough-1);
      if(error||!older)throw new Error('Summary history unavailable.');
      const summary=await summarizeConversation(conversation.summary||'',older);
      const {error:saveError}=await db.from('ai_conversations').update({summary,summary_message_count:summarizeThrough}).eq('id',conversation.id);
      if(saveError)throw new Error('Summary could not be saved.');
    } catch { console.error(JSON.stringify({category:'summary_failed',conversationId:conversation.id})); }
  }
  return saved;
}

export async function handleAction(db:SupabaseClient,userId:string,body:Body) {
  if (['start-reading','ask-module','analyze-compatibility'].includes(body.action??'')) {
    const requestId=must(uuid(body.requestId)?body.requestId:null,'A valid request ID is required.');
    const keys=['action','moduleId','profileId','mediaId','spread','conversationId','question','firstProfileId','secondProfileId','relationshipType','method'] as const;
    const input=JSON.stringify(keys.map(key=>[key,body[key]??null]));
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input));
    const fingerprint=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
    await claim(db,userId,requestId,fingerprint);
  }
  if(body.action==='list-modules') {
    const allDisabled=['true','1'].includes(Deno.env.get('AI_DISABLED')??'');
    const disabled=(Deno.env.get('AI_DISABLED_MODULES')??'').split(',').map(item=>item.trim());
    const {data,error}=await db.from('ai_modules').select('module_id,is_active');
    if(error)throw new HttpError(503,'AI module registry is unavailable.');
    const active=new Set((data??[]).filter(row=>row.is_active).map(row=>row.module_id));
    return {modules:Object.entries(MODULES).map(([id,config])=>({id,name:config.name,input:config.input,available:!allDisabled&&!disabled.includes(id)&&active.has(id)})),version:MODULE_POLICY_VERSION};
  }
  if(body.action==='get-consent') {
    const {data,error}=await db.from('ai_consent').select('scope,text_version,revoked_at').eq('user_id',userId);
    if(error)throw new HttpError(503,'AI consent could not be loaded.');
    return {version:CONSENT_VERSION,accepted:Object.fromEntries(consentScopes.map(scope=>[scope,Boolean(data?.some(row=>row.scope===scope&&row.text_version===CONSENT_VERSION&&!row.revoked_at))]))};
  }
  if(body.action==='accept-consent'||body.action==='revoke-consent') {
    const scope=consentScopes.find(value=>value===body.consentScope);
    if(!scope)throw new HttpError(422,'Select a valid consent type.');
    const update:{user_id:string;scope:ConsentScope;text_version:string;accepted_at:string;revoked_at:string|null}={
      user_id:userId,scope,text_version:CONSENT_VERSION,accepted_at:new Date().toISOString(),
      revoked_at:body.action==='accept-consent'?null:new Date().toISOString(),
    };
    const {error}=await db.from('ai_consent').upsert(update,{onConflict:'user_id,scope'});
    if(error)throw new HttpError(503,'AI consent could not be saved.');
    return {saved:true,scope,accepted:body.action==='accept-consent'};
  }
  if(body.action==='delete-all-ai-history') {
    if(body.confirmation!=='DELETE')throw new HttpError(422,'Confirm deletion of all AI history.');
    const {error}=await db.from('ai_conversations').delete().eq('user_id',userId);
    if(error)throw new HttpError(503,'AI history could not be deleted.');
    await removeOwnedAiMedia(db,userId);
    const {error:mediaError}=await db.from('ai_media').delete().eq('user_id',userId);
    if(mediaError)throw new HttpError(503,'Photo metadata could not be removed. Please retry.');
    return {deleted:true};
  }
  if(body.action==='list-compatibility') {
    const {data,error,count}=await db.from('compatibility_analyses').select('id,relationship_type,module_id,result,created_at',{count:'exact'}).eq('user_id',userId).order('created_at',{ascending:false}).limit(30);
    if(error)throw new HttpError(503,'Compatibility history is unavailable.');return {analyses:data??[],total:count??data?.length??0};
  }
  if(body.action==='get-compatibility') {
    const id=must(uuid(body.analysisId)?body.analysisId:null,'A valid analysis ID is required.');
    const {data,error}=await db.from('compatibility_analyses').select('*').eq('id',id).eq('user_id',userId).maybeSingle();
    if(error||!data)throw new HttpError(404,'Compatibility analysis was not found.');
    const {data:profiles, error:profilesError}=await db.from('birth_profiles').select('id,updated_at').eq('user_id',userId).in('id',[data.first_profile_id,data.second_profile_id]);
    if(profilesError)throw new HttpError(503,'Profile versions could not be checked.');
    return {analysis:data,stale:profiles?.some(profile=>new Date(profile.updated_at).getTime()>new Date(data.created_at).getTime())??false};
  }
  if(body.action==='open-compatibility-chat') {
    await requireConsent(db,userId,'birth_and_questions');
    const analysisId=must(uuid(body.analysisId)?body.analysisId:null,'A valid analysis ID is required.');
    const {data:analysis,error:analysisError}=await db.from('compatibility_analyses').select('*').eq('id',analysisId).eq('user_id',userId).maybeSingle();
    if(analysisError||!analysis)throw new HttpError(404,'Compatibility analysis was not found.');
    const {data:existing}=await db.from('ai_conversations').select('id,module_id').eq('user_id',userId).eq('compatibility_analysis_id',analysisId).maybeSingle();
    if(existing)return {conversation:existing};
    const factors=(analysis.factors as Array<{id:string;label:string;value:string;explanation:string}>).map(item=>({id:item.id,label:item.label,value:item.value,rule:item.explanation}));
    const result=analysis.result as {firstName:string;secondName:string;overview:string;strengths:string[];challenges:string[];dynamics:string;longTermOutlook:string;timing:string|null;sourceRefs:string[];warnings?:string[]};
    const snapshot:Snapshot={moduleId:analysis.module_id,version:analysis.method_version,factors,warnings:result.warnings??[],profileName:`${result.firstName} & ${result.secondName}`,data:{compatibility:true,analysisId,relationshipType:analysis.relationship_type}};
    const {data:conversation,error}=await db.from('ai_conversations').insert({user_id:userId,module_id:analysis.module_id,compatibility_analysis_id:analysisId,title:`${result.firstName} & ${result.secondName} compatibility`,methodology_version:analysis.method_version,prompt_version:MODULE_POLICY_VERSION,input_snapshot:snapshot,input_fingerprint:JSON.stringify(factors.map(item=>[item.id,item.value])),first_reading_status:'ready'}).select('id,module_id').single();
    if(error||!conversation){const {data:concurrent}=await db.from('ai_conversations').select('id,module_id').eq('user_id',userId).eq('compatibility_analysis_id',analysisId).maybeSingle();if(concurrent)return {conversation:concurrent};throw new HttpError(503,'Compatibility chat could not be opened.');}
    const sourceRefs=Array.isArray(result.sourceRefs)?result.sourceRefs:[];
    const insights=[
      {title:'Strengths',body:result.strengths.slice(0,3).join(' • '),sourceRefs},
      {title:'Challenges',body:result.challenges.slice(0,3).join(' • '),sourceRefs},
      {title:'Relationship dynamics',body:result.dynamics,sourceRefs},
    ];
    const {error:messageError}=await db.from('ai_messages').insert({conversation_id:conversation.id,user_id:userId,role:'assistant',kind:'first',body:result.overview,structured_payload:{directAnswer:result.overview,insights,supportingFactors:[],conflictingFactors:[],timing:result.timing,uncertainty:'Symbolic comparison, not a prediction of relationship success.',plainLanguageExplanation:result.longTermOutlook,followUps:['How can we work with our strengths?','Where might we need more communication?'],sourceRefs},source_refs:sourceRefs});
    if(messageError){await db.from('ai_conversations').delete().eq('id',conversation.id).eq('user_id',userId);throw new HttpError(503,'Compatibility chat could not be prepared.');}
    return {conversation};
  }
  if(body.action==='analyze-compatibility') {
    await requireConsent(db,userId,'birth_and_questions');
    const firstId=must(uuid(body.firstProfileId)?body.firstProfileId:null,'Choose the first profile.');
    const secondId=must(uuid(body.secondProfileId)?body.secondProfileId:null,'Choose the second profile.');
    if(firstId===secondId)throw new HttpError(422,'Choose two different profiles.');
    const requestId=must(uuid(body.requestId)?body.requestId:null,'A valid request ID is required.');
    const type=body.relationshipType;
    if(!['love','marriage','friendship','business'].includes(String(type)))throw new HttpError(422,'Choose a relationship type.');
    const method=body.method;
    if(!['western','vedic','numerology','chinese-zodiac','korean-astrology','tarot'].includes(String(method)))throw new HttpError(422,'Choose a supported compatibility method.');
    const selectedMethod=method as CompatibilityMethod;
    await requireEnabled(db,selectedMethod);
    const {data:existing}=await db.from('compatibility_analyses').select('*').eq('user_id',userId).eq('request_id',requestId).maybeSingle();
    if(existing)return {analysis:existing};
    const {data:people,error}=await db.from('birth_profiles').select('id,display_name,birth_date,birth_time,birth_instant,birth_time_known,latitude,longitude,time_zone,numerology_name').eq('user_id',userId).in('id',[firstId,secondId]);
    if(error||people?.length!==2)throw new HttpError(404,'Both profiles must belong to your account.');
    const first=people.find(person=>person.id===firstId)!;const second=people.find(person=>person.id===secondId)!;
    let evidence:ReturnType<typeof buildCompatibility>;
    try{evidence=buildCompatibility(first,second,selectedMethod);}catch(cause){throw new HttpError(422,cause instanceof Error?cause.message:'Compatibility inputs are incomplete.');}
    await lease(db,userId,requestId);
    try {
      const {result,model}=await generateCompatibility({method:selectedMethod,relationshipType:String(type),firstName:first.display_name,secondName:second.display_name,factors:evidence.factors,warnings:evidence.warnings,language:await languageFor(db,userId)});
      const outputModeration=await moderate([result.overview,...result.strengths,...result.challenges,result.dynamics,result.longTermOutlook].join('\n'));
      if(outputModeration.flagged)throw new HttpError(422,'The compatibility result could not be shown safely. Please try again later.');
      const stored={...result,firstName:first.display_name,secondName:second.display_name,score:evidence.score,scoreExplanation:evidence.scoreExplanation,warnings:evidence.warnings,providerModel:model};
      const {data:analysis,error:saveError}=await db.from('compatibility_analyses').insert({user_id:userId,first_profile_id:firstId,second_profile_id:secondId,relationship_type:type,module_id:selectedMethod,method_version:evidence.version,factors:evidence.factors,result:stored,request_id:requestId}).select('*').single();
      if(saveError||!analysis)throw new HttpError(503,'Compatibility analysis could not be saved.');
      await finish(db,userId,requestId,true);return {analysis};
    }catch(error){await finish(db,userId,requestId,false);throw error;}
  }
  if(body.action==='list-conversations') {
    const pageSize=20;
    let query=db.from('ai_conversations').select('id,module_id,title,first_reading_status,created_at,updated_at,birth_profile_id',{count:'exact'}).eq('user_id',userId).order('updated_at',{ascending:false}).order('id',{ascending:false}).limit(pageSize+1);
    if(isModuleId(body.moduleFilter))query=query.eq('module_id',body.moduleFilter);
    const search=typeof body.search==='string'?body.search.trim().slice(0,80):'';
    if(search)query=query.ilike('title',`%${search.replace(/[\\%_]/g,'\\$&')}%`);
    const cursor=body.cursor as {updatedAt?:unknown;id?:unknown}|null;
    if(cursor&&typeof cursor.updatedAt==='string'&&/^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|\+\d{2}:\d{2})$/.test(cursor.updatedAt)&&uuid(cursor.id))
      query=query.or(`updated_at.lt.${cursor.updatedAt},and(updated_at.eq.${cursor.updatedAt},id.lt.${cursor.id})`);
    const {data,error,count}=await query;if(error)throw new HttpError(503,'Reading history is unavailable.');
    const rows=data??[];const page=rows.slice(0,pageSize);const last=page[page.length-1];
    return {conversations:page,total:count??page.length,nextCursor:rows.length>pageSize&&last?{updatedAt:last.updated_at,id:last.id}:null};
  }
  if(body.action==='start-reading') {
    await requireConsent(db,userId,'birth_and_questions');
    const moduleId=must(isModuleId(body.moduleId)?body.moduleId:null,'Select a valid AI module.');
    await requireEnabled(db,moduleId);
    const requestId=must(uuid(body.requestId)?body.requestId:null,'A valid request ID is required.');
    const {data:existing}=await db.from('ai_conversations').select('*').eq('user_id',userId).eq('start_request_id',requestId).maybeSingle();
    if(existing) {
      const messages=await storedMessages(db,existing.id,requestId);
      if(messages.length)return {conversation:existing,messages};
      if(existing.first_reading_status==='pending'&&Date.now()-new Date(existing.created_at).getTime()<120000)throw new HttpError(409,'This reading is still being prepared. Please wait and retry.');
      await requireConversationMediaAccess(db,userId,existing);
      await lease(db,userId,requestId);
      try{const regenerated=await generated(db,existing,`Give my ${moduleId==='tarot'?'Current Energy':'First Instinct'} reading using the supplied evidence.`,requestId,true);await finish(db,userId,requestId,true);return {conversation:{...existing,first_reading_status:'ready'},messages:regenerated};}
      catch(error){await finish(db,userId,requestId,false);throw error;}
    }
    await lease(db,userId,requestId);
    let createdId: string | null = null;
    try {
      const {snapshot,profileId}=await evidenceFor(db,userId,moduleId,body);
      if(!snapshot.factors.length)throw new HttpError(422,'More input is needed for this reading.');
      const {data:conversation,error}=await db.from('ai_conversations').insert({user_id:userId,module_id:moduleId,birth_profile_id:profileId,title:`${MODULES[moduleId].name} reading`,methodology_version:snapshot.version,prompt_version:MODULE_POLICY_VERSION,calculator_version:snapshot.version,input_fingerprint:JSON.stringify(snapshot.factors.map(f=>[f.id,f.value])),input_snapshot:snapshot,start_request_id:requestId}).select('*').single();
      if(error||!conversation)throw new HttpError(503,'Reading could not be started.');
      createdId=conversation.id;
      const messages=await generated(db,conversation,`Give my ${moduleId==='tarot'?'Current Energy':'First Instinct'} reading using the supplied evidence.`,requestId,true);
      await finish(db,userId,requestId,true);
      return {conversation:{...conversation,first_reading_status:'ready'},messages};
    } catch(error) {
      if(createdId)await db.from('ai_conversations').update({first_reading_status:'failed'}).eq('id',createdId);
      await finish(db,userId,requestId,false);throw error;
    }
  }
  const conversationId=must(uuid(body.conversationId)?body.conversationId:null,'A valid conversation ID is required.');
  const {data:conversation,error:conversationError}=await db.from('ai_conversations').select('*').eq('id',conversationId).eq('user_id',userId).maybeSingle();
  if(conversationError||!conversation)throw new HttpError(404,'Conversation was not found.');
  if(body.action==='get-conversation') {
    const {messages,nextMessageCursor}=await pagedMessages(db,conversationId,body.messageCursor);
    if(!body.messageCursor && !messages.length && conversation.first_reading_status==='failed' && conversation.start_request_id) {
      await requireEnabled(db,conversation.module_id);
      await requireConsent(db,userId,'birth_and_questions');
      await requireConversationMediaAccess(db,userId,conversation);
      await claim(db,userId,conversation.start_request_id);await lease(db,userId,conversation.start_request_id);
      try{const regenerated=await generated(db,conversation,`Give my ${conversation.module_id==='tarot'?'Current Energy':'First Instinct'} reading using the supplied evidence.`,conversation.start_request_id,true);await finish(db,userId,conversation.start_request_id,true);return {conversation:{...conversation,first_reading_status:'ready'},messages:regenerated,nextMessageCursor:null};}
      catch(error){await finish(db,userId,conversation.start_request_id,false);throw error;}
    }
    const answerIds=messages.filter(item=>item.role==='assistant').map(item=>item.id);
    if(!answerIds.length)return {conversation,messages,feedback:[],nextMessageCursor};
    const {data:feedback,error:feedbackError}=await db.from('ai_feedback').select('message_id,helpful,reasons,report_note,reported_at').eq('user_id',userId).in('message_id',answerIds);
    if(feedbackError)throw new HttpError(503,'Conversation feedback could not be loaded.');
    return {conversation,messages,feedback:feedback??[],nextMessageCursor};
  }
  if(body.action==='rename-conversation') {
    const title=typeof body.title==='string'?body.title.trim():'';
    if(title.length<1||title.length>120)throw new HttpError(422,'Enter a title of 1–120 characters.');
    const {error}=await db.from('ai_conversations').update({title,updated_at:new Date().toISOString()}).eq('id',conversationId).eq('user_id',userId);
    if(error)throw new HttpError(503,'Conversation could not be renamed.');return {title};
  }
  if(body.action==='delete-conversation') {
    const mediaId=conversation.input_snapshot?.mediaId;
    const {error}=await db.from('ai_conversations').delete().eq('id',conversationId).eq('user_id',userId);
    if(error)throw new HttpError(503,'Conversation could not be deleted.');
    if(uuid(mediaId))await removeMedia(db,userId,mediaId);
    return {deleted:true};
  }
  if(body.action==='delete-reading-photo') {
    const mediaId=conversation.input_snapshot?.mediaId;
    if(!uuid(mediaId))throw new HttpError(404,'No reading photo is attached.');
    const {data:media}=await db.from('ai_media').select('storage_path').eq('id',mediaId).eq('user_id',userId).maybeSingle();
    if(!media)return {deleted:true};
    const {error:storageError}=await db.storage.from('ai-private').remove([media.storage_path]);
    if(storageError)throw new HttpError(503,'Photo could not be removed.');
    const {error:rowError}=await db.from('ai_media').delete().eq('id',mediaId).eq('user_id',userId);
    if(rowError)throw new HttpError(503,'Photo record could not be removed.');
    return {deleted:true};
  }
  if(body.action==='ask-module') {
    await requireConsent(db,userId,'birth_and_questions');
    await requireConversationMediaAccess(db,userId,conversation);
    await requireEnabled(db,conversation.module_id);
    const requestId=must(uuid(body.requestId)?body.requestId:null,'A valid request ID is required.');
    const question=typeof body.question==='string'?body.question.trim():'';
    if(question.length<2||question.length>800)throw new HttpError(422,'Ask a question of 2–800 characters.');
    const {data:repeated}=await db.from('ai_messages').select('id').eq('user_id',userId).eq('request_id',requestId).eq('role','assistant').maybeSingle();
    if(repeated){const messages=await storedMessages(db,conversationId,requestId);return {conversation,messages};}
    const active=conversation.module_id as ModuleId;
    const other=explicitlyRequestedOtherModule(question,active);
    if(other) {
      const rows=await commitMessages(db,[
        {conversation_id:conversationId,user_id:userId,role:'user',kind:'question',body:question,request_id:requestId},
        {conversation_id:conversationId,user_id:userId,role:'assistant',kind:'redirect',body:`That question belongs in ${MODULES[other].name}. Switch modules to ask it there.`,structured_payload:{recommendedModuleId:other},request_id:requestId},
      ]);
      return {conversation,messages:rows};
    }
    if(clearlyOutsideReadingScope(question)) {
      await lease(db,userId,requestId);
      try {
        const rows=await commitMessages(db,[
          {conversation_id:conversationId,user_id:userId,role:'user',kind:'question',body:question,request_id:requestId},
          {conversation_id:conversationId,user_id:userId,role:'assistant',kind:'blocked',body:OUT_OF_SCOPE_REPLY,structured_payload:{scopeDecision:'out_of_scope'},request_id:requestId},
        ]);
        await finish(db,userId,requestId,true);
        return {conversation,messages:rows};
      } catch(error) { await finish(db,userId,requestId,false); throw error; }
    }
    await lease(db,userId,requestId);
    try {
      const moderation=await moderate(question);
      if(moderation.flagged)throw new HttpError(422,'I cannot answer that question as a reading. If someone is in immediate danger, please contact local emergency help.');
      const rows=await generated(db,conversation,question,requestId,false);
      await finish(db,userId,requestId,true);return {conversation,messages:rows};
    } catch(error){await finish(db,userId,requestId,false);throw error;}
  }
  if(body.action==='submit-ai-feedback') {
    const messageId=must(uuid(body.messageId)?body.messageId:null,'Select a response.');
    const {data:message}=await db.from('ai_messages').select('id,role').eq('id',messageId).eq('conversation_id',conversationId).eq('user_id',userId).maybeSingle();
    if(!message||message.role!=='assistant')throw new HttpError(404,'Response was not found.');
    const allowedReasons=new Set(['Too generic','Did not answer','Incorrect interpretation','Unclear','Too long','Other']);
    const reasons=Array.isArray(body.reasons)?[...new Set(body.reasons.filter(x=>typeof x==='string'&&allowedReasons.has(x)))].slice(0,5):[];
    const reportNote=typeof body.reportNote==='string'?body.reportNote.slice(0,1000):null;
    const {error}=await db.from('ai_feedback').upsert({message_id:messageId,user_id:userId,helpful:typeof body.helpful==='boolean'?body.helpful:null,reasons,report_note:reportNote,reported_at:reportNote?new Date().toISOString():null,updated_at:new Date().toISOString()});
    if(error)throw new HttpError(503,'Feedback could not be saved.');return {saved:true};
  }
  throw new HttpError(400,'Unknown AI action.');
}

export const handler = async(request: Request)=>{
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST')return respond({error:'Method not allowed'},405);
  const requestId=crypto.randomUUID();
  try {
    const db=adminClient();
    const user=await authenticatedUser(request,db);
    const body=await request.json().catch(()=>null) as Body|null;
    if(!body||typeof body!=='object'||Array.isArray(body)||typeof body.action!=='string')throw new HttpError(400,'A valid AI action is required.');
    return respond(await handleAction(db,user.id,body));
  } catch(error) {
    const status=error instanceof HttpError?error.status:503;
    // Log a request ID and error category, never raw prompts, photos, credentials or birth data.
    console.error(JSON.stringify({requestId,status,category:error instanceof HttpError?'request':'server'}));
    return respond({error:error instanceof Error?error.message:'AI service unavailable.',requestId},status);
  }
};
if (import.meta.main) Deno.serve(handler);
