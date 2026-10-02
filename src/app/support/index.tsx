import { CircleHelp, Headset, MessageCircle, SquarePen, CircleDot } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, BellButton, Card, F, go, IconTile, ListRow, Type } from '@/components/ui';
import { ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

const cats = ['Payment issue', 'Refund issue', 'AI issue', 'Account issue', 'Technical issue', 'Course issue', 'Report issue', 'Other'];

export default function Support() {
  return (
    <AppScreen tab="profile" header={<AppBar brand dark menu right={<BellButton dark />} />} contentStyle={{ paddingTop: 12 }}>
      <Text style={[Type.h1, { fontSize: 18 }]}>Help & Support</Text>
      <Text style={{ fontFamily: F.r, fontSize: 11.5, color: Colors.slate, marginTop: 2, marginBottom: 12 }}>We're here to help you</Text>
      <Card style={{ borderRadius: 14 }}>
        <ListRow icon={c => <CircleHelp size={19} color={c} strokeWidth={1.7} />} tileBg="#F6E6D4" title="FAQs" subtitle="Find answers to common questions" onPress={() => go('/support/faqs')} divider style={{ minHeight: 62 }} />
        <ListRow icon={c => <MessageCircle size={19} color={c} strokeWidth={1.7} />} tileBg="#F6E6D4" title="Live Chat" subtitle="Chat with our support team" onPress={() => go('/support/chat')} divider style={{ minHeight: 62 }} />
        <ListRow icon={c => <SquarePen size={19} color={c} strokeWidth={1.7} />} tileBg="#F6E6D4" title="Create Support Ticket" subtitle="Get help with your issue" onPress={() => go('/support/new')} style={{ minHeight: 62 }} />
      </Card>
      <Pressable onPress={() => go('/support/tickets')} style={{ alignSelf: 'flex-end', marginTop: 8 }}><Text style={{ fontFamily: F.m, fontSize: 11, color: Colors.navy }}>View my tickets</Text></Pressable>
      <Text style={[Type.section, { marginTop: 10, marginBottom: 8, fontSize: 14 }]}>Support Categories</Text>
      <Card style={{ borderRadius: 12 }}>
        {cats.map((c, i) => (
          <Pressable key={c} accessibilityRole="button" onPress={() => go(`/support/new?c=${encodeURIComponent(c)}`)} style={{ height: 40, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, borderBottomWidth: i < cats.length - 1 ? 1 : 0, borderBottomColor: '#F0ECF5' }}>
            <CircleDot size={15} color={Colors.slate} strokeWidth={1.5} />
            <Text style={{ flex: 1, fontFamily: F.r, fontSize: 12, color: Colors.ink }}>{c}</Text>
            <ChevronRight size={15} color={Colors.slate} />
          </Pressable>
        ))}
      </Card>
    </AppScreen>
  );
}
