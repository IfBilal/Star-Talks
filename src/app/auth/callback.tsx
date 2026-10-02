import { useEffect, useState } from 'react';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { preferences } from '@/lib/preferences';
import { requireSupabase } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

async function goToPostAuthScreen(db: SupabaseClient, signInIncompleteMessage: string) {
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new Error(signInIncompleteMessage);
  const { data } = await db.from('birth_profiles').select('id').eq('user_id', user.id).eq('relationship', 'self').maybeSingle();
  if (data) await preferences.setOnboardingComplete(true);
  router.replace(data ? '/home' : '/profile-setup');
}

export default function AuthCallback(){const {t}=useTranslation();const params=useLocalSearchParams<{code?:string;token_hash?:string;type?:string;flow?:string}>();const [error,setError]=useState('');useEffect(()=>{let alive=true;void(async()=>{const db=requireSupabase();try{
  const {data:{session:existingSession}}=await db.auth.getSession();
  if(!existingSession){
    if(typeof params.code==='string'){const {error}=await db.auth.exchangeCodeForSession(params.code);if(error)throw error}
    else if(typeof params.token_hash==='string'&&typeof params.type==='string'){const allowed=['signup','email','magiclink','recovery','invite','email_change'] as const;if(allowed.includes(params.type as typeof allowed[number])){const {error}=await db.auth.verifyOtp({token_hash:params.token_hash,type:params.type as typeof allowed[number]});if(error)throw error}}
  }
  if(params.flow==='recovery'||params.type==='recovery'){const {data:{session},error}=await db.auth.getSession();if(error)throw error;if(!session)throw new Error(t('authCallback.resetLinkInvalid'));if(alive)router.replace('/auth/reset-password' as Href);return}
  if(alive)await goToPostAuthScreen(db,t('authCallback.signInIncomplete'));
}catch(e){
  // The in-app browser OAuth flow in auth.tsx can win a race against this deep-link-triggered
  // handler and consume the one-time PKCE code first, making our exchange fail with a
  // "flow state" error even though sign-in actually succeeded. If a session exists despite the
  // error, the other handler already completed it, so recover instead of showing an error.
  const {data:{session}}=await db.auth.getSession();
  if(session){if(alive)await goToPostAuthScreen(db,t('authCallback.signInIncomplete')).catch(()=>{});return}
  if(alive)setError(e instanceof Error?e.message:t('authCallback.signInFailed'))
}})();return()=>{alive=false}},[params.code,params.flow,params.token_hash,params.type,t]);return <View style={{flex:1,backgroundColor:Colors.ivory,alignItems:'center',justifyContent:'center',padding:28}}>{error?<Text style={{fontFamily:'Poppins_400Regular',fontSize:13,color:Colors.danger,textAlign:'center'}}>{error}</Text>:<><ActivityIndicator color={Colors.indigo}/><Text style={{fontFamily:'Poppins_500Medium',fontSize:13,color:Colors.indigo,marginTop:12}}>{params.flow==='recovery'||params.type==='recovery'?t('authCallback.preparingReset'):t('authCallback.signingIn')}</Text></>}</View>}
