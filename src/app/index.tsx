import { useTheme } from '@/lib/theme-context';
import { useEffect } from 'react';
import { router, type Href } from 'expo-router';
import { StatusBar, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/brand';
import { preferences } from '@/lib/preferences';
import { supabase } from '@/lib/supabase';
import { hasVerifiedPhone } from '@/features/auth/phone-verification';

export default function SplashScreen(){
  const { Colors: palette, themed } = useTheme();

  const {t}=useTranslation();
  useEffect(()=>{const timer=setTimeout(async()=>{
    const session=(await supabase?.auth.getSession())?.data.session;
    if(session&&supabase){
      const { data: { user } } = await supabase.auth.getUser();
      if (!hasVerifiedPhone(user)) { router.replace('/auth/verify-phone' as Href); return; }
      // A signed-in account already knows its own onboarding state, so skip region/language.
      const {data}=await supabase.from('birth_profiles').select('id').eq('user_id',session.user.id).eq('relationship','self').maybeSingle();
      if(data){await preferences.setOnboardingComplete(true);router.replace('/home');return}
      if(await preferences.getOnboardingComplete()==='true'){router.replace('/ai');return}
      router.replace('/profile-setup');return
    }
    const [done,region,language]=await Promise.all([preferences.getOnboardingComplete(),preferences.getRegion(),preferences.getLanguage()]);
    // Country is asked once: as soon as it has been picked, later launches skip it.
    router.replace(done==='true'||(region&&language)?'/auth':region?'/language':'/region')
  },2400);return()=>clearTimeout(timer)},[]);
  return <Screen dark style={{paddingHorizontal:0,paddingTop:0,paddingBottom:0,overflow:'hidden'}}>
    <StatusBar barStyle="light-content" backgroundColor={palette.midnight}/>
    <View style={{position:'absolute',top:-36,bottom:-36,left:0,right:0,pointerEvents:'none'}}>
      <Image source={require('../../assets/images/star-talks-splash-background.png')} contentFit="cover" style={{width:'100%',height:'100%'}} />
    </View>
    <View style={{flex:1,alignItems:'center',justifyContent:'space-between',paddingTop:'23%',paddingBottom:18}}>
      <View style={{width:'100%',alignItems:'center'}}>
        <Image source={require('../../assets/images/star-talks-lockup.png')} contentFit="cover" style={{width:'84%',maxWidth:340,height:138}} />
      <Text style={{fontSize:9,color:themed('#E5DDF4', 'foreground'),letterSpacing:3,marginTop:1,fontFamily:'Poppins_400Regular'}}>{t('splash.tagline')}</Text>
      </View>
      <View style={{alignItems:'center'}}>
        <Text style={{fontFamily:'Poppins_400Regular',fontSize:9,color:themed('#E7E2F3', 'foreground'),letterSpacing:.7}}>{t('splash.disciplines1')}</Text>
        <Text style={{fontFamily:'Poppins_400Regular',fontSize:9,color:themed('#E7E2F3', 'foreground'),letterSpacing:.7,marginTop:1}}>{t('splash.disciplines2')}</Text>
      </View>
    </View>
  </Screen>
}
