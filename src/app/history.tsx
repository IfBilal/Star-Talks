import { Award, BadgeCheck, BookOpen, ClipboardList, CreditCard, GraduationCap, HeartHandshake, LifeBuoy, MessagesSquare, Sparkles, TrendingUp, Wallet } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppBar, AppScreen, Card, Chip, F, go, IconTile, ListRow, Type } from '@/components/ui';
import { MODULES } from '@/features/uiData/ai';
import { Colors } from '@/constants/theme';

const rows = [
  { cat: 'AI', icon: (c: string) => <CreditCard size={19} color={c} strokeWidth={1.6} />, title: 'Payment History', sub: 'View all payments and refunds', n: 24, href: '/wallet?tab=Transactions', all: true },
  { cat: 'AI', icon: (c: string) => <Wallet size={19} color={c} strokeWidth={1.6} />, title: 'Wallet Transactions', sub: 'Add money, credits and usage', n: 18, href: '/wallet?tab=Transactions', all: true },
  { cat: 'AI', icon: (c: string) => <TrendingUp size={19} color={c} strokeWidth={1.6} />, title: 'AI Question / Credit Usage', sub: 'Track your AI credits and questions', n: 36, href: '/wallet' },
  { cat: 'AI', icon: (c: string) => <MessagesSquare size={19} color={c} strokeWidth={1.6} />, title: 'AI Conversations', sub: 'View AI chat history', n: 15, href: '/ai/history' },
  { cat: 'Reports', icon: (c: string) => <ClipboardList size={19} color={c} strokeWidth={1.6} />, title: 'Astrology Reports', sub: 'View and download reports', n: 6, href: '/reports/history' },
  { cat: 'Courses', icon: (c: string) => <BookOpen size={19} color={c} strokeWidth={1.6} />, title: 'Enrolled Courses', sub: 'View your enrolled courses', n: 3, href: '/courses/mine' },
  { cat: 'Courses', icon: (c: string) => <GraduationCap size={19} color={c} strokeWidth={1.6} />, title: 'Course Progress', sub: 'Track your learning progress', n: 2, href: '/courses/mine' },
  { cat: 'Courses', icon: (c: string) => <BadgeCheck size={19} color={c} strokeWidth={1.6} />, title: 'Completed Courses', sub: 'View completed courses', n: 1, href: '/courses/mine?tab=Completed' },
  { cat: 'Courses', icon: (c: string) => <Award size={19} color={c} strokeWidth={1.6} />, title: 'Certificates', sub: 'Download your certificates', n: 1, href: '/certificates' },
  { cat: 'Support', icon: (c: string) => <LifeBuoy size={19} color={c} strokeWidth={1.6} />, title: 'Support Ticket History', sub: 'View past support tickets', n: 4, href: '/support/tickets' },
  { cat: 'Reports', icon: (c: string) => <HeartHandshake size={19} color={c} strokeWidth={1.6} />, title: 'Compatibility Reports', sub: 'View relationship analysis reports', n: 2, href: '/compatibility/result' },
];

export default function UserHistory() {
  const [f, setF] = useState('All');
  const list = rows.filter(r => f === 'All' || r.cat === f);
  return (
    <AppScreen tab="profile" header={<AppBar brand />} contentStyle={{ paddingTop: 4 }} pad={0}>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={[Type.h1, { fontSize: 22 }]}>User History</Text>
        <Text style={[Type.body, { color: Colors.navy, marginTop: 3, marginBottom: 14, fontSize: 12 }]}>View your past activity, reports and more.</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} style={{ flexGrow: 0 }}>
        {['All', 'AI', 'Reports', 'Courses', 'Support'].map(c => <Chip key={c} label={c} on={f === c} onPress={() => setF(c)} style={{ height: 34, paddingHorizontal: 20, borderRadius: 17 }} />)}
      </ScrollView>
      <View style={{ paddingHorizontal: 16, marginTop: 14, gap: 4 }}>
        {list.map(r => (
          <Card key={r.title} style={{ borderRadius: 14 }}>
            <ListRow icon={r.icon} title={r.title} subtitle={r.sub} value={String(r.n)} onPress={() => go(r.href)} style={{ minHeight: 64 }} />
          </Card>
        ))}
      </View>
      {f === 'All' || f === 'AI' ? (
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[Type.section, { marginTop: 22, marginBottom: 10, fontSize: 14 }]}>AI History (Separate by Module)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MODULES.map(m => (
              <Pressable key={m.id} accessibilityRole="button" onPress={() => go('/ai/history')} style={{ width: '31.5%', height: 58, borderRadius: 13, backgroundColor: '#FFFDFB', borderWidth: 1, borderColor: '#F0EAF3', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 6 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: m.tint, alignItems: 'center', justifyContent: 'center' }}>{m.icon(m.ink, 15)}</View>
                <Text numberOfLines={1} style={{ flex: 1, fontFamily: F.s, fontSize: 10, color: Colors.navy }}>{m.name.split(' ')[0]}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </AppScreen>
  );
}
