import { useTheme } from '@/lib/theme-context';
import { BadgeDollarSign, CalendarClock, ChevronRight, Gift, LifeBuoy, Settings, Sparkles, Undo2, Video } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppBar, AppScreen, Card, Chip, F, go } from '@/components/ui';

const items = [
  { cat: 'Courses', icon: <Video size={19} color="#6A4FA6" />, bg: '#EBE4F8', text: ['Lesson 2 is now unlocked in ', 'Vedic Astrology', ' Foundation course.'], time: 'Yesterday', href: '/courses/vedic-foundation/lesson' },
  { cat: 'Credits', icon: <Sparkles size={19} color="#B5712B" />, bg: '#FBE9CE', text: ['You earned 5 AI credits from watching ads!'], time: 'Yesterday', href: '/wallet' },
  { cat: 'Offers', icon: <Gift size={19} color="#C2416C" />, bg: '#FBDDE3', text: ['Special offer: 20% off on all courses'], sub: 'Valid till 25 Apr 2025', time: 'Yesterday', href: '/offers' },
  { cat: 'Payments', icon: <Undo2 size={19} color="#2B7A52" />, bg: '#D9EFE2', text: ['Your refund of ₹499 has been processed and added to your wallet.'], time: '2 days ago', href: '/wallet?tab=Transactions' },
  { cat: 'Support', icon: <LifeBuoy size={19} color="#5B4FB0" />, bg: '#E6E0F8', text: ['Your support ticket #4521 has been updated.'], time: '2 days ago', href: '/support/tickets' },
  { cat: 'Credits', icon: <CalendarClock size={19} color="#3F58B0" />, bg: '#E0E6F8', text: ['Your daily horoscope is ready.'], time: '3 days ago', href: '/daily' },
];

export default function NotificationList() {
  const { Colors: palette, themed } = useTheme();

  const [f, setF] = useState('All');
  const list = items.filter(i => f === 'All' || i.cat === f);
  return (
    <AppScreen header={<AppBar title="Notifications" right={<Pressable onPress={() => go('/notifications/settings')} hitSlop={10} accessibilityLabel="Notification settings"><Settings size={19} color={palette.navy} /></Pressable>} />} pad={0} contentStyle={{ paddingTop: 2 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} style={{ flexGrow: 0 }}>
        {['All', 'Courses', 'Offers', 'Credits', 'Payments', 'Support'].map(c => <Chip key={c} label={c} on={f === c} onPress={() => setF(c)} style={{ height: 38, paddingHorizontal: 22, borderRadius: 19 }} />)}
      </ScrollView>
      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <Card style={{ borderRadius: 16 }}>
          {list.map((n, i) => (
            <Pressable key={n.text.join('')} accessibilityRole="button" onPress={() => go(n.href)} style={{ minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: i < list.length - 1 ? 1 : 0, borderBottomColor: themed('#EFEBF6', 'border') }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: themed(n.bg, 'surface'), alignItems: 'center', justifyContent: 'center' }}>{n.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.r, fontSize: 12, lineHeight: 18, color: palette.ink }}>{n.text.map((t, k) => <Text key={k} style={k === 1 ? { fontFamily: F.s, color: palette.navy } : undefined}>{t}</Text>)}</Text>
                {n.sub ? <Text style={{ fontFamily: F.r, fontSize: 10.5, color: palette.slate, marginTop: 1 }}>{n.sub}</Text> : null}
                <Text style={{ fontFamily: F.r, fontSize: 10.5, color: palette.slate, marginTop: 2 }}>{n.time}</Text>
              </View>
              <ChevronRight size={17} color={palette.navy} />
            </Pressable>
          ))}
          {list.length === 0 ? <Text style={{ textAlign: 'center', padding: 30, fontFamily: F.r, fontSize: 12, color: palette.slate }}>No notifications here yet</Text> : null}
        </Card>
      </View>
    </AppScreen>
  );
}
