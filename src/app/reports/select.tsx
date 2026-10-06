import { useTheme } from '@/lib/theme-context';
import { BriefcaseBusiness, CircleUserRound, Ellipsis, FileText, Heart, Orbit, Sparkle } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, go, IconTile, useTypography } from '@/components/ui';
import { Colors } from '@/constants/theme';

const items = [
  { id: 'birth', icon: <Orbit size={19} color={Colors.navy} strokeWidth={1.6} />, title: 'Birth Chart Report', sub: 'Cosmic blueprint', price: '₹799' },
  { id: 'career', icon: <BriefcaseBusiness size={19} color={Colors.navy} strokeWidth={1.6} />, title: 'Career Report', sub: 'Career path & growth', price: '₹699' },
  { id: 'love', icon: <Heart size={19} color="#C2416C" strokeWidth={1.7} />, title: 'Love & Marriage Report', sub: 'Romance & compatibility', price: '₹699', bg: '#FCE3EA' },
  { id: 'finance', icon: <FileText size={19} color={Colors.navy} strokeWidth={1.6} />, title: 'Finance Report', sub: 'Wealth & finances', price: '₹699' },
  { id: 'personality', icon: <CircleUserRound size={19} color="#6A4FA6" strokeWidth={1.6} />, title: 'Personality Report', sub: 'Know your true self', price: '₹599' },
];

export default function SelectReport() {
  const { Colors: palette, themed } = useTheme();
  const Type = useTypography();

  const [sel, setSel] = useState('birth');
  return (
    <AppScreen
      header={<AppBar title="Select Report" right={<View style={{ flexDirection: 'row', gap: 12 }}><Sparkle size={14} color={palette.slate} /><Ellipsis size={16} color={palette.slate} /></View>} />}
      footer={<View style={{ paddingHorizontal: 16, paddingBottom: 6 }}><Button title="Generate Report" height={50} style={{ borderRadius: 26 }} onPress={() => go('/reports/generating')} /><Text style={[Type.caption, { textAlign: 'center', marginTop: 10, fontSize: 11, color: palette.slate }]}>Free preview available for some reports</Text></View>}
      contentStyle={{ paddingTop: 4 }}
    >
      <View style={{ gap: 10 }}>
        {items.map(i => (
          <Card key={i.id} onPress={() => setSel(i.id)} style={{ borderRadius: 14, borderColor: themed(sel === i.id ? Colors.primaryFrom : Colors.cardBorder, 'border') }}>
            <View style={{ minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14 }}>
              <IconTile icon={i.icon} bg={themed(i.bg ?? '#EFEAF9', 'surface')} radius={11} />
              <View style={{ flex: 1 }}>
                <Text style={Type.rowTitle}>{i.title}</Text>
                <Text style={[Type.rowSub, { marginTop: 2 }]}>{i.sub}</Text>
              </View>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: palette.navy }}>{i.price}</Text>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: themed(sel === i.id ? Colors.primaryFrom : '#CFCBE2', 'border'), alignItems: 'center', justifyContent: 'center' }}>
                {sel === i.id ? <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: palette.primaryFrom }} /> : null}
              </View>
            </View>
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}
