import { BriefcaseBusiness, CircleUserRound, Ellipsis, FileText, Heart, Orbit, Sparkle } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, Card, go, IconTile, Segmented, Type } from '@/components/ui';
import { Colors } from '@/constants/theme';

const all = [
  { icon: <Orbit size={19} color="#5B3B8C" strokeWidth={1.6} />, title: 'Birth Chart Report', date: '12 Mar 2025', saved: true },
  { icon: <BriefcaseBusiness size={19} color={Colors.navy} strokeWidth={1.6} />, title: 'Career Report', date: '10 Mar 2025', saved: false },
  { icon: <Heart size={19} color="#C2416C" strokeWidth={1.7} />, title: 'Love & Marriage Report', date: '5 Mar 2025', saved: true, bg: '#FCE3EA' },
  { icon: <FileText size={19} color={Colors.navy} strokeWidth={1.6} />, title: 'Finance Report', date: '28 Feb 2025', saved: false },
  { icon: <CircleUserRound size={19} color="#B0384E" strokeWidth={1.6} />, title: 'Personality Report', date: '20 Feb 2025', saved: false },
];

export default function ReportHistory() {
  const [tab, setTab] = useState('All Reports');
  const list = tab === 'Saved' ? all.filter(r => r.saved) : all;
  return (
    <AppScreen tab="reports" header={<AppBar title="Report History" right={<View style={{ flexDirection: 'row', gap: 12 }}><Sparkle size={14} color={Colors.slate} /><Ellipsis size={16} color={Colors.slate} /></View>} />} contentStyle={{ paddingTop: 6 }}>
      <View style={{ flexDirection: 'row', backgroundColor: '#F2EEF8', borderRadius: 14, padding: 3, marginBottom: 14 }}>
        {['All Reports', 'Saved'].map(i => (
          <Pressable key={i} onPress={() => setTab(i)} style={{ flex: 1, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: tab === i ? Colors.primaryFrom : 'transparent' }}>
            <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 12.5, color: tab === i ? '#fff' : Colors.navy }}>{i}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ gap: 9 }}>
        {list.map(r => (
          <Card key={r.title} style={{ borderRadius: 14 }}>
            <View style={{ minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14 }}>
              <IconTile icon={r.icon} bg={r.bg ?? '#F1ECFA'} radius={11} />
              <View style={{ flex: 1 }}>
                <Text style={Type.rowTitle}>{r.title}</Text>
                <Text style={[Type.rowSub, { marginTop: 3, fontSize: 10.5 }]}>{`${r.date}  •  PDF`}</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => go('/reports/ready')} style={{ height: 34, paddingHorizontal: 20, borderRadius: 17, backgroundColor: '#F6EFEA', justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 12, color: Colors.navy }}>View</Text>
              </Pressable>
            </View>
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}
