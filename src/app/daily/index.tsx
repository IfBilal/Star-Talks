import { Bell, BriefcaseBusiness, Clock3, Coins, Heart, Sparkles, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, BellButton, Card, F, ListRow, Toggle, Type } from '@/components/ui';
import { Colors } from '@/constants/theme';

const rows = [
  { icon: (c: string) => <Heart size={19} color="#D94B4B" strokeWidth={1.7} />, bg: '#FCE1E1', title: 'Love', sub: 'Open communication brings you closer.' },
  { icon: (c: string) => <BriefcaseBusiness size={19} color="#8A5A2B" strokeWidth={1.7} />, bg: '#F8E7CE', title: 'Career', sub: 'A good day for planning and networking.' },
  { icon: (c: string) => <Coins size={19} color="#D94B4B" strokeWidth={1.7} />, bg: '#FCE1E1', title: 'Finance', sub: 'Consider long-term investments.' },
  { icon: (c: string) => <Users size={19} color="#5B4FB0" strokeWidth={1.7} />, bg: '#EAE3F8', title: 'Relationships', sub: 'Be clear and honest in your conversations.' },
  { icon: (c: string) => <Clock3 size={19} color={Colors.navy} strokeWidth={1.7} />, bg: '#E2E3F6', title: 'General Guidance', sub: 'Stay grounded and trust your instincts.' },
];

export default function DailyHoroscope() {
  const [notify, setNotify] = useState(true);
  return (
    <AppScreen tab="profile" header={<AppBar brand dark right={<BellButton dark />} />} contentStyle={{ paddingTop: 12 }}>
      <Text style={[Type.h1, { fontSize: 20 }]}>Daily Horoscope</Text>
      <Text style={{ fontFamily: F.r, fontSize: 12, color: Colors.navy, marginTop: 3 }}>12 Apr 2025  •  Saturday</Text>
      <Card tint="#EFEAF9" style={{ marginTop: 14, padding: 14, flexDirection: 'row', gap: 12, borderRadius: 14 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E4DEF5', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={19} color={Colors.navy} /></View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.s, fontSize: 12.5, color: Colors.navy }}>Your Daily Energy</Text>
          <Text style={{ fontFamily: F.r, fontSize: 11, lineHeight: 17, color: '#4A5590', marginTop: 4 }}>A day of steady progress and positive communication. The Moon's influence brings clarity in relationships and decisions.</Text>
        </View>
      </Card>
      <View style={{ gap: 8, marginTop: 14 }}>
        {rows.map(r => <Card key={r.title} style={{ borderRadius: 14 }}><ListRow icon={r.icon} tileBg={r.bg} title={r.title} subtitle={r.sub} onPress={() => {}} style={{ minHeight: 64 }} /></Card>)}
      </View>
      <Card style={{ marginTop: 14, minHeight: 54, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14 }}>
        <Bell size={18} color={Colors.navy} />
        <Text style={{ flex: 1, fontFamily: F.s, fontSize: 12, color: Colors.navy }}>Daily Astrology Notifications</Text>
        <Toggle value={notify} onChange={setNotify} />
      </Card>
    </AppScreen>
  );
}
