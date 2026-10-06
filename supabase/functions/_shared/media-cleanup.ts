import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.117.2';

/** Delete the owner's bucket prefix, including uploads whose metadata write failed. */
export async function removeOwnedAiMedia(db: SupabaseClient, userId: string): Promise<void> {
  if(!/^[0-9a-f-]{36}$/i.test(userId))throw new Error('Invalid media owner.');
  const bucket=db.storage.from('ai-private');
  const folders=[userId];
  const paths:string[]=[];
  while(folders.length){
    const folder=folders.pop()!;
    for(let offset=0;;offset+=100){
      const {data,error}=await bucket.list(folder,{limit:100,offset,sortBy:{column:'name',order:'asc'}});
      if(error||!data)throw new Error('Account photos could not be listed. Please retry.');
      for(const item of data){
        if(item.name.includes('/')||item.name==='.'||item.name==='..')throw new Error('Invalid media path.');
        const path=`${folder}/${item.name}`;
        if(item.id)paths.push(path);else folders.push(path);
      }
      if(data.length<100)break;
    }
  }
  for(let offset=0;offset<paths.length;offset+=100){
    const {error}=await bucket.remove(paths.slice(offset,offset+100));
    if(error)throw new Error('Some account photos could not be removed. Please retry.');
  }
}
