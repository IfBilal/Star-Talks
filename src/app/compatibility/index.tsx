import { useTheme } from '@/lib/theme-context';
import * as ExpoCrypto from 'expo-crypto';
import { router, useFocusEffect } from 'expo-router';
import { Briefcase, Check, Heart, UserRound, Users } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, Avatar, Button, Card, F, Sheet } from '@/components/ui';
import { PalmIcon } from '@/components/ui/icons';
import { aiCall } from '@/features/ai/api';
import { requireSupabase } from '@/lib/supabase';

type Person = { id:string;display_name:string;birth_date:string;birth_time:string|null;place_label:string };
const types = [
  { id:'love',label:'Love',icon:Heart },{ id:'marriage',label:'Marriage',icon:UserRound },
  { id:'friendship',label:'Friendship',icon:Users },{ id:'business',label:'Business',icon:Briefcase },
] as const;
const methods=[['western','Western'],['vedic','Vedic'],['numerology','Numerology'],['chinese-zodiac','BaZi'],['korean-astrology','Saju'],['tarot','Tarot']] as const;

export default function CompatibilityHome() {
  const { Colors: palette, themed } = useTheme();

  const [type,setType]=useState<(typeof types)[number]['id']>('love');
  const [method,setMethod]=useState<(typeof methods)[number][0]>('western');
  const [profiles,setProfiles]=useState<Person[]>([]);
  const [saved,setSaved]=useState<{id:string;relationship_type:string;module_id:string;created_at:string;result:{firstName:string;secondName:string}}[]>([]);
  const [firstId,setFirstId]=useState('');
  const [secondId,setSecondId]=useState('');
  const [choosing,setChoosing]=useState<'first'|'second'|null>(null);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [consentNeeded,setConsentNeeded]=useState(false);
  const requestId=useRef(ExpoCrypto.randomUUID());

  const load=useCallback(async()=>{
    try{
      const db=requireSupabase();const {data:{user},error:authError}=await db.auth.getUser();if(authError)throw authError;if(!user)throw new Error('Please sign in again.');
      const {data,error}=await db.from('birth_profiles').select('id,display_name,birth_date,birth_time,place_label').eq('user_id',user.id).order('created_at');
      if(error)throw error;const people=(data??[]) as Person[];setProfiles(people);
      setFirstId(current=>current||people[0]?.id||'');setSecondId(current=>current||people.find(person=>person.id!==people[0]?.id)?.id||'');
      const history=await aiCall<{analyses:typeof saved;error?:string}>('list-compatibility');setSaved(history.analyses??[]);
    }catch(cause){setMessage(cause instanceof Error?cause.message:'Profiles could not be loaded.');}
  },[]);
  useFocusEffect(useCallback(()=>{void load();},[load]));
  const selected=[profiles.find(person=>person.id===firstId),profiles.find(person=>person.id===secondId)];

  const analyze=async(consentAccepted=false)=>{
    if(!firstId||!secondId||firstId===secondId||busy)return;
    setBusy(true);setMessage('');
    try{
      if(!consentAccepted){const consent=await aiCall<{accepted:{birth_and_questions:boolean};error?:string}>('get-consent');if(!consent.accepted.birth_and_questions){setConsentNeeded(true);return;}}
      const result=await aiCall<{analysis:{id:string};error?:string}>('analyze-compatibility',{firstProfileId:firstId,secondProfileId:secondId,relationshipType:type,method,requestId:requestId.current});
      requestId.current=ExpoCrypto.randomUUID();
      router.push({pathname:'/compatibility/result',params:{id:result.analysis.id}});
    }catch(cause){setMessage(cause instanceof Error?cause.message:'Analysis could not be generated.');}
    finally{setBusy(false);}
  };

  return <AppScreen tab="profile" header={<AppBar brand={false} title="Compatibility Analysis" />} contentStyle={{ paddingTop: 0 }}>
    <Text style={{ fontFamily:F.r,fontSize:11.5,color:palette.navy,marginBottom:12 }}>Discover your relationship dynamics and compatibility.</Text>
    <View style={{ flexDirection:'row' }}>
      {selected.map((person,index)=><Pressable key={index} accessibilityRole="button" onPress={()=>setChoosing(index===0?'first':'second')} style={{ flex:1,height:150,backgroundColor:themed('#FFFDFB', 'surface'),borderWidth:1,borderColor:themed('#F0EAF3', 'border'),borderTopLeftRadius:index===0?16:0,borderBottomLeftRadius:index===0?16:0,borderTopRightRadius:index===1?16:0,borderBottomRightRadius:index===1?16:0,alignItems:'center',paddingTop:14 }}>
        <Avatar name={person?.display_name??'?'} size={54} bg={themed("#E6E0F6", 'surface')} />
        <Text numberOfLines={1} style={{ fontFamily:F.s,fontSize:12.5,color:palette.navy,marginTop:10 }}>{person?.display_name??'Select profile'}</Text>
        <Text style={{ fontFamily:F.r,fontSize:10,color:palette.slate,marginTop:4 }}>{person?.birth_date??''}</Text>
        <Text numberOfLines={1} style={{ fontFamily:F.r,fontSize:10,color:palette.slate,marginTop:2,paddingHorizontal:4 }}>{person?`${person.birth_time?.slice(0,5)??'Unknown time'}  •  ${person.place_label}`:''}</Text>
      </Pressable>)}
      <View style={{ position:'absolute',left:'50%',top:40,marginLeft:-30,width:60,height:60,borderRadius:30,backgroundColor:themed('#F6F1FC', 'surface'),alignItems:'center',justifyContent:'center' }}><Heart size={28} color={themed("#5B54B5", 'foreground')} strokeWidth={1.6} /></View>
    </View>
    <Text style={{ fontFamily:F.s,fontSize:13,color:palette.navy,marginTop:18,marginBottom:10 }}>Select Compatibility Type</Text>
    <View style={{ flexDirection:'row',flexWrap:'wrap',gap:10 }}>{types.map(item=><Pressable key={item.id} accessibilityRole="button" onPress={()=>{setType(item.id);requestId.current=ExpoCrypto.randomUUID();}} style={{ width:'31.4%',height:46,borderRadius:14,backgroundColor:themed(type===item.id?'#EEE9FB':'#FFFDFB', 'surface'),borderWidth:type===item.id?1.6:1,borderColor:themed(type===item.id?'#5B54B5':'#F0EAF3', 'border'),flexDirection:'row',alignItems:'center',paddingHorizontal:8,gap:7 }}><View style={{ width:28,height:28,borderRadius:14,backgroundColor:themed('#EFEAF9', 'surface'),alignItems:'center',justifyContent:'center' }}><item.icon size={16} color={palette.navy} strokeWidth={1.7} /></View><Text style={{ fontFamily:F.m,fontSize:11,color:palette.navy }}>{item.label}</Text></Pressable>)}</View>
    <Text style={{ fontFamily:F.s,fontSize:13,color:palette.navy,marginTop:18,marginBottom:10 }}>Choose a Method</Text>
    <View style={{ flexDirection:'row',flexWrap:'wrap',gap:8 }}>{methods.map(([id,label])=><Pressable key={id} onPress={()=>{setMethod(id);requestId.current=ExpoCrypto.randomUUID();}} style={{ paddingHorizontal:13,paddingVertical:8,borderRadius:13,backgroundColor:themed(method===id?'#EEE9FB':'#FFFDFB', 'surface'),borderWidth:1,borderColor:themed(method===id?'#5B54B5':'#F0EAF3', 'border') }}><Text style={{ fontFamily:F.m,fontSize:10.5,color:palette.navy }}>{label}</Text></Pressable>)}</View>
    {profiles.length<2?<Text style={{ fontFamily:F.r,fontSize:11,color:palette.danger,marginTop:13 }}>Add a second birth profile to compare two people.</Text>:null}
    {message?<Text accessibilityRole="alert" style={{ fontFamily:F.r,fontSize:11,color:palette.danger,marginTop:13 }}>{message}</Text>:null}
    <Button title={busy?'Preparing analysis…':'Get Compatibility Analysis'} disabled={busy||!firstId||!secondId||firstId===secondId} height={50} style={{ borderRadius:14,marginTop:18 }} onPress={()=>void analyze()} />
    <Card style={{ marginTop:16,padding:16,borderRadius:15,flexDirection:'row' }}><View style={{ flex:1 }}><Text style={{ fontFamily:F.s,fontSize:13,color:palette.navy,marginBottom:10 }}>What You&apos;ll Get</Text>{[method==='tarot'?'Three-card relationship spread':'Symbolic alignment score','Strengths & challenges','Relationship dynamics','Timing when calculations support it'].map(label=><View key={label} style={{ flexDirection:'row',alignItems:'center',gap:9,marginTop:8 }}><View style={{ width:16,height:16,borderRadius:8,borderWidth:1.2,borderColor:palette.navy,alignItems:'center',justifyContent:'center' }}><Check size={10} color={palette.navy} strokeWidth={3} /></View><Text style={{ fontFamily:F.r,fontSize:11,color:themed('#3B4373', 'foreground') }}>{label}</Text></View>)}</View><View style={{ width:120,borderRadius:12,backgroundColor:themed('#F4EFFA', 'surface'),alignItems:'center',justifyContent:'center',flexDirection:'row' }}><View style={{ transform:[{rotate:'-14deg'}] }}><PalmIcon size={44} color={themed("#8A84D6", 'foreground')} strokeWidth={1.2} /></View><View style={{ transform:[{rotate:'14deg'}] }}><PalmIcon size={44} color={themed("#E58A8A", 'foreground')} strokeWidth={1.2} /></View></View></Card>
    {saved.length?<View style={{marginTop:22}}><Text style={{fontFamily:F.s,fontSize:14,color:palette.navy,marginBottom:9}}>Saved analyses</Text>{saved.slice(0,8).map(item=><Card key={item.id} onPress={()=>router.push({pathname:'/compatibility/result',params:{id:item.id}})} style={{padding:12,marginBottom:7,borderRadius:12}}><Text style={{fontFamily:F.m,fontSize:12,color:palette.navy}}>{item.result.firstName} &amp; {item.result.secondName}</Text><Text style={{fontFamily:F.r,fontSize:10,color:palette.slate,marginTop:3}}>{item.relationship_type} • {new Date(item.created_at).toLocaleDateString()}</Text></Card>)}</View>:null}
    <Sheet visible={choosing!==null} onClose={()=>setChoosing(null)} title={choosing==='first'?'First profile':'Second profile'} items={profiles.map(person=>({label:person.display_name,onPress:()=>{if(choosing==='first')setFirstId(person.id);else setSecondId(person.id);requestId.current=ExpoCrypto.randomUUID();}}))} />
    <Sheet visible={consentNeeded} onClose={()=>setConsentNeeded(false)} title="Before compatibility analysis">
      <Text style={{fontFamily:F.r,fontSize:11.5,lineHeight:18,color:palette.navy,marginBottom:14}}>Star Talks sends the two selected birth profiles and your chosen relationship type to its AI provider to explain the calculated compatibility factors. The analysis is saved privately in your account.</Text>
      <Button title={busy?'Saving…':'I agree and continue'} disabled={busy} onPress={()=>void (async()=>{setBusy(true);try{await aiCall('accept-consent',{consentScope:'birth_and_questions'});setConsentNeeded(false);setBusy(false);await analyze(true);}catch(cause){setBusy(false);setMessage(cause instanceof Error?cause.message:'Consent could not be saved.');}})()} />
    </Sheet>
  </AppScreen>;
}
