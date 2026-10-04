import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.117.2';
import { buildChartEvidence } from '../_shared/chart-evidence.ts';
import { calculateFourPillars } from '../_shared/four-pillars.ts';
import { MODULES, MODULE_POLICY_VERSION, explicitlyRequestedOtherModule, isModuleId, type ModuleId } from '../_shared/modules.ts';
import { calculateNumerology, NUMBER_MEANINGS } from '../_shared/numerology.ts';
import { AI_MODEL, generateAnswer, moderate, observeImage } from '../_shared/openai.ts';
import { drawTarot, TAROT_LIBRARY_VERSION, type SpreadId } from '../_shared/tarot.ts';

const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization,apikey,content-type', 'access-control-allow-methods': 'POST,OPTIONS' };
const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'content-type': 'application/json' } });
const uuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
const must = <T>(value: T | null | undefined, message: string, status = 422): T => { if (value == null) throw new HttpError(status, message); return value; };

type Body = { action?: string; moduleId?: unknown; profileId?: unknown; mediaId?: unknown; spread?: unknown;
  conversationId?: unknown; question?: unknown; requestId?: unknown; title?: unknown; moduleFilter?: unknown;
  messageId?: unknown; helpful?: unknown; reasons?: unknown; reportNote?: unknown };
type Profile = { id:string; birth_date:string; birth_time:string|null; birth_instant:string|null; birth_time_known:boolean;
  latitude:number;longitude:number;time_zone:string;numerology_name:string|null;display_name:string };
type Snapshot = { moduleId: ModuleId; version: string; factors: Array<{id:string;label?:string;value?:unknown;rule?:string}>;
  warnings: string[]; tarotCards?: ReturnType<typeof drawTarot>; mediaId?: string; data?: unknown };

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
  if(!user.phone||!user.phone_confirmed_at)throw new HttpError(403,'Verify your WhatsApp phone number to continue.');
  return user;
}

async function selectedProfile(db: SupabaseClient, userId: string, profileId: unknown): Promise<Profile> {
  let query=db.from('birth_profiles').select('id,birth_date,birth_time,birth_instant,birth_time_known,latitude,longitude,time_zone,numerology_name,display_name').eq('user_id',userId);
  query=uuid(profileId)?query.eq('id',profileId):query.eq('relationship','self');
  const {data,error}=await query.maybeSingle();
  if(error)throw new HttpError(503,'Birth profile could not be loaded.');
  return must(data as Profile|null,'Add a birth profile before starting this module.');
}

async function claim(db: SupabaseClient, userId: string, requestId: string) {
  const limit=Number(Deno.env.get('AI_PREVIEW_DAILY_LIMIT')||30);
  const {data,error}=await db.rpc('claim_ai_preview_request',{p_user_id:userId,p_request_id:requestId,p_daily_limit:limit});
  if(error)throw new HttpError(503,'Unable to check the AI preview limit.');
  if(!data)throw new HttpError(429,'Today’s AI preview limit has been reached. Please try again later.');
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
    return {profileId:profile.id,snapshot:{moduleId,version:result.version,factors:result.evidence.map(item=>({id:item.id,label:item.label,value:item.value,rule:`${item.meaning} Interpretation: ${NUMBER_MEANINGS[item.value]??'a personal theme'}.`})),warnings:result.warnings,data:{normalizedName:result.normalizedName}}};
  }
  if(moduleId==='chinese-zodiac'||moduleId==='korean-astrology') {
    const result=calculateFourPillars({birthDate:profile.birth_date,birthTime:profile.birth_time,birthInstant:profile.birth_instant,timeZone:profile.time_zone});
    const factors=result.pillars.map(pillar=>({id:pillar.id,label:`${pillar.id.slice(7)} pillar`,value:moduleId==='korean-astrology'?pillar.korean:pillar.chinese,rule:`${pillar.yinYang} ${pillar.stemElement} stem over ${pillar.branchElement} ${pillar.animal} branch.`}));
    factors.push({id:'pillar:day-master',label:moduleId==='korean-astrology'?'Ilgan':'Day Master',value:moduleId==='korean-astrology'?result.ilgan:result.dayMaster,rule:'Day stem at the centre of the Four Pillars interpretation.'});
    factors.push({id:'pillar:element-balance',label:'Five-element balance',value:JSON.stringify(result.elementBalance),rule:'Count of the eight stem/branch characters, excluding an unknown hour.'});
    return {profileId:profile.id,snapshot:{moduleId,version:result.version,factors,warnings:result.warnings,data:{animals:result.animals,boundary:result.boundary}}};
  }
  if(moduleId==='vedic'||moduleId==='western'||moduleId==='lal-kitab') {
    const result=buildChartEvidence(profile,moduleId);
    return {profileId:profile.id,snapshot:{moduleId,version:result.version,factors:result.factors,warnings:result.warnings,data:{asOf:result.asOf,exactBirthTime:result.exactBirthTime}}};
  }
  throw new HttpError(400,'Unknown AI module.');
}

