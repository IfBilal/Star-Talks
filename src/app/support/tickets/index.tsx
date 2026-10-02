import { Text, View } from 'react-native';
import { AppBar, AppScreen, Card, F, go, Pill } from '@/components/ui';
import { Colors } from '@/constants/theme';

export const TICKETS = [
  { id: '4521', title: 'Payment issue', sub: 'Course payment deducted twice', status: 'In progress', bg: '#E3E8FB', ink: '#3F58B0', date: '14 Apr 2025' },
  { id: '4388', title: 'AI issue', sub: 'Answer did not load', status: 'Resolved', bg: '#DCEFE5', ink: '#2B7A52', date: '2 Apr 2025' },
  { id: '4102', title: 'Account issue', sub: 'Unable to change email', status: 'Resolved', bg: '#DCEFE5', ink: '#2B7A52', date: '18 Mar 2025' },
  { id: '3977', title: 'Report issue', sub: 'PDF did not download', status: 'Closed', bg: '#ECE9F2', ink: Colors.slate, date: '5 Mar 2025' },
];

export default function Tickets() {
  return (
    <AppScreen tab="profile" header={<AppBar title="My Tickets" />} contentStyle={{ paddingTop: 6 }}>
      <View style={{ gap: 9 }}>
        {TICKETS.map(t => (
          <Card key={t.id} onPress={() => go(`/support/tickets/${t.id}`)} style={{ borderRadius: 14, padding: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: F.s, fontSize: 13, color: Colors.navy }}>{`#${t.id}  ·  ${t.title}`}</Text>
              <Pill bg={t.bg} color={t.ink}>{t.status}</Pill>
            </View>
            <Text style={{ fontFamily: F.r, fontSize: 11.5, color: Colors.ink, marginTop: 6 }}>{t.sub}</Text>
            <Text style={{ fontFamily: F.r, fontSize: 10, color: Colors.slate, marginTop: 4 }}>{t.date}</Text>
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}
