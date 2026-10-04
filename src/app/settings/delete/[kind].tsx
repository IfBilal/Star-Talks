import { router, useLocalSearchParams } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Button, F, back } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { aiCall } from '@/features/ai/api';
import { requireSupabase } from '@/lib/supabase';

const copy: Record<string, { title: string; head: string; body: string; action: string; danger?: boolean }> = {
  conversations: { title: 'Delete AI Conversations', head: 'Clear your AI chat history?', body: 'All AI conversations, feedback and uploaded reading photos will be permanently removed.', action: 'Delete All Conversations' },
  profiles: { title: 'Delete Saved Profiles', head: 'Remove saved profiles?', body: 'Family, partner and friend birth profiles and their compatibility analyses will be removed. Your own birth profile and saved AI conversations stay.', action: 'Delete Saved Profiles' },
  account: { title: 'Delete Account', head: 'Permanently delete your account?', body: 'Your Star Talks account, birth profiles, AI conversations and reading photos will be permanently deleted.', action: 'Delete My Account', danger: true },
  request: { title: 'Data Deletion Request', head: 'Request removal of your data', body: 'We will review your request and confirm by email within 30 days. You can keep using the app while your request is processed.', action: 'Submit Request' },
};

export default function DeleteConfirm() {
  const { kind } = useLocalSearchParams<{ kind: string }>();
  const c = copy[kind] ?? copy.conversations;
  const [done, setDone] = useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const remove=async()=>{
    setBusy(true);setError('');
    try{
      if(kind==='conversations')await aiCall('delete-all-ai-history',{confirmation:'DELETE'});
      else if(kind==='profiles'){
        const db=requireSupabase();const {data:{user},error:authError}=await db.auth.getUser();if(authError)throw authError;if(!user)throw new Error('Please sign in again.');
        const {error:deleteError}=await db.from('birth_profiles').delete().eq('user_id',user.id).neq('relationship','self');if(deleteError)throw deleteError;
      }else if(kind==='account'){
        const db=requireSupabase();const {data,error:deleteError}=await db.functions.invoke('delete-account',{body:{confirmation:'DELETE ACCOUNT'}});
        if(deleteError){const context=(deleteError as {context?:Response}).context;let detail='Account could not be deleted.';try{const result=await context?.json() as {error?:string}|undefined;detail=result?.error??detail;}catch{}throw new Error(detail);}
        if(!data?.deleted)throw new Error('Account deletion was not confirmed.');
        await db.auth.signOut({scope:'local'}).catch(()=>{});router.dismissAll();router.replace('/auth');return;
      }else throw new Error('This request action is not available yet.');
      setDone(true);
    }
    catch(cause){setError(cause instanceof Error?cause.message:'Could not delete AI history.');}
    finally{setBusy(false);}
  };
  return (
    <AppScreen header={<AppBar title={c.title} />} contentStyle={{ paddingTop: 20 }}>
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: c.danger ? '#FBE4E6' : '#ECE6F8', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={36} color={c.danger ? '#B4424D' : Colors.navy} strokeWidth={1.5} /></View>
        <Text style={{ marginTop: 18, fontFamily: F.s, fontSize: 16, color: Colors.navy, textAlign: 'center' }}>{done ? 'Done' : c.head}</Text>
        <Text style={{ marginTop: 8, fontFamily: F.r, fontSize: 12, lineHeight: 19, color: Colors.slate, textAlign: 'center' }}>{done ? kind==='conversations'?'Your AI history was deleted.':'Your saved profiles were deleted.' : c.body}</Text>
      </View>
      {error?<Text accessibilityRole="alert" style={{fontFamily:F.r,fontSize:11,color:Colors.danger,marginTop:12,textAlign:'center'}}>{error}</Text>:null}
      <Button title={done ? 'Back' : busy?'Deleting…':c.action} disabled={busy} variant={done ? 'primary' : 'danger'} height={50} style={{ borderRadius: 14, marginTop: 30 }} onPress={() => (done ? back() : void remove())} />
      {!done ? <Button title="Cancel" variant="light" height={48} style={{ borderRadius: 14, marginTop: 10 }} onPress={back} /> : null}
    </AppScreen>
  );
}
