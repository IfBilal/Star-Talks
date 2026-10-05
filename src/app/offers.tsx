import { useTheme } from '@/lib/theme-context';
import { Gift, GraduationCap, Sparkles, Tag, Percent } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppBar, AppScreen, BellButton, Card, Chip, F, go, IconTile } from '@/components/ui';
import { CosmicBg } from '@/components/ui/art';

const offers = [
  { cat: 'Reports', code: 'WELCOME10', text: '10% OFF your first report', exp: 'Expires in 5 days', icon: <Percent size={20} color="#D9823B" /> },
  { cat: 'Courses', code: 'COURSE20', text: '20% OFF on all courses', exp: 'Expires in 7 days', icon: <GraduationCap size={20} color="#D9823B" /> },
  { cat: 'AI', code: 'AI5', text: '5 free AI credits (new users)', exp: 'Expires in 3 days', icon: <Sparkles size={20} color="#D9823B" /> },
  { cat: 'Reports', code: 'REPORT15', text: '15% OFF on astrology reports', exp: 'Expires in 10 days', icon: <Tag size={20} color="#D9823B" /> },
];

export default function Offers() {
  const { Colors: palette, themed } = useTheme();

  const [f, setF] = useState('All');
  const [applied, setApplied] = useState<string | null>(null);
  return (
    <AppScreen header={<AppBar brand dark right={<BellButton dark />} />} contentStyle={{ paddingTop: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <Text style={{ fontFamily: F.s, fontSize: 15, color: palette.navy }}>Offers & Coupons</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ flexGrow: 0, marginBottom: 12 }}>
        {['All', 'Courses', 'Reports', 'AI'].map(c => <Chip key={c} label={c} on={f === c} onPress={() => setF(c)} style={{ height: 32, paddingHorizontal: 18 }} />)}
      </ScrollView>
      <View style={{ gap: 10 }}>
        {offers.filter(o => f === 'All' || o.cat === f).map(o => (
          <Card key={o.code} style={{ borderRadius: 15, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: themed('#F9E7CF', 'surface'), alignItems: 'center', justifyContent: 'center' }}>{o.icon}</View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.s, fontSize: 13.5, color: palette.navy }}>{o.code}</Text>
              <Text style={{ fontFamily: F.r, fontSize: 11, color: themed('#4A5590', 'foreground'), marginTop: 2 }}>{o.text}</Text>
              <Text style={{ fontFamily: F.r, fontSize: 9.5, color: palette.slate, marginTop: 6 }}>{o.exp}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => { setApplied(o.code); go('/payment'); }} style={{ height: 34, paddingHorizontal: 18, borderRadius: 9, backgroundColor: themed(applied === o.code ? '#2B7A52' : '#3A479A', 'surface'), justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.m, fontSize: 11.5, color: themed('#fff', 'foreground') }}>{applied === o.code ? 'Applied' : 'Apply'}</Text>
            </Pressable>
          </Card>
        ))}
      </View>
      <Pressable accessibilityRole="button" onPress={() => go('/earn-credits')} style={{ marginTop: 18, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: themed('#E1A64F', 'border') }}>
        <CosmicBg colors={['#1F2170', '#2E2A88', '#3E3596']} style={{ height: 96, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 14 }}>
          <View style={{ width: 62, height: 62, borderRadius: 14, backgroundColor: themed('rgba(255,255,255,0.12)', 'surface'), alignItems: 'center', justifyContent: 'center' }}><Gift size={36} color={themed("#E5A656", 'foreground')} strokeWidth={1.5} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.s, fontSize: 14.5, color: themed('#fff', 'foreground') }}>Get 5 Free AI Credits</Text>
            <Text style={{ fontFamily: F.r, fontSize: 10.5, color: themed('#E9E3F7', 'foreground'), marginTop: 2 }}>Watch 5 Ads Daily</Text>
          </View>
          <View style={{ height: 32, paddingHorizontal: 14, borderRadius: 9, backgroundColor: themed('#6B63C4', 'surface'), justifyContent: 'center' }}><Text style={{ fontFamily: F.m, fontSize: 11, color: themed('#fff', 'foreground') }}>Watch Now</Text></View>
        </CosmicBg>
      </Pressable>
    </AppScreen>
  );
}
