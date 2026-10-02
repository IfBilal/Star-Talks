import { ChevronDown, Heart, Search, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, F, go, SectionTitle } from '@/components/ui';
import { CosmicBg, CourseThumb, Meditator } from '@/components/ui/art';
import { COURSES } from '@/features/uiData/courses';
import { Colors } from '@/constants/theme';

function Filter({ label }: { label: string }) {
  return (
    <Pressable accessibilityRole="button" style={{ height: 40, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E9E3F3', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Text style={{ fontFamily: F.m, fontSize: 11.5, color: Colors.navy }}>{label}</Text><ChevronDown size={14} color={Colors.navy} />
    </Pressable>
  );
}

export default function SearchDiscover() {
  const [q, setQ] = useState('');
  return (
    <AppScreen tab="profile" header={<AppBar brand />} contentStyle={{ paddingTop: 6 }}>
      <Text style={{ fontFamily: F.serif, fontSize: 24, color: Colors.navy }}>Search & Discover</Text>
      <Text style={{ fontFamily: F.r, fontSize: 11.5, color: Colors.navy, marginTop: 3, marginBottom: 14 }}>Find the right guidance for your journey</Text>
      <View style={{ height: 50, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E9E3F3', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 }}>
        <Search size={18} color={Colors.navy} />
        <Text style={{ flex: 1, fontFamily: F.r, fontSize: 12, color: q ? Colors.ink : '#9AA0B8' }} onPress={() => setQ(q ? '' : 'tarot')}>{q || 'Search courses, reports, topics...'}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 12 }} style={{ flexGrow: 0 }}>
        <Filter label="Category" /><Filter label="Language" /><Filter label="Price" /><Filter label="Rating" />
      </ScrollView>
      <Button title="Search" height={48} style={{ borderRadius: 12, marginTop: 14 }} onPress={() => go('/courses/category')} />
      <View style={{ height: 130, borderRadius: 16, overflow: 'hidden', marginTop: 14 }}>
        <CosmicBg colors={['#1F2170', '#2E2A88', '#3E3596']} style={{ flex: 1, padding: 18 }}>
          <View style={{ position: 'absolute', right: -12, top: 0 }}><Meditator size={140} /></View>
          <Text style={{ fontFamily: F.serifM, fontSize: 22, lineHeight: 28, color: '#F3E3BE', width: '66%' }}>{'Discover\nGuidance That\nFeels Right'}</Text>
        </CosmicBg>
      </View>
      <SectionTitle action="See All" onAction={() => go('/courses/category')} style={{ marginTop: 18 }}>Recommended Courses</SectionTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {COURSES.slice(0, 3).map(c => (
          <Card key={c.id} style={{ width: 150, borderRadius: 15, padding: 10 }}>
            <CourseThumb size={130} radius={12} />
            <Text numberOfLines={1} style={{ fontFamily: F.s, fontSize: 12, color: Colors.navy, marginTop: 8 }}>{c.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}><Star size={11} color="#F0A93B" fill="#F0A93B" /><Text style={{ fontFamily: F.r, fontSize: 10, color: Colors.slate }}>{c.rating}</Text></View>
            <Text style={{ fontFamily: F.b, fontSize: 12.5, color: Colors.navy, marginTop: 3 }}>{c.price}</Text>
            <Button title="View Course" variant="outline" height={32} style={{ borderRadius: 8, marginTop: 8 }} textStyle={{ fontSize: 11 }} onPress={() => go(`/courses/${c.id}`)} />
          </Card>
        ))}
      </ScrollView>
      <SectionTitle action="See All" onAction={() => go('/reports/history')} style={{ marginTop: 18 }}>Recently Viewed</SectionTitle>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[['Birth Chart Report', 'Viewed 2 days ago', '/reports/ready'], ['Tarot Reading Mastery', 'Viewed 3 days ago', '/courses/tarot-mastery']].map(([a, b, h]) => (
          <Card key={a} onPress={() => go(h)} style={{ flex: 1, borderRadius: 14, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1 }}><Text numberOfLines={1} style={{ fontFamily: F.s, fontSize: 11.5, color: Colors.navy }}>{a}</Text><Text style={{ fontFamily: F.r, fontSize: 9.5, color: Colors.slate, marginTop: 2 }}>{b}</Text></View>
            <Heart size={15} color={Colors.navy} />
          </Card>
        ))}
      </View>
      <SectionTitle action="See All" onAction={() => go('/saved')} style={{ marginTop: 18 }}>Your Favourites</SectionTitle>
      <Card onPress={() => go('/saved')} style={{ borderRadius: 14, minHeight: 58, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}><Text style={{ fontFamily: F.s, fontSize: 12.5, color: Colors.navy }}>Career Analysis Report</Text><Text style={{ fontFamily: F.r, fontSize: 10, color: Colors.slate }}>Saved report</Text></View>
        <Heart size={17} color="#D94B6B" fill="#D94B6B" />
      </Card>
    </AppScreen>
  );
}
