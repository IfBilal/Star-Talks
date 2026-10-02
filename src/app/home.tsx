import {
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  CircleUserRound,
  GraduationCap,
  Headphones,
  MapPin,
  MessagesSquare,
  Play,
  Search,
  Sparkles,
  Sun,
  UsersRound,
  Video,
  WalletCards,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, ImageBackground, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { go, TabBar } from '@/components/ui';
import { useTranslation } from 'react-i18next';

import { requireSupabase } from '@/lib/supabase';
import { ensureCurrentChart } from '@/features/astrology/ensureCurrentChart';

const services = [
  { id: 'aiAstrology', route: '/ai', icon: Sun, tint: '#FFF2D7', ink: '#B38B42' },
  { id: 'findAstrologers', route: undefined, icon: MapPin, tint: '#ECEBFF', ink: '#5456A8' },
  { id: 'chat', route: undefined, icon: MessagesSquare, tint: '#FBE9EE', ink: '#A74F75' },
  { id: 'audioConsultation', route: undefined, icon: Headphones, tint: '#E5F5F3', ink: '#438C8C' },
  { id: 'videoConsultation', route: undefined, icon: Video, tint: '#EDEBFC', ink: '#5E59A4' },
  { id: 'reports', route: '/reports', icon: BookOpen, tint: '#FBEAF0', ink: '#A84D76' },
  { id: 'courses', route: '/courses', icon: GraduationCap, tint: '#F0EAFE', ink: '#6453A2' },
  { id: 'walletCredits', route: '/wallet', icon: WalletCards, tint: '#E4F5F2', ink: '#428984' },
] as const;

export default function HomeScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const tileEntrance = useRef(services.map(() => new Animated.Value(0))).current;
  const offerEntrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(45, tileEntrance.map(value => Animated.timing(value, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }))).start();
    Animated.sequence([
      Animated.delay(220),
      Animated.timing(offerEntrance, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [offerEntrance, tileEntrance]);

  useEffect(() => {
    void (async () => {
      try {
        const db = requireSupabase();
        const { data: { user } } = await db.auth.getUser();
        if (!user) return;
        const { data: profile } = await db
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .maybeSingle();
        if (profile?.display_name) setName(profile.display_name.split(' ')[0]);
        try {
          await ensureCurrentChart(db, user.id);
        } catch {
          // Chart regeneration can retry the next time Home is opened.
        }
      } catch {
        // The dashboard remains available while profile data is loading or unavailable.
      }
    })();
  }, []);

  const initials = name ? name.slice(0, 1).toUpperCase() : 'S';

  return (
    <View style={{ flex: 1, width: '100%', overflow: 'hidden', backgroundColor: '#FBF9F5' }}>
      <StatusBar barStyle="light-content" backgroundColor="#171C5C" />

      <SafeAreaView edges={['top']} style={{ width: '100%', backgroundColor: '#171C5C' }}>
        <View style={{ width: '100%', backgroundColor: '#171C5C', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 23 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Pressable accessibilityRole="button" accessibilityLabel="Profile" onPress={() => go('/profile')} style={{ width: 39, height: 39, borderRadius: 22, backgroundColor: '#F6F3F0', borderWidth: 2, borderColor: '#D8D0F7', alignItems: 'center', justifyContent: 'center' }}>
                {name ? <Text style={{ color: '#353477', fontFamily: 'Poppins_600SemiBold', fontSize: 15 }}>{initials}</Text> : <CircleUserRound color="#353477" size={23} />}
              </Pressable>
              <View>
                <Text style={{ color: '#FFFDFB', fontFamily: 'Poppins_600SemiBold', fontSize: 14 }}>{t('home.greeting', { name: name || t('home.starSeeker') })}</Text>
                <Text style={{ color: '#D9D9EF', fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 1 }}>{t('home.goodMorning')}</Text>
              </View>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={t('home.notificationsA11y')} onPress={() => go('/notifications')} style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}>
              <Bell color="#FFFDFB" size={21} strokeWidth={1.8} />
              <View style={{ position: 'absolute', right: 7, top: 6, width: 6, height: 6, borderRadius: 4, backgroundColor: '#F5CC79' }} />
            </Pressable>
          </View>

          <View style={{ height: 190, borderRadius: 17, overflow: 'hidden', backgroundColor: '#E9D5F5' }}>
            <ImageBackground source={require('../../assets/images/star-talks-splash-background.png')} resizeMode="cover" accessibilityLabel="Starry sunrise card background" imageStyle={{ opacity: 0.86 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} />
            <LinearGradient colors={['rgba(228, 219, 248, 0.17)', 'rgba(255, 241, 218, 0.08)']} style={{ position: 'absolute', inset: 0 }} />
            <Sparkles color="#F7E8BB" size={15} style={{ position: 'absolute', right: 24, top: 13 }} />
            <Text style={{ position: 'absolute', left: 17, right: 13, top: 21, color: '#34345F', fontFamily: 'Poppins_600SemiBold', fontSize: 17, lineHeight: 23, textAlign: 'center' }}>
              {t('home.heroTitle')}
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel={t('home.askA11y')} onPress={() => go('/ai')} style={({ pressed }) => [{ position: 'absolute', left: 10, right: 10, bottom: 9, height: 45, borderRadius: 25, backgroundColor: '#FFFEFC', flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: 8, gap: 10 }, pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] }]}>
              <Search color="#555987" size={17} />
              <Text style={{ flex: 1, color: '#89899B', fontFamily: 'Poppins_400Regular', fontSize: 10 }}>{t('home.askPlaceholder')}</Text>
              <View style={{ width: 30, height: 30, borderRadius: 16, backgroundColor: '#312D91', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight color="white" size={18} />
              </View>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1, flexShrink: 1, minHeight: 0, width: '100%', minWidth: 0 }} contentContainerStyle={{ width: '100%', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', columnGap: 8, rowGap: 9 }}>
          {services.map(({ id, route, icon: Icon, tint, ink }, index) => {
            const label = t(`home.services.${id}`);
            const entrance = tileEntrance[index];
            return <Animated.View key={id} style={{ width: '31.5%', opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }, { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }] }}>
              <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => (route ? go(route) : Alert.alert(label, t('home.comingSoon', { name: label })))} style={({ pressed }) => [{ width: '100%', height: 104, borderRadius: 13, backgroundColor: tint, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }, pressed && { opacity: 0.88 }]}>
                <Icon color={ink} size={25} strokeWidth={1.8} />
                <Text numberOfLines={2} style={{ minHeight: 27, marginTop: 8, color: '#30334F', fontFamily: 'Poppins_500Medium', fontSize: 9.5, lineHeight: 13, textAlign: 'center' }}>{label}</Text>
              </Pressable>
            </Animated.View>;
          })}
        </View>

        <Animated.View style={{ opacity: offerEntrance, transform: [{ translateY: offerEntrance.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('home.dailyCreditsA11y')} onPress={() => go('/earn-credits')} style={({ pressed }) => [{ minHeight: 68, borderRadius: 14, overflow: 'hidden', marginTop: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 }, pressed && { opacity: 0.92, transform: [{ scale: 0.985 }] }]}>
            <LinearGradient colors={['#252A80', '#27266F', '#302D84']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', inset: 0 }} />
            <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 9 }}>
              <Sparkles color="#FFE28F" size={28} strokeWidth={1.7} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFDFB', fontFamily: 'Poppins_600SemiBold', fontSize: 10.5 }}>{t('home.watchAdsTitle')}</Text>
              <Text style={{ color: '#D8D9F2', fontFamily: 'Poppins_400Regular', fontSize: 8.5, marginTop: 3 }}>{t('home.earnCredit')}</Text>
            </View>
            <ChevronRight color="#D9D5F3" size={17} />
          </Pressable>
        </Animated.View>

        <View style={{ marginTop: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E3DCF1', backgroundColor: '#F1ECFA', padding: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#E6E0F5', alignItems: 'center', justifyContent: 'center' }}>
              <Play size={19} color="#2A3785" strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#2A3785' }}>Watch Ads & Earn</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 10.5, color: '#3B4373', marginTop: 1 }}>Watch 5 ads to earn 5 AI credits</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }} contentContainerStyle={{ gap: 9 }}>
            {[0, 1, 2, 3, 4].map(i => (
              <View key={i} style={{ width: 78 }}>
                <Pressable accessibilityRole="button" onPress={() => go('/earn-credits')} style={{ height: 50, borderRadius: 7, overflow: 'hidden', backgroundColor: ['#2C3358', '#5E6A8A', '#8D8680', '#3B3340', '#46506F'][i], alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.45)', alignItems: 'center', justifyContent: 'center' }}>
                    <Play size={10} color="#fff" fill="#fff" />
                  </View>
                  {i < 3 ? <View style={{ position: 'absolute', right: 3, bottom: 3, width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(120,112,170,0.95)', alignItems: 'center', justifyContent: 'center' }}><Check size={9} color="#fff" strokeWidth={3} /></View> : null}
                </Pressable>
                <Text style={{ textAlign: 'center', fontFamily: 'Poppins_400Regular', fontSize: 9, color: '#2A3785', marginTop: 3 }}>{`Ad ${i + 1} (1 Credit)`}</Text>
                <Pressable accessibilityRole="button" onPress={() => go('/earn-credits')} style={{ height: 25, borderRadius: 6, backgroundColor: '#675E9D', alignItems: 'center', justifyContent: 'center', marginTop: 3 }}>
                  <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 10, color: '#fff' }}>Watch</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ marginTop: 10, marginBottom: 6, borderRadius: 16, borderWidth: 1, borderColor: '#E3DCF1', backgroundColor: '#F1ECFA', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 }}>
          <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: '#E6E0F5', alignItems: 'center', justifyContent: 'center' }}>
            <UsersRound size={25} color="#2A3785" strokeWidth={1.6} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#2A3785' }}>Refer & Earn</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#3B4373', marginTop: 1 }}>Refer a friend to Star Talks and earn 100 credits!</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 }}>
              <Pressable accessibilityRole="button" onPress={() => go('/refer')} style={{ height: 28, paddingHorizontal: 12, borderRadius: 7, backgroundColor: '#675E9D', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 10, color: '#fff' }}>Share Your Referral Code</Text>
              </Pressable>
              <View style={{ height: 28, paddingHorizontal: 9, borderRadius: 7, borderWidth: 1, borderStyle: 'dashed', borderColor: '#C9C2DF', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 10, color: '#2A3785' }}>STARTALKS10</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <TabBar active="home" />
    </View>
  );
}