async function languageFor(db:SupabaseClient,userId:string) {
  const {data}=await db.from('profiles').select('language_code').eq('id',userId).maybeSingle();
  const names:Record<string,string>={en:'English',hi:'Hindi',ur:'Urdu',es:'Spanish',fr:'French',ar:'Arabic'};
  return names[data?.language_code]??'English';
}

async function storedMessages(db:SupabaseClient,conversationId:string) {
  const {data,error}=await db.from('ai_messages').select('id,role,kind,body,structured_payload,source_refs,created_at,request_id').eq('conversation_id',conversationId).order('created_at',{ascending:true}).order('id',{ascending:true});
  if(error)throw new HttpError(503,'Conversation could not be loaded.');
  return data??[];
}

async function commitMessages(db:SupabaseClient,rows:Array<Record<string,unknown>>) {
  const {data,error}=await db.from('ai_messages').insert(rows).select('id,role,kind,body,structured_payload,source_refs,created_at,request_id');
  if(error)throw new HttpError(503,'Answer could not be saved. Please retry.');
  return data;
}

async function generated(db:SupabaseClient,conversation:{id:string;user_id:string;module_id:ModuleId;input_snapshot:Snapshot;summary:string},question:string,requestId:string,first:boolean) {
  const snapshot=conversation.input_snapshot;
  const refs=snapshot.factors.map(factor=>factor.id);
  const messages=first?[]:await storedMessages(db,conversation.id);
  const {answer,model}=await generateAnswer({moduleId:conversation.module_id,evidence:snapshot,allowedSourceRefs:refs,question,
    history:messages.slice(-10).map(item=>({role:item.role,body:item.body})),summary:conversation.summary||'',language:await languageFor(db,conversation.user_id),first});
  const postModeration=await moderate(answer.directAnswer);
  if(postModeration.flagged)throw new HttpError(422,'The generated answer could not be shown safely. Please ask in another way.');
  const body=answer.directAnswer;
  const rows=first?[{conversation_id:conversation.id,user_id:conversation.user_id,role:'assistant',kind:'first',body,structured_payload:answer,source_refs:answer.sourceRefs,request_id:requestId,provider_model:model}]
    :[{conversation_id:conversation.id,user_id:conversation.user_id,role:'user',kind:'question',body:question,request_id:requestId},
      {conversation_id:conversation.id,user_id:conversation.user_id,role:'assistant',kind:'answer',body,structured_payload:answer,source_refs:answer.sourceRefs,request_id:requestId,provider_model:model}];
  const saved=await commitMessages(db,rows);
  await db.from('ai_conversations').update({first_reading_status:'ready',updated_at:new Date().toISOString()}).eq('id',conversation.id);
  return saved;
}

