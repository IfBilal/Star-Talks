import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { PrimaryButton, Screen, SelectRow, Title } from '@/components/brand';
import { preferences } from '@/lib/preferences';
import { Colors } from '@/constants/theme';
import * as Localization from 'expo-localization';

const langs=[['🇬🇧','English'],['🇮🇳','हिन्दी'],['🇵🇰','اردو'],['🇪🇸','Español'],['🇫🇷','Français'],['🇸🇦','العربية']];
export default function LanguageScreen(){const languageCode=Localization.getLocales()[0]?.languageCode;const suggestion:Record<string,string>={en:'English',hi:'हिन्दी',ur:'اردو',es:'Español',fr:'Français',ar:'العربية'};const [language,setLanguage]=useState(suggestion[languageCode??'']??'English');const next=async()=>{await preferences.setLanguage(language);router.push('/auth')};return <Screen style={{paddingTop:30}}><View style={{flex:1}}><Title subtitle="You can change this later in settings.">Choose Your Language</Title><View>{langs.map(([flag,label])=><SelectRow key={label} flag={flag} selected={language===label} onPress={()=>setLanguage(label)}>{label}</SelectRow>)}</View><View style={{flex:1}}/><PrimaryButton title="Continue" onPress={next}/><Pressable onPress={()=>router.push('/auth')} style={{alignItems:'center',padding:12}}><Text style={{color:Colors.muted,fontSize:11,fontFamily:'Poppins_400Regular'}}>Skip for now</Text></Pressable></View></Screen>}
