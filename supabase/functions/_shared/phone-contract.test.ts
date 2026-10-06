import { codeHash, sendViaMsg91 } from '../verify-whatsapp-phone/index.ts';
Deno.test('WhatsApp OTP HMAC binds account, phone and code; transport handles failures',async()=>{
 const original=globalThis.fetch;
 const keys=['PHONE_OTP_PEPPER','MSG91_AUTH_KEY','MSG91_WHATSAPP_SENDER','MSG91_WHATSAPP_TEMPLATE','MSG91_WHATSAPP_NAMESPACE'];
 const previous=keys.map(key=>Deno.env.get(key));
 keys.forEach(key=>Deno.env.set(key,key==='PHONE_OTP_PEPPER'?'test-only-pepper-with-at-least-32-characters':'test-fixture'));
 try{
  const hash=await codeHash('user-a','+15555550111','123456');
  if(!/^[0-9a-f]{64}$/.test(hash))throw new Error('Hash format');
  for(const args of [['user-b','+15555550111','123456'],['user-a','+15555550222','123456'],['user-a','+15555550111','123455']]){
   if(await codeHash(args[0],args[1],args[2])===hash)throw new Error('HMAC binding failed');
  }
  let sent:any;
  globalThis.fetch=async(url,init)=>{if(String(url)!=='https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/')throw new Error('Wrong endpoint');sent=JSON.parse(String(init?.body));return new Response('{"status":"success"}');};
  await sendViaMsg91('+15555550111','123456');
  const item=sent.payload.template.to_and_components[0];
  if(item.to[0]!=='15555550111'||item.components.body_1.value!=='123456'||item.components.button_1.value!=='123456')throw new Error('Template variables');
  for(const response of [new Response('{"status":"error"}'),new Response('failed'),new Response('{}',{status:500})]){
   globalThis.fetch=async()=>response;let rejected=false;try{await sendViaMsg91('+15555550111','123456');}catch{rejected=true;}if(!rejected)throw new Error('Failed delivery accepted');
  }
 }finally{globalThis.fetch=original;keys.forEach((key,i)=>previous[i]===undefined?Deno.env.delete(key):Deno.env.set(key,previous[i]!));}
});