async function handleAction(db:SupabaseClient,userId:string,body:Body) {
  if(body.action==='list-modules') return {modules:Object.entries(MODULES).map(([id,config])=>({id,name:config.name,input:config.input,available:true})),version:MODULE_POLICY_VERSION};
  if(body.action==='list-conversations') {
    let query=db.from('ai_conversations').select('id,module_id,title,first_reading_status,created_at,updated_at,birth_profile_id').eq('user_id',userId).order('updated_at',{ascending:false}).limit(50);
    if(isModuleId(body.moduleFilter))query=query.eq('module_id',body.moduleFilter);
    const {data,error}=await query;if(error)throw new HttpError(503,'Reading history is unavailable.');
    return {conversations:data??[]};
  }
  if(body.action==='start-reading') {
    const moduleId=must(isModuleId(body.moduleId)?body.moduleId:null,'Select a valid AI module.');
    const requestId=must(uuid(body.requestId)?body.requestId:null,'A valid request ID is required.');
    const {data:existing}=await db.from('ai_conversations').select('*').eq('user_id',userId).eq('start_request_id',requestId).maybeSingle();
    if(existing) {
      const messages=await storedMessages(db,existing.id);
      if(messages.length)return {conversation:existing,messages};
      if(existing.first_reading_status==='pending')throw new HttpError(409,'This reading is still being prepared. Please wait and retry.');
      await claim(db,userId,requestId);
      const regenerated=await generated(db,existing,`Give my ${moduleId==='tarot'?'Current Energy':'First Instinct'} reading using the supplied evidence.`,requestId,true);
      return {conversation:{...existing,first_reading_status:'ready'},messages:regenerated};
    }
    const {snapshot,profileId}=await evidenceFor(db,userId,moduleId,body);
    if(!snapshot.factors.length)throw new HttpError(422,'More input is needed for this reading.');
    await claim(db,userId,requestId);
    const {data:conversation,error}=await db.from('ai_conversations').insert({user_id:userId,module_id:moduleId,birth_profile_id:profileId,title:`${MODULES[moduleId].name} reading`,methodology_version:snapshot.version,prompt_version:MODULE_POLICY_VERSION,calculator_version:snapshot.version,input_fingerprint:JSON.stringify(snapshot.factors.map(f=>[f.id,f.value])),input_snapshot:snapshot,start_request_id:requestId}).select('*').single();
    if(error||!conversation)throw new HttpError(503,'Reading could not be started.');
    try { const messages=await generated(db,conversation,`Give my ${moduleId==='tarot'?'Current Energy':'First Instinct'} reading using the supplied evidence.`,requestId,true);return {conversation:{...conversation,first_reading_status:'ready'},messages}; }
    catch(error){await db.from('ai_conversations').update({first_reading_status:'failed'}).eq('id',conversation.id);throw error;}
  }
  const conversationId=must(uuid(body.conversationId)?body.conversationId:null,'A valid conversation ID is required.');
  const {data:conversation,error:conversationError}=await db.from('ai_conversations').select('*').eq('id',conversationId).eq('user_id',userId).maybeSingle();
  if(conversationError||!conversation)throw new HttpError(404,'Conversation was not found.');
  if(body.action==='get-conversation') {
    const messages=await storedMessages(db,conversationId);
    if(!messages.length && conversation.first_reading_status==='failed' && conversation.start_request_id) {
      const regenerated=await generated(db,conversation,`Give my ${conversation.module_id==='tarot'?'Current Energy':'First Instinct'} reading using the supplied evidence.`,conversation.start_request_id,true);
      return {conversation:{...conversation,first_reading_status:'ready'},messages:regenerated};
    }
    return {conversation,messages};
  }
  if(body.action==='rename-conversation') {
    const title=typeof body.title==='string'?body.title.trim():'';
    if(title.length<1||title.length>120)throw new HttpError(422,'Enter a title of 1–120 characters.');
    const {error}=await db.from('ai_conversations').update({title,updated_at:new Date().toISOString()}).eq('id',conversationId).eq('user_id',userId);
    if(error)throw new HttpError(503,'Conversation could not be renamed.');return {title};
  }
  if(body.action==='delete-conversation') {
    const {error}=await db.from('ai_conversations').delete().eq('id',conversationId).eq('user_id',userId);
    if(error)throw new HttpError(503,'Conversation could not be deleted.');return {deleted:true};
  }
  if(body.action==='ask-module') {
    const requestId=must(uuid(body.requestId)?body.requestId:null,'A valid request ID is required.');
    const question=typeof body.question==='string'?body.question.trim():'';
    if(question.length<2||question.length>800)throw new HttpError(422,'Ask a question of 2–800 characters.');
    const {data:repeated}=await db.from('ai_messages').select('id').eq('user_id',userId).eq('request_id',requestId).eq('role','assistant').maybeSingle();
    if(repeated)return {conversation,messages:await storedMessages(db,conversationId)};
    const active=conversation.module_id as ModuleId;
    const other=explicitlyRequestedOtherModule(question,active);
    if(other) {
      const rows=await commitMessages(db,[
        {conversation_id:conversationId,user_id:userId,role:'user',kind:'question',body:question,request_id:requestId},
        {conversation_id:conversationId,user_id:userId,role:'assistant',kind:'redirect',body:`That question belongs in ${MODULES[other].name}. Switch modules to ask it there.`,structured_payload:{recommendedModuleId:other},request_id:requestId},
      ]);
      return {conversation,messages:rows};
    }
    const moderation=await moderate(question);
    if(moderation.flagged)throw new HttpError(422,'I cannot answer that question as a reading. If someone is in immediate danger, please contact local emergency help.');
    await claim(db,userId,requestId);
    const rows=await generated(db,conversation,question,requestId,false);
    return {conversation,messages:rows};
  }
  if(body.action==='submit-ai-feedback') {
    const messageId=must(uuid(body.messageId)?body.messageId:null,'Select a response.');
    const {data:message}=await db.from('ai_messages').select('id,role').eq('id',messageId).eq('conversation_id',conversationId).eq('user_id',userId).maybeSingle();
    if(!message||message.role!=='assistant')throw new HttpError(404,'Response was not found.');
    const reasons=Array.isArray(body.reasons)?body.reasons.filter(x=>typeof x==='string'&&x.length<80).slice(0,5):[];
    const reportNote=typeof body.reportNote==='string'?body.reportNote.slice(0,1000):null;
    const {error}=await db.from('ai_feedback').upsert({message_id:messageId,user_id:userId,helpful:typeof body.helpful==='boolean'?body.helpful:null,reasons,report_note:reportNote,reported_at:reportNote?new Date().toISOString():null,updated_at:new Date().toISOString()});
    if(error)throw new HttpError(503,'Feedback could not be saved.');return {saved:true};
  }
  throw new HttpError(400,'Unknown AI action.');
}

Deno.serve(async(request)=>{
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST')return respond({error:'Method not allowed'},405);
  const requestId=crypto.randomUUID();
  try {
    const db=adminClient();
    const user=await authenticatedUser(request,db);
    const body=await request.json() as Body;
    return respond(await handleAction(db,user.id,body));
  } catch(error) {
    const status=error instanceof HttpError?error.status:503;
    // Log a request ID and error category, never raw prompts, photos, credentials or birth data.
    console.error(JSON.stringify({requestId,status,category:error instanceof HttpError?'request':'server'}));
    return respond({error:error instanceof Error?error.message:'AI service unavailable.',requestId},status);
  }
});
