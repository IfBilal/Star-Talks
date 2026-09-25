import { useEffect } from 'react';
import { router } from 'expo-router';
import { StatusBar, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle } from 'react-native-svg';
import { Screen, Sunrise } from '@/components/brand';
import { preferences } from '@/lib/preferences';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function SplashScreen(){
  useEffect(()=>{const timer=setTimeout(async()=>{const done=await preferences.getOnboardingComplete();const session=await supabase?.auth.getSession();router.replace(done==='true'?(session?.data.session?'/home':'/auth'):'/region')},2400);return()=>clearTimeout(timer)},[]);
  return <Screen dark style={{paddingHorizontal:0,paddingTop:8,paddingBottom:0,justifyContent:'space-between'}}>
    <StatusBar barStyle="light-content" backgroundColor={Colors.midnight}/>
    <Svg style={{position:'absolute',top:0,left:0,right:0,height:'72%',pointerEvents:'none'}} width="100%" height="100%" viewBox="0 0 400 620" preserveAspectRatio="none">
      {[18,53,88,127,173,220,264,302,348,382,38,104,145,242,286,328,365,67,194,337].map((x,i)=><Circle key={`${x}-${i}`} cx={x} cy={[49,126,28,183,79,35,148,58,109,210,275,322,391,248,347,428,294,506,552,486][i]} r={i%5===0?1.9:1.15} fill="#FFF3CF" opacity={i%3===0?.85:.58}/>) }
    </Svg>
    <View style={{alignItems:'center',paddingTop:8}}>
      <Image source={require('../../assets/images/star-talks-lockup.png')} contentFit="cover" style={{width:'112%',maxWidth:480,height:200}} />
      <Text style={{fontSize:9,color:'#E5DDF4',letterSpacing:3,marginTop:1,fontFamily:'Poppins_400Regular'}}>YOUR COSMIC GUIDE</Text>
    </View>
    <View>
      <Sunrise height={278}/>
      <View style={{backgroundColor:Colors.midnight,paddingTop:9,paddingBottom:10,alignItems:'center'}}>
        <Text style={{fontFamily:'Poppins_400Regular',fontSize:9,color:'#E7E2F3',letterSpacing:.7}}>Astrology  ·  Tarot  ·  Numerology</Text>
        <Text style={{fontFamily:'Poppins_400Regular',fontSize:9,color:'#E7E2F3',letterSpacing:.7,marginTop:1}}>Vedic  ·  Western  ·  Lal Kitab</Text>
      </View>
    </View>
  </Screen>
}
