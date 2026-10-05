import { useTheme } from '@/lib/theme-context';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { CalendarDays, Clock3, MapPin, Sun } from 'lucide-react-native';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import tzLookup from 'tz-lookup';
import { PrimaryButton, Screen, TextField, Title } from '@/components/brand';
import { Colors } from '@/constants/theme';
import { ensureChartForProfile } from '@/features/astrology/ensureCurrentChart';
import { resolveLocalBirthTime } from '@/features/birth/timezone';
import { searchBirthplaces, type Place } from '@/features/places/geoapify';
import { preferences } from '@/lib/preferences';
import { requireSupabase } from '@/lib/supabase';

const apiKey=process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY??'';
const dateLabel=(d:Date)=>d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
const localDate=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const timeLabel=(d:Date)=>d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
export default function BirthDetailsScreen(){
  const { Colors: palette, themed, mode } = useTheme();

 const {t}=useTranslation();
 const [date,setDate]=useState(new Date(1995,0,12));const [time,setTime]=useState(new Date(1995,0,12,10,30));const [known,setKnown]=useState(true);const [picker,setPicker]=useState<'date'|'time'|null>(null);const [query,setQuery]=useState('');const [place,setPlace]=useState<Place|null>(null);const [results,setResults]=useState<Place[]>([]);const [searching,setSearching]=useState(false);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const abort=useRef<AbortController|null>(null);
 useEffect(()=>{if(query.trim().length<3||place)return;const timer=setTimeout(async()=>{abort.current?.abort();const controller=new AbortController();abort.current=controller;setSearching(true);try{const items=await searchBirthplaces(query.trim(),apiKey,controller.signal);if(controller.signal.aborted)return;setResults(items);setMessage('')}catch(e){if(!controller.signal.aborted)setMessage(e instanceof Error?e.message:t('birthDetails.searchUnavailable'))}finally{if(!controller.signal.aborted)setSearching(false)}},450);return()=>clearTimeout(timer)},[query,place,t]);
 const onPicker=(event:DateTimePickerEvent,value?:Date)=>{if(Platform.OS==='android')setPicker(null);if(event.type==='set'&&value){if(picker==='date'){setDate(value);const revised=new Date(time);revised.setFullYear(value.getFullYear(),value.getMonth(),value.getDate());setTime(revised)}else if(picker==='time')setTime(value)}};
 const save=async()=>{if(!place){setMessage(t('birthDetails.selectPlaceError'));return}setBusy(true);setMessage('');try{const zone=tzLookup(place.lat,place.lon);let instant:string|null=null;if(known){const resolved=resolveLocalBirthTime({year:date.getFullYear(),month:date.getMonth()+1,day:date.getDate(),hour:time.getHours(),minute:time.getMinutes()},zone);if(resolved.status==='ambiguous'){Alert.alert(t('birthDetails.ambiguousTitle'),t('birthDetails.ambiguousBody'));return}if(resolved.status==='nonexistent'){Alert.alert(t('birthDetails.nonexistentTitle'),t('birthDetails.nonexistentBody'));return}instant=resolved.instant.toISOString()}
   const db=requireSupabase();const user=(await db.auth.getUser()).data.user;if(!user)throw new Error(t('birthDetails.sessionExpired'));const {data:owner}=await db.from('profiles').select('display_name').eq('id',user.id).maybeSingle();const fullName=owner?.display_name?.trim()||'My Birth Profile';const payload={user_id:user.id,display_name:fullName,relationship:'self',birth_date:localDate(date),birth_time:known?`${String(time.getHours()).padStart(2,'0')}:${String(time.getMinutes()).padStart(2,'0')}:00`:null,birth_time_known:known,place_label:place.label,latitude:place.lat,longitude:place.lon,time_zone:zone,birth_instant:instant};
   const {data:existing,error:lookupError}=await db.from('birth_profiles').select('id').eq('user_id',user.id).eq('relationship','self').maybeSingle();if(lookupError)throw lookupError;
   const saveQuery=existing?db.from('birth_profiles').update(payload).eq('id',existing.id):db.from('birth_profiles').insert(payload);
   const {data,error}=await saveQuery.select('id').single();if(error)throw error;
   if(instant){await ensureChartForProfile(db,user.id,data.id)}else{const {error:clearError}=await db.from('calculated_charts').delete().eq('birth_profile_id',data.id);if(clearError)throw clearError}
   await preferences.setOnboardingComplete(true);router.replace('/palm-photo');
  }catch(e){setMessage(e instanceof Error?e.message:t('birthDetails.couldNotSave'))}finally{setBusy(false)}};
 return <Screen scroll style={{paddingTop:30}}><View style={{flex:1}}><Title subtitle={t('birthDetails.subtitle')}>{t('birthDetails.title')}</Title>
  <Pressable onPress={()=>setPicker('date')}><TextField editable={false} label={t('birthDetails.dateLabel')} value={dateLabel(date)} icon={<CalendarDays color={palette.indigo} size={17}/>} placeholder={t('birthDetails.datePlaceholder')}/></Pressable>
  <Pressable onPress={()=>known&&setPicker('time')}><TextField editable={false} label={t('birthDetails.timeLabel')} value={known?timeLabel(time):t('birthDetails.unknown')} icon={<Clock3 color={palette.indigo} size={17}/>} placeholder={t('birthDetails.timePlaceholder')}/></Pressable>
  <TextField label={t('birthDetails.placeLabel')} value={query} onChangeText={value=>{setPlace(null);setQuery(value);setResults([])}} icon={<MapPin color={palette.indigo} size={17}/>} placeholder={t('birthDetails.placePlaceholder')} autoCorrect={false}/>
  {searching?<ActivityIndicator color={palette.indigo} style={{marginVertical:8}}/>:null}
  {results.length>0?<View style={{backgroundColor:themed('white', 'surface'),borderRadius:9,borderWidth:1,borderColor:themed('#E5E3DF', 'border'),marginTop:-10,marginBottom:12,overflow:'hidden'}}>{results.map(item=><Pressable key={item.id} onPress={()=>{setPlace(item);setQuery(item.label);setResults([])}} style={{minHeight:48,flexDirection:'row',alignItems:'center',paddingHorizontal:12,borderBottomWidth:.5,borderBottomColor:themed('#ECEAE7', 'border'),gap:8}}><MapPin color={palette.muted} size={16}/><Text numberOfLines={2} style={{flex:1,fontFamily:'Poppins_400Regular',fontSize:11,color:palette.text}}>{item.label}</Text></Pressable>)}<Text style={{fontFamily:'Poppins_400Regular',fontSize:9,color:palette.muted,padding:6,textAlign:'right'}}>{t('birthDetails.poweredBy')}</Text></View>:null}
  <Pressable onPress={()=>setKnown(!known)} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:14,borderTopWidth:1,borderTopColor:themed('#ECEAE7', 'border'),marginTop:4}}><View style={{flexDirection:'row',alignItems:'center',gap:9}}><Sun color={palette.gold} size={17}/><View><Text style={{fontFamily:'Poppins_500Medium',fontSize:11,color:palette.text}}>{t('birthDetails.notSureTime')}</Text><Text style={{fontFamily:'Poppins_400Regular',fontSize:9,color:palette.muted}}>{t('birthDetails.dontKnowTime')}</Text></View></View><View style={{width:38,height:22,borderRadius:11,backgroundColor:themed(known?'#D7D5DD':Colors.indigo, 'surface'),padding:3,justifyContent:'center',alignItems:known?'flex-start':'flex-end'}}><View style={{width:16,height:16,borderRadius:9,backgroundColor:themed('white', 'surface')}}/></View></Pressable>
  {message?<Text accessibilityRole="alert" style={{color:palette.danger,fontFamily:'Poppins_400Regular',fontSize:10,marginTop:7}}>{message}</Text>:null}
  {picker?<DateTimePicker themeVariant={mode} value={picker==='date'?date:time} mode={picker} display={Platform.OS==='ios'?'spinner':'default'} maximumDate={picker==='date'?new Date():undefined} onChange={onPicker}/>:null}
  <View style={{flex:1,minHeight:20}}/><PrimaryButton title={t('common.continue')} loading={busy} onPress={save}/>
  <Text style={{fontFamily:'Poppins_400Regular',fontSize:8,color:palette.muted,textAlign:'center',marginTop:8}}>{t('birthDetails.footerNote')}</Text>
 </View></Screen>
}
