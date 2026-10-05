import { useTheme } from '@/lib/theme-context';
import { Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, F, go, Pill } from '@/components/ui';
import { Colors } from '@/constants/theme';

const packs = [
  { id: 'p5', credits: 5, price: '₹49', note: '' },
  { id: 'p20', credits: 20, price: '₹199', note: 'Most popular' },
  { id: 'p50', credits: 50, price: '₹449', note: 'Save 10%' },
  { id: 'p100', credits: 100, price: '₹799', note: 'Best value' },
];

export default function BuyCredits() {
  const { Colors: palette, themed } = useTheme();

  const [sel, setSel] = useState('p20');
  return (
    <AppScreen
      header={<AppBar title="Buy AI Credits" />}
      footer={<View style={{ paddingHorizontal: 16, paddingBottom: 10 }}><Button title="Continue" height={50} style={{ borderRadius: 14 }} onPress={() => go('/payment')} /></View>}
    >
      <Text style={{ fontFamily: F.r, fontSize: 12, lineHeight: 18, color: palette.slate, marginBottom: 14 }}>1 submitted question uses 1 AI credit. Credits never expire and are only used when an answer is delivered.</Text>
      <View style={{ gap: 10 }}>
        {packs.map(p => (
          <Card key={p.id} onPress={() => setSel(p.id)} style={{ borderRadius: 14, borderColor: themed(sel === p.id ? Colors.primaryFrom : Colors.cardBorder, 'border') }}>
            <View style={{ minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: palette.tile, alignItems: 'center', justifyContent: 'center' }}><Sparkles size={18} color={palette.navy} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.s, fontSize: 13.5, color: palette.navy }}>{`${p.credits} AI credits`}</Text>
                {p.note ? <Pill style={{ marginTop: 4 }} bg={themed("#F6E3B8", 'surface')} color={themed("#7A5410", 'foreground')}>{p.note}</Pill> : null}
              </View>
              <Text style={{ fontFamily: F.b, fontSize: 14, color: palette.navy }}>{p.price}</Text>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: themed(sel === p.id ? Colors.primaryFrom : '#CFCBE2', 'border'), alignItems: 'center', justifyContent: 'center' }}>{sel === p.id ? <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: palette.primaryFrom }} /> : null}</View>
            </View>
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}
