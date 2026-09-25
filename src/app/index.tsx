import { useEffect } from 'react';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { BrandLogo, Screen, Sunrise } from '@/components/brand';
import { preferences } from '@/lib/preferences';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function SplashScreen(){
  useEffect(()=>{const timer=setTimeout(async()=>{const done=await preferences.getOnboardingComplete();const session=await supabase?.auth.getSession();router.replace(done==='true'?(session?.data.session?'/home':'/auth'):'/region')},2400);return()=>clearTimeout(timer)},[]);
  return <Screen dark style={{paddingHorizontal:0,paddingTop:16,justifyContent:'space-between'}}>
    <View style={{alignItems:'center',paddingTop:16}}><View style={{position:'absolute',top:38,width:230,height:230,borderRadius:120,backgroundColor:'#7164D8',opacity:.19}}/><BrandLogo size={142}/><Text style={{fontSize:9,color:'#E5DDF4',letterSpacing:3,marginTop:12,fontFamily:'Poppins_400Regular'}}>YOUR COSMIC GUIDE</Text></View>
    <View><Sunrise height={280}/><View style={{backgroundColor:Colors.midnight,paddingVertical:12,alignItems:'center'}}><Text style={{fontFamily:'Poppins_400Regular',fontSize:9,color:'#E7E2F3',letterSpacing:.7}}>Astrology  ·  Tarot  ·  Numerology</Text><Text style={{fontFamily:'Poppins_400Regular',fontSize:9,color:'#E7E2F3',letterSpacing:.7}}>Vedic  ·  Western  ·  Lal Kitab</Text></View></View>
  </Screen>
}
