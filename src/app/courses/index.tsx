import { Bell, Eye, Hand, LayoutGrid, Menu, Search, Star, Sun, Layers, Compass as CompassIcon, Shapes } from 'lucide-react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppScreen, Card, F, go, SectionTitle, SearchBar } from '@/components/ui';
import { CosmicBg, CourseThumb, Meditator } from '@/components/ui/art';
import { PalmIcon } from '@/components/ui/icons';
import { COURSES } from '@/features/uiData/courses';
import { Colors } from '@/constants/theme';

const cats = [
  { name: 'Astrology', tint: '#DDEDF6', icon: <Sun size={24} color={Colors.navy} strokeWidth={1.5} /> },
  { name: 'Tarot Reading', tint: '#E8DEF8', icon: <Layers size={24} color={Colors.navy} strokeWidth={1.5} /> },
  { name: 'Numerology', tint: '#E7E6F6', icon: <Shapes size={24} color={Colors.navy} strokeWidth={1.5} /> },
  { name: 'Vastu', tint: '#FBE7D3', icon: <CompassIcon size={24} color={Colors.navy} strokeWidth={1.5} /> },
  { name: 'Palmistry', tint: '#FBDADC', icon: <PalmIcon size={25} color={Colors.navy} strokeWidth={1.4} /> },
  { name: 'Other Subjects', tint: '#E4E1EF', icon: <Eye size={24} color={Colors.navy} strokeWidth={1.5} /> },
];

export default function CoursesHome() {
  return (
    <AppScreen tab="courses" noTopInset pad={0} scroll>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#20206A', '#2E2A86', '#4A3F9C']} style={{ borderBottomLeftRadius: 22, borderBottomRightRadius: 22, paddingBottom: 16 }}>
        <SafeAreaView edges={['top']}>
          <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 }}>
            <Menu size={22} color="#fff" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Image source={require('../../../assets/images/star-talks-mark.png')} contentFit="contain" style={{ width: 40, height: 20 }} />
              <Text style={{ fontFamily: F.caps, fontSize: 17, color: '#E9D3A1', letterSpacing: 3.6 }}>STAR TALKS</Text>
            </View>
            <Pressable onPress={() => go('/notifications')} hitSlop={10} accessibilityLabel="Notifications"><Bell size={21} color="#fff" strokeWidth={1.7} /></Pressable>
          </View>
        </SafeAreaView>
        <View style={{ marginHorizontal: 16, marginTop: 6, height: 150, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
          <CosmicBg colors={['#22236F', '#2C2A88', '#3E3596']} style={{ flex: 1 }}>
            <View style={{ position: 'absolute', right: -14, top: 4 }}><Meditator size={150} /></View>
            <View style={{ padding: 18 }}>
              <Text style={{ fontFamily: F.serifM, fontSize: 25, color: '#F3E3BE' }}>Learn. Grow. Align.</Text>
              <Text style={{ marginTop: 10, width: '66%', fontFamily: F.r, fontSize: 11.5, lineHeight: 17, color: '#fff' }}>Explore expert-led courses and deepen your astrological knowledge.</Text>
            </View>
          </CosmicBg>
        </View>
        <SearchBar placeholder="Search for courses..." iconRight={<Search size={19} color={Colors.navy} />} style={{ marginHorizontal: 16, marginTop: 14, height: 48, borderRadius: 14, borderWidth: 0 }} />
      </LinearGradient>

      <View style={{ paddingHorizontal: 16 }}>
        <SectionTitle action="See All" onAction={() => go('/courses/category')} style={{ marginTop: 18 }}>Course Categories</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {cats.map(c => (
            <Pressable key={c.name} accessibilityRole="button" onPress={() => go(`/courses/category?c=${encodeURIComponent(c.name)}`)} style={{ width: '22.4%', height: 96, borderRadius: 14, backgroundColor: '#FFFDFB', borderWidth: 1, borderColor: '#F0EAF3', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center' }}>{c.icon}</View>
              <Text numberOfLines={2} style={{ marginTop: 7, textAlign: 'center', fontFamily: F.s, fontSize: 10, lineHeight: 12.5, color: Colors.navy }}>{c.name}</Text>
            </Pressable>
          ))}
        </View>

        <SectionTitle action="See All" onAction={() => go('/courses/category')} style={{ marginTop: 22 }}>Popular Courses</SectionTitle>
        <View style={{ gap: 10 }}>
          {COURSES.map(c => (
            <Card key={c.id} onPress={() => go(`/courses/${c.id}`)} style={{ borderRadius: 15, padding: 8, flexDirection: 'row', gap: 12 }}>
              <CourseThumb size={96} radius={12} />
              <View style={{ flex: 1, paddingVertical: 2 }}>
                <Text numberOfLines={1} style={{ fontFamily: F.s, fontSize: 13.5, color: Colors.navy }}>{c.title}</Text>
                <Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate, marginTop: 3 }}>{`${c.level}  •  ${c.modules} Modules  •  ${c.hours} hrs`}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7 }}>
                  <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#DCD6EF' }} />
                  <Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate }}>{c.instructor}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <Text style={{ fontFamily: F.b, fontSize: 14, color: Colors.navy }}>{c.price}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}><Star size={11} color="#F0A93B" fill="#F0A93B" /><Text style={{ fontFamily: F.r, fontSize: 10, color: Colors.slate }}>{c.rating}</Text></View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </AppScreen>
  );
}
