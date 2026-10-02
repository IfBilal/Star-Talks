import { Bell, BookOpen, Gift, LifeBuoy, ShieldCheck, Sparkles, Sun, Wallet } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Card, F, IconTile, Toggle, Type } from '@/components/ui';
import { Colors } from '@/constants/theme';

const cats = [
  { k: 'pay', icon: <Wallet size={19} color="#C2416C" />, bg: '#FBE2E4', title: 'Payments & Refunds', sub: 'Payment status, refunds' },
  { k: 'ai', icon: <Sparkles size={19} color={Colors.navy} />, bg: '#EFE8D8', title: 'AI Credits & Ads', sub: 'Credit balance, daily ad credits' },
  { k: 'courses', icon: <BookOpen size={19} color={Colors.navy} />, bg: '#F6E8D2', title: 'Courses & Learning', sub: 'Enrolments, lesson unlocks, certificates' },
  { k: 'offers', icon: <Gift size={19} color="#D94B3F" />, bg: '#FBE7D0', title: 'Offers & Promotions', sub: 'Discounts, special offers' },
  { k: 'support', icon: <LifeBuoy size={19} color="#2B7A52" />, bg: '#DCEFE5', title: 'Support & Tickets', sub: 'Replies, status updates' },
  { k: 'daily', icon: <Sun size={19} color={Colors.navy} />, bg: '#F8E9D2', title: 'Daily Astrology', sub: 'Personalized daily insights' },
];

export default function NotificationSettings() {
  const [state, setState] = useState<Record<string, boolean>>(Object.fromEntries(cats.map(c => [c.k, true])));
  const all = Object.values(state).every(Boolean);
  const setAll = (v: boolean) => setState(Object.fromEntries(cats.map(c => [c.k, v])));
  return (
    <AppScreen header={<AppBar title="Notifications" right={<Bell size={19} color={Colors.navy} />} />} contentStyle={{ paddingTop: 2 }}>
      <Card style={{ borderRadius: 14, minHeight: 58, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconTile icon={<ShieldCheck size={18} color={Colors.navy} />} size={34} bg="#EFE7DA" />
        <Text style={{ flex: 1, fontFamily: F.s, fontSize: 13, color: Colors.navy }}>Enable All Notifications</Text>
        <Toggle value={all} onChange={setAll} />
      </Card>
      <Text style={[Type.section, { marginTop: 18, marginBottom: 10 }]}>Notification Categories</Text>
      <Card style={{ borderRadius: 14 }}>
        {cats.map((c, i) => (
          <View key={c.k} style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, borderBottomWidth: i < cats.length - 1 ? 1 : 0, borderBottomColor: '#EFEBF6' }}>
            <IconTile icon={c.icon} size={40} bg={c.bg} />
            <View style={{ flex: 1 }}><Text style={Type.rowTitle}>{c.title}</Text><Text style={[Type.rowSub, { marginTop: 2 }]}>{c.sub}</Text></View>
            <Toggle value={state[c.k]} onChange={v => setState(s => ({ ...s, [c.k]: v }))} />
          </View>
        ))}
      </Card>
    </AppScreen>
  );
}
