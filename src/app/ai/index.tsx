import { useTheme } from '@/lib/theme-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronRight, EllipsisVertical, Menu, Sparkles } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StatusBar, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppScreen, go, Sheet } from '@/components/ui';
import { GoldStar } from '@/components/ui/icons';
import { MODULES } from '@/features/uiData/ai';
import { requireSupabase } from '@/lib/supabase';
import { aiCall } from '@/features/ai/api';

export default function AiHome() {
  const { Colors: palette, themed } = useTheme();

  const { profileId } = useLocalSearchParams<{ profileId?: string }>();
  const [menu, setMenu] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [availability,setAvailability]=useState<Record<string,boolean>|null>(null);
  const [serviceMessage,setServiceMessage]=useState('');
  useEffect(() => { if (!profileId) return; void requireSupabase().from('birth_profiles').select('display_name').eq('id',profileId).maybeSingle().then(({data}) => setProfileName(data?.display_name ?? '')); }, [profileId]);
  useEffect(()=>{let active=true;void aiCall<{modules:{id:string;available:boolean}[];error?:string}>('list-modules').then(result=>{if(active)setAvailability(Object.fromEntries(result.modules.map(item=>[item.id,item.available])));}).catch(cause=>{if(active)setServiceMessage(cause instanceof Error?cause.message:'AI modules are unavailable.');});return()=>{active=false};},[]);
  return (
    <AppScreen tab="ai" pad={0} noTopInset bg={themed("#FCF7F1", 'surface')}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#23245F', '#393286', '#6F62BD', themed('#B9AEDF', 'surface')!]} locations={[0, 0.45, 0.8, 1]} style={{ paddingBottom: 60 }}>
        <SafeAreaView edges={['top']}>
          <View style={{ height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 }}>
            <Pressable onPress={() => setMenu(true)} hitSlop={10} accessibilityLabel="AI menu" accessibilityRole="button"><Menu size={21} color={themed("#fff", 'foreground')} /></Pressable>
            <Pressable onPress={() => setMenu(true)} hitSlop={10} accessibilityLabel="More"><EllipsisVertical size={19} color={themed("#fff", 'foreground')} /></Pressable>
          </View>
        </SafeAreaView>
        <View style={{ position: 'absolute', left: 40, top: 70 }}><GoldStar size={7} color={themed("#fff", 'foreground')} opacity={0.7} /></View>
        <View style={{ position: 'absolute', right: 50, top: 60 }}><GoldStar size={9} color={themed("#fff", 'foreground')} opacity={0.6} /></View>
        <View style={{ position: 'absolute', right: 90, top: 120 }}><GoldStar size={6} color={themed("#fff", 'foreground')} opacity={0.5} /></View>
        <View style={{ alignItems: 'center', marginTop: -4 }}>
          <Image source={require('../../../assets/images/star-talks-mark.png')} contentFit="contain" accessibilityLabel="Star Talks logo" style={{ width: 128, height: 64 }} />
          <Text style={{ marginTop: 6, fontFamily: 'Poppins_600SemiBold', fontSize: 30, color: palette.white, letterSpacing: 0.5 }}>Star Talks</Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11.5, color: themed('#E9E3F7', 'foreground') }}>Your Cosmic Guide</Text>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 16, marginTop: -44 }}>
        <Pressable accessibilityRole="button" onPress={() => profileId ? router.push({pathname:'/ai/modules',params:{profileId}}) : go('/ai/modules')} style={{ borderRadius: 18, backgroundColor: themed('#F6F1FC', 'surface'), padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: themed('#E7E0F5', 'border'), shadowColor: '#4A3F9F', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
          <LinearGradient colors={['#6C5CD6', '#9A8BF0']} style={{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} color={themed("#fff", 'foreground')} strokeWidth={1.6} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: palette.navy }}>AI Astrology</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: palette.slate, marginTop: 2 }}>{profileName ? `Reading for ${profileName}` : 'Ask anything. Get personalized insights.'}</Text>
          </View>
          <ChevronRight size={18} color={palette.navy} />
        </Pressable>
      </View>

      <View style={{ marginTop: 16, backgroundColor: themed('#FDF9F4', 'surface'), borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 16, paddingTop: 16,paddingBottom:22 }}>
        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: palette.navy, marginBottom: 3 }}>Choose Your AI Module</Text>
        <Text style={{ fontFamily:'Poppins_400Regular',fontSize:10,color:palette.slate,marginBottom:10 }}>Available during preview · daily use limit applies</Text>
        {serviceMessage?<Text accessibilityRole="alert" style={{fontFamily:'Poppins_400Regular',fontSize:10,color:palette.danger,marginBottom:9}}>{serviceMessage}</Text>:null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
          {MODULES.map(m => (
            <Pressable key={m.id} accessibilityRole="button" accessibilityState={{ disabled: !availability?.[m.id] }} disabled={!availability?.[m.id]} onPress={() => router.push({pathname:'/ai/[module]',params:{module:m.id,...(profileId?{profileId}:{})}})} style={{ width: '48.5%', minHeight: 112, paddingVertical: 14, borderRadius: 14, backgroundColor: themed('#FFFDFB', 'surface'), borderWidth: 1, borderColor: themed('#F0EAF5', 'border'), alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: themed(m.tint, 'surface'), alignItems: 'center', justifyContent: 'center' }}>{m.icon(themed(m.ink)!, 22)}</View>
              <Text numberOfLines={2} style={{ marginTop: 9, textAlign: 'center', fontFamily: 'Poppins_600SemiBold', fontSize: 10.5, lineHeight: 14, color: palette.navy }}>{m.name}</Text>
              {availability&&availability[m.id]===false?<Text style={{fontFamily:'Poppins_400Regular',fontSize:8,color:palette.danger}}>Unavailable</Text>:null}
            </Pressable>
          ))}
        </View>
      </View>
      <Sheet visible={menu} onClose={() => setMenu(false)} items={[
        { label: 'Conversation history', onPress: () => go('/ai/history') },
        { label: 'AI safety & responsible responses', onPress: () => go('/ai/safety') },
      ]} />
    </AppScreen>
  );
}
