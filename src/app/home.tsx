import {
  Bell,
  BookOpen,
  ChevronRight,
  CircleUserRound,
  GraduationCap,
  Headphones,
  House,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Search,
  Sparkles,
  Sun,
  UserRound,
  Video,
  WalletCards,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, ImageBackground, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { requireSupabase } from '@/lib/supabase';
import { ensureCurrentChart } from '@/features/astrology/ensureCurrentChart';

const services = [
  { name: 'AI Astrology', icon: Sun, tint: '#FFF2D7', ink: '#B38B42' },
  { name: 'Find Astrologers', icon: MapPin, tint: '#ECEBFF', ink: '#5456A8' },
  { name: 'Chat', icon: MessagesSquare, tint: '#FBE9EE', ink: '#A74F75' },
  { name: 'Audio Consultation', icon: Headphones, tint: '#E5F5F3', ink: '#438C8C' },
  { name: 'Video Consultation', icon: Video, tint: '#EDEBFC', ink: '#5E59A4' },
  { name: 'Reports', icon: BookOpen, tint: '#FBEAF0', ink: '#A84D76' },
  { name: 'Courses', icon: GraduationCap, tint: '#F0EAFE', ink: '#6453A2' },
  { name: 'Wallet & Credits', icon: WalletCards, tint: '#E4F5F2', ink: '#428984' },
];

const tabs = [
  { name: 'Home', icon: House },
  { name: 'Chat', icon: MessageCircle },
  { name: 'Reports', icon: BookOpen },
  { name: 'Credits', icon: WalletCards },
  { name: 'Profile', icon: UserRound },
];

export default function HomeScreen() {
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
              <View style={{ width: 39, height: 39, borderRadius: 22, backgroundColor: '#F6F3F0', borderWidth: 2, borderColor: '#D8D0F7', alignItems: 'center', justifyContent: 'center' }}>
                {name ? <Text style={{ color: '#353477', fontFamily: 'Poppins_600SemiBold', fontSize: 15 }}>{initials}</Text> : <CircleUserRound color="#353477" size={23} />}
              </View>
              <View>
                <Text style={{ color: '#FFFDFB', fontFamily: 'Poppins_600SemiBold', fontSize: 14 }}>Hello, {name || 'Star Seeker'}</Text>
                <Text style={{ color: '#D9D9EF', fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 1 }}>Good morning</Text>
              </View>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => Alert.alert('Notifications', "You're all caught up.")} style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}>
              <Bell color="#FFFDFB" size={21} strokeWidth={1.8} />
              <View style={{ position: 'absolute', right: 7, top: 6, width: 6, height: 6, borderRadius: 4, backgroundColor: '#F5CC79' }} />
            </Pressable>
          </View>

          <View style={{ height: 190, borderRadius: 17, overflow: 'hidden', backgroundColor: '#E9D5F5' }}>
            <ImageBackground source={require('../../assets/images/star-talks-splash-background.png')} resizeMode="cover" accessibilityLabel="Starry sunrise card background" imageStyle={{ opacity: 0.86 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} />
            <LinearGradient colors={['rgba(228, 219, 248, 0.17)', 'rgba(255, 241, 218, 0.08)']} style={{ position: 'absolute', inset: 0 }} />
            <Sparkles color="#F7E8BB" size={15} style={{ position: 'absolute', right: 24, top: 13 }} />
            <Text style={{ position: 'absolute', left: 17, right: 13, top: 21, color: '#34345F', fontFamily: 'Poppins_600SemiBold', fontSize: 17, lineHeight: 23, textAlign: 'center' }}>
              Discover Answers{'\n'}for a Brighter Tomorrow
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Ask your question" onPress={() => Alert.alert('Ask your question', 'Question readings will be available soon.')} style={({ pressed }) => [{ position: 'absolute', left: 10, right: 10, bottom: 9, height: 45, borderRadius: 25, backgroundColor: '#FFFEFC', flexDirection: 'row', alignItems: 'center', paddingLeft: 14, paddingRight: 8, gap: 10 }, pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] }]}>
              <Search color="#555987" size={17} />
              <Text style={{ flex: 1, color: '#89899B', fontFamily: 'Poppins_400Regular', fontSize: 10 }}>Ask your question...</Text>
              <View style={{ width: 30, height: 30, borderRadius: 16, backgroundColor: '#312D91', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight color="white" size={18} />
              </View>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1, flexShrink: 1, minHeight: 0, width: '100%', minWidth: 0 }} contentContainerStyle={{ width: '100%', paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', columnGap: 8, rowGap: 9 }}>
          {services.map(({ name: label, icon: Icon, tint, ink }, index) => {
            const entrance = tileEntrance[index];
            return <Animated.View key={label} style={{ width: '31.5%', opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }, { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }] }}>
              <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => Alert.alert(label, `${label} is coming soon.`)} style={({ pressed }) => [{ width: '100%', height: 104, borderRadius: 13, backgroundColor: tint, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }, pressed && { opacity: 0.88 }]}>
                <Icon color={ink} size={25} strokeWidth={1.8} />
                <Text numberOfLines={2} style={{ minHeight: 27, marginTop: 8, color: '#30334F', fontFamily: 'Poppins_500Medium', fontSize: 9.5, lineHeight: 13, textAlign: 'center' }}>{label}</Text>
              </Pressable>
            </Animated.View>;
          })}
        </View>

        <Animated.View style={{ opacity: offerEntrance, transform: [{ translateY: offerEntrance.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Daily AI credit offer" onPress={() => Alert.alert('Daily AI credits', 'Ad rewards will be available soon.')} style={({ pressed }) => [{ minHeight: 68, borderRadius: 14, overflow: 'hidden', marginTop: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 }, pressed && { opacity: 0.92, transform: [{ scale: 0.985 }] }]}>
            <LinearGradient colors={['#252A80', '#27266F', '#302D84']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', inset: 0 }} />
            <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 9 }}>
              <Sparkles color="#FFE28F" size={28} strokeWidth={1.7} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFDFB', fontFamily: 'Poppins_600SemiBold', fontSize: 10.5 }}>Watch 5 Ads &amp; Get 5 Free AI Credits Daily</Text>
              <Text style={{ color: '#D8D9F2', fontFamily: 'Poppins_400Regular', fontSize: 8.5, marginTop: 3 }}>Earn 1 credit per ad  •  Max 5 per day</Text>
            </View>
            <ChevronRight color="#D9D5F3" size={17} />
          </Pressable>
        </Animated.View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={{ flexShrink: 0, width: '100%', backgroundColor: '#FFFDFB' }}>
        <View style={{ width: '100%', height: 56, backgroundColor: '#FFFDFB', borderTopWidth: 1, borderTopColor: '#EEEAF0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
          {tabs.map(({ name: label, icon: Icon }) => {
            const active = label === 'Home';
            return (
              <Pressable key={label} accessibilityRole="button" accessibilityLabel={`${label} tab`} onPress={() => {
                if (label === 'Home') router.replace('/home');
                else if (label === 'Profile') router.push('/profile');
                else Alert.alert(label, `${label} is coming soon.`);
              }} style={({ pressed }) => [{ width: '20%', height: 52, alignItems: 'center', justifyContent: 'center', gap: 3 }, pressed && { opacity: 0.72, transform: [{ scale: 0.94 }] }]}>
                <Icon color={active ? '#283276' : '#8F91A2'} size={17} strokeWidth={active ? 2.2 : 1.8} />
                <Text style={{ color: active ? '#283276' : '#8F91A2', fontFamily: active ? 'Poppins_600SemiBold' : 'Poppins_400Regular', fontSize: 8 }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}
