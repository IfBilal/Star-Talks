import { removeOwnedAiMedia } from './media-cleanup.ts';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.117.2';
Deno.test('Photo cleanup paginates, includes orphan/nested objects and stays inside owner prefix',async()=>{
 const user='11111111-1111-4111-8111-111111111111';const removed:string[]=[];
 const objects=Array.from({length:205},(_,i)=>({id:String(i+1),name:`photo-${i}.jpg`}));
 const db={storage:{from:(name:string)=>{
  if(name!=='ai-private')throw Error('Wrong bucket');return {
   list:async(folder:string,{offset,limit}:{offset:number;limit:number})=>({error:null,data:folder===user?[...objects,{id:null,name:'nested'}].slice(offset,offset+limit):folder===user+'/nested'?[{id:'nested-file',name:'orphan.jpg'}]:[]}),
   remove:async(paths:string[])=>{if(paths.length>100||paths.some(p=>!p.startsWith(user+'/')))throw Error('Unsafe removal');removed.push(...paths);return {error:null};},
  };
 }}} as unknown as SupabaseClient;
 await removeOwnedAiMedia(db,user);
 if(removed.length!==206||new Set(removed).size!==206||!removed.includes(user+'/nested/orphan.jpg'))throw Error('Incomplete cleanup');
});
