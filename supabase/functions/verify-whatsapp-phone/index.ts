import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

const cors={'access-control-allow-origin':'*','access-control-allow-headers':'authorization,apikey,content-type','access-control-allow-methods':'POST,OPTIONS'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'content-type':'application/json'}});
const validPhone=(value:unknown):value is string=>typeof value==='string'&&/^\+[1-9]\d{7,14}$/.test(value);
const codeValue=()=>{
  const random=new Uint32Array(1);const limit=Math.floor(0x100000000/1000000)*1000000;
  do{crypto.getRandomValues(random);}while(random[0]>=limit);
  return String(random[0]%1000000).padStart(6,'0');
};
export async function codeHash(userId:string,phone:string,code:string) {
  const pepper=Deno.env.get('PHONE_OTP_PEPPER');
  if(!pepper||pepper.length<32)throw new Error('Phone verification is not configured.');
  const encoder=new TextEncoder();
  const key=await crypto.subtle.importKey('raw',encoder.encode(pepper),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const result=new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(`${userId}:${phone}:${code}`)));
  return Array.from(result,byte=>byte.toString(16).padStart(2,'0')).join('');
}
export async function sendViaMsg91(phone:string,code:string) {
  const authKey=Deno.env.get('MSG91_AUTH_KEY');
  const sender=Deno.env.get('MSG91_WHATSAPP_SENDER');
  const template=Deno.env.get('MSG91_WHATSAPP_TEMPLATE');
  const namespace=Deno.env.get('MSG91_WHATSAPP_NAMESPACE');
  const language=Deno.env.get('MSG91_WHATSAPP_LANGUAGE')||'en';
  if(!authKey||!sender||!template||!namespace)throw new Error('WhatsApp delivery is not configured.');
  const response=await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',{
    method:'POST',headers:{authkey:authKey,'content-type':'application/json'},signal:AbortSignal.timeout(8000),
    body:JSON.stringify({integrated_number:sender,content_type:'template',payload:{messaging_product:'whatsapp',type:'template',template:{name:template,language:{code:language,policy:'deterministic'},namespace,to_and_components:[{to:[phone.slice(1)],components:{body_1:{type:'text',value:code},button_1:{subtype:'url',type:'text',value:code}}}]}}}),
  });
  // MSG91 errors may echo request data. Inspect but never log its body.
  const body=(await response.text()).slice(0,4096);
  let rejected=!response.ok||/^\s*(error|failed|false)\b/i.test(body);
  try{const result=JSON.parse(body) as {success?:boolean;status?:string;type?:string;error?:unknown;errors?:unknown};rejected ||=result.success===false||/^(error|failed|failure)$/i.test(result.status??'')||/^(error|failed|failure)$/i.test(result.type??'')||Boolean(result.error||result.errors);}catch{}
  if(rejected)throw new Error('WhatsApp delivery could not be started.');
}

export const handler = async(request: Request)=>{
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST')return json({error:'Method not allowed.'},405);
  const url=Deno.env.get('SUPABASE_URL');const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!key)return json({error:'Phone verification is unavailable.'},503);
  const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if(!token)return json({error:'Please sign in again.'},401);
  const db=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:{user},error:authError}=await db.auth.getUser(token);
  if(authError||!user)return json({error:'Please sign in again.'},401);
  const body=await request.json().catch(()=>null) as {action?:unknown;phone?:unknown;code?:unknown}|null;
  try{
    if(body?.action==='send'){
      if(user.phone&&user.phone_confirmed_at)return json({error:'A phone number is already verified for this account.'},409);
      if(!validPhone(body.phone))return json({error:'Enter a phone number with its country code.'},422);
      const code=codeValue();const hash=await codeHash(user.id,body.phone,code);
      const {data:reservation,error:reserveError}=await db.rpc('reserve_phone_otp',{p_user_id:user.id,p_phone:body.phone,p_hash:hash});
      if(reserveError)return json({error:'Could not reserve a verification code.'},503);
      if(reservation==='cooldown')return json({error:'Please wait one minute before requesting another code.'},429);
      if(reservation==='user_limit'||reservation==='phone_limit')return json({error:'Too many codes were requested today. Please try again later.'},429);
      if(reservation!=='reserved')return json({error:'Phone verification is unavailable.'},503);
      try{await sendViaMsg91(body.phone,code);}catch{await db.from('phone_otp_challenges').delete().eq('user_id',user.id).eq('code_hash',hash);return json({error:'WhatsApp delivery could not be started.'},502);}
      return json({sent:true,maskedPhone:body.phone.replace(/(\d{2})\d{4}(\d{2})$/,'$1••••$2')});
    }
    if(body?.action==='verify'){
      if(typeof body.code!=='string'||!/^\d{6}$/.test(body.code))return json({error:'Enter the six-digit code from WhatsApp.'},422);
      const {data:challenge,error:challengeError}=await db.from('phone_otp_challenges').select('phone').eq('user_id',user.id).maybeSingle();
      if(challengeError)return json({error:'Code could not be checked.'},503);
      if(!challenge)return json({error:'Request a new WhatsApp code.'},422);
      const hash=await codeHash(user.id,challenge.phone,body.code);
      const {data:result,error:verifyError}=await db.rpc('consume_phone_otp',{p_user_id:user.id,p_hash:hash});
      if(verifyError)return json({error:'Code could not be verified.'},503);
      if(result?.status==='invalid')return json({error:'The code is incorrect. Please try again.'},422);
      if(result?.status==='expired'||result?.status==='missing')return json({error:'This code expired. Request a new one.'},422);
      if(result?.status==='blocked')return json({error:'Too many incorrect attempts. Request a new code.'},429);
      if(result?.status!=='verified'||!validPhone(result.phone))return json({error:'Code could not be verified.'},503);
      const {data:updated,error:updateError}=await db.auth.admin.updateUserById(user.id,{phone:result.phone,phone_confirm:true});
      if(updateError||!updated.user||updated.user.id!==user.id||updated.user.phone?.replace(/^\+/,'')!==result.phone.replace(/^\+/,'')||!updated.user.phone_confirmed_at)
        return json({error:'This number could not be linked to your account. It may already be in use. Request a new code or use another number.'},409);
      return json({verified:true,userId:user.id});
    }
    return json({error:'Unknown verification action.'},400);
  }catch{
    return json({error:'Phone verification is temporarily unavailable.'},503);
  }
};
if(import.meta.main)Deno.serve(handler);
