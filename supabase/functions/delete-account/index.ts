import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

const cors={
  'access-control-allow-origin':'*',
  'access-control-allow-headers':'authorization,apikey,content-type',
  'access-control-allow-methods':'POST,OPTIONS',
};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'content-type':'application/json'}});

Deno.serve(async(request)=>{
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST')return json({error:'Method not allowed.'},405);
  const url=Deno.env.get('SUPABASE_URL');
  const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!key)return json({error:'Account deletion is unavailable.'},503);
  const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if(!token)return json({error:'Please sign in again.'},401);
  const db=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:{user},error:authError}=await db.auth.getUser(token);
  if(authError||!user)return json({error:'Please sign in again.'},401);
  const body=await request.json().catch(()=>null) as {confirmation?:unknown}|null;
  if(body?.confirmation!=='DELETE ACCOUNT')return json({error:'Confirm permanent account deletion.'},422);
  const {data:media,error:mediaError}=await db.from('ai_media').select('storage_path').eq('user_id',user.id);
  if(mediaError)return json({error:'Account media could not be checked.'},503);
  const paths=(media??[]).map(item=>item.storage_path);
  for(let offset=0;offset<paths.length;offset+=100){
    const {error:storageError}=await db.storage.from('ai-private').remove(paths.slice(offset,offset+100));
    if(storageError)return json({error:'Account photos could not be removed.'},503);
  }
  const {error:deleteError}=await db.auth.admin.deleteUser(user.id);
  if(deleteError)return json({error:'Account could not be deleted. Please try again.'},503);
  return json({deleted:true});
});
