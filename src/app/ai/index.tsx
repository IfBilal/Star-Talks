import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronRight, EllipsisVertical, Menu, Sparkles } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StatusBar, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppScreen, go, Sheet } from '@/components/ui';
import { GoldStar } from '@/components/ui/icons';
import { MODULES } from '@/features/uiData/ai';
import { Colors } from '@/constants/theme';
import { requireSupabase } from '@/lib/supabase';

function Compass({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx="32" cy="32" r="29" stroke="#E2BE7B" strokeWidth="1.5" />
      <Circle cx="32" cy="32" r="21" stroke="#E2BE7B" strokeWidth="1" opacity="0.7" />
      <Path d="M32 4V60M4 32H60M12 12L52 52M52 12L12 52" stroke="#E2BE7B" strokeWidth="1" opacity="0.8" />
      <Path d="M32 18c1.6 9 5 12.4 14 14c-9 1.6-12.4 5-14 14c-1.6-9-5-12.4-14-14c9-1.6 12.4-5 14-14Z" fill="#F0D79E" />
    </Svg>
  );
}

export default function AiHome() {
  const { profileId } = useLocalSearchParams<{ profileId?: string }>();
  const [menu, setMenu] = useState(false);
  const [profileName, setProfileName] = useState('');
  useEffect(() => { if (!profileId) return; void requireSupabase().from('birth_profiles').select('display_name').eq('id',profileId).maybeSingle().then(({data}) => setProfileName(data?.display_name ?? '')); }, [profileId]);
  return (
    <AppScreen tab="ai" scroll={false} pad={0} noTopInset bg="#FCF7F1">
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#23245F', '#393286', '#6F62BD', '#B9AEDF']} locations={[0, 0.45, 0.8, 1]} style={{ height: 262 }}>
        <SafeAreaView edges={['top']}>
          <View style={{ height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 }}>
            <Menu size={21} color="#fff" />
            <Pressable onPress={() => setMenu(true)} hitSlop={10} accessibilityLabel="More"><EllipsisVertical size={19} color="#fff" /></Pressable>
          </View>
        </SafeAreaView>
        <View style={{ position: 'absolute', left: 40, top: 70 }}><GoldStar size={7} color="#fff" opacity={0.7} /></View>
        <View style={{ position: 'absolute', right: 50, top: 60 }}><GoldStar size={9} color="#fff" opacity={0.6} /></View>
        <View style={{ position: 'absolute', right: 90, top: 120 }}><GoldStar size={6} color="#fff" opacity={0.5} /></View>
        <View style={{ alignItems: 'center', marginTop: -4 }}>
          <Compass size={64} />
          <Text style={{ marginTop: 6, fontFamily: 'Poppins_600SemiBold', fontSize: 30, color: '#E9CC8D', letterSpacing: 0.5 }}>Star Talks</Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11.5, color: '#E9E3F7' }}>Your Cosmic Guide</Text>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 16, marginTop: -44 }}>
        <Pressable accessibilityRole="button" onPress={() => profileId ? router.push({pathname:'/ai/modules',params:{profileId}}) : go('/ai/modules')} style={{ borderRadius: 18, backgroundColor: '#F6F1FC', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#E7E0F5', shadowColor: '#4A3F9F', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
          <LinearGradient colors={['#6C5CD6', '#9A8BF0']} style={{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} color="#fff" strokeWidth={1.6} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: Colors.navy }}>AI Astrology</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: Colors.slate, marginTop: 2 }}>{profileName ? `Reading for ${profileName}` : 'Ask anything. Get personalized insights.'}</Text>
          </View>
          <ChevronRight size={18} color={Colors.navy} />
        </Pressable>
      </View>

      <View style={{ flex: 1, marginTop: 16, backgroundColor: '#FDF9F4', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: Colors.navy, marginBottom: 3 }}>Choose Your AI Module</Text>
        <Text style={{ fontFamily:'Poppins_400Regular',fontSize:10,color:Colors.slate,marginBottom:10 }}>Available during preview · daily use limit applies</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
          {MODULES.map(m => (
            <Pressable key={m.id} accessibilityRole="button" onPress={() => router.push({pathname:'/ai/[module]',params:{module:m.id,...(profileId?{profileId}:{})}})} style={{ width: '31.6%', height: 100, borderRadius: 14, backgroundColor: '#FFFDFB', borderWidth: 1, borderColor: '#F0EAF5', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: m.tint, alignItems: 'center', justifyContent: 'center' }}>{m.icon(m.ink, 22)}</View>
              <Text numberOfLines={2} style={{ marginTop: 9, textAlign: 'center', fontFamily: 'Poppins_600SemiBold', fontSize: 10.5, lineHeight: 14, color: Colors.navy }}>{m.name}</Text>
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
