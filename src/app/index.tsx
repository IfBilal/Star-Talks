import { useEffect } from 'react';
import { router } from 'expo-router';
import { StatusBar, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Screen } from '@/components/brand';
import { preferences } from '@/lib/preferences';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function SplashScreen(){
  useEffect(()=>{const timer=setTimeout(async()=>{const done=await preferences.getOnboardingComplete();const session=await supabase?.auth.getSession();router.replace(done==='true'?(session?.data.session?'/home':'/auth'):'/region')},2400);return()=>clearTimeout(timer)},[]);
  return <Screen dark style={{paddingHorizontal:0,paddingTop:0,paddingBottom:0,overflow:'hidden'}}>
    <StatusBar barStyle="light-content" backgroundColor={Colors.midnight}/>
    <View style={{position:'absolute',top:-36,bottom:-36,left:0,right:0,pointerEvents:'none'}}>
      <Image source={require('../../assets/images/star-talks-splash-background.png')} contentFit="cover" style={{width:'100%',height:'100%'}} />
    </View>
    <View style={{flex:1,alignItems:'center',justifyContent:'space-between',paddingTop:'23%',paddingBottom:18}}>
      <View style={{width:'100%',alignItems:'center'}}>
        <Image source={require('../../assets/images/star-talks-lockup.png')} contentFit="cover" style={{width:'84%',maxWidth:340,height:138}} />
      <Text style={{fontSize:9,color:'#E5DDF4',letterSpacing:3,marginTop:1,fontFamily:'Poppins_400Regular'}}>YOUR COSMIC GUIDE</Text>
      </View>
      <View style={{alignItems:'center'}}>
        <Text style={{fontFamily:'Poppins_400Regular',fontSize:9,color:'#E7E2F3',letterSpacing:.7}}>Astrology  ·  Tarot  ·  Numerology</Text>
        <Text style={{fontFamily:'Poppins_400Regular',fontSize:9,color:'#E7E2F3',letterSpacing:.7,marginTop:1}}>Vedic  ·  Western  ·  Lal Kitab</Text>
      </View>
    </View>
  </Screen>
}
