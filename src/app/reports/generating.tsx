import { useTheme } from '@/lib/theme-context';
import { useLocalSearchParams } from 'expo-router';
import { Check, Circle, Crosshair } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Progress, replace } from '@/components/ui';
import { Emblem, GoldStar } from '@/components/ui/icons';
import { Colors } from '@/constants/theme';

const steps = ['Calculating chart positions', 'Analysing planetary influences', 'Generating personalized insights'];

export default function GeneratingReport() {
  const { Colors: palette, themed } = useTheme();

  const { p } = useLocalSearchParams<{ p?: string }>();
  const fixed = p ? Number(p) : null;
  const [value, setValue] = useState(fixed ?? 8);

  useEffect(() => {
    if (fixed !== null) return;
    const id = setInterval(() => setValue(v => Math.min(100, v + 4)), 220);
    return () => clearInterval(id);
  }, [fixed]);

  useEffect(() => {
    if (value >= 100 && fixed === null) { const id = setTimeout(() => replace('/reports/preview'), 500); return () => clearTimeout(id); }
  }, [value, fixed]);

  const active = value < 40 ? 0 : value < 75 ? 1 : 2;
  return (
    <AppScreen header={<AppBar title="" />} scroll={false} pad={24}>
      <View style={{ position: 'absolute', top: 40, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
        <View style={{ position: 'absolute', left: '52%', top: 14 }}><GoldStar size={16} /></View>
        <View style={{ position: 'absolute', left: 30, top: 60 }}><GoldStar size={8} opacity={0.6} /></View>
        <View style={{ position: 'absolute', right: 24, top: 10 }}><GoldStar size={11} /></View>
        <View style={{ position: 'absolute', right: 46, top: 70 }}><GoldStar size={6} opacity={0.6} /></View>
        <View style={{ position: 'absolute', left: '44%', bottom: 26 }}><GoldStar size={22} /></View>
      </View>
      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <Emblem size={150} />
        <Text style={{ marginTop: 22, fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: palette.navy }}>Generating Your Report</Text>
        <Text style={{ marginTop: 10, textAlign: 'center', fontFamily: 'Poppins_400Regular', fontSize: 12.5, lineHeight: 20, color: palette.ink }}>{'Please wait while we calculate your\npersonalized astrology report.'}</Text>
      </View>
      <View style={{ marginTop: 40 }}>
        <Progress value={value} height={8} from="#2A2E8A" to="#4C4FB0" track="#DCD9EF" />
        <Text style={{ textAlign: 'center', marginTop: 10, fontFamily: 'Poppins_400Regular', fontSize: 11, color: palette.slate }}>{`${value}%`}</Text>
      </View>
      <View style={{ marginTop: 26, gap: 18, paddingHorizontal: 6 }}>
        {steps.map((s, i) => (
          <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            {i === active ? <Crosshair size={18} color={palette.navy} strokeWidth={1.8} /> : i < active ? <Check size={18} color={palette.navy} strokeWidth={2} /> : <Circle size={18} color={themed("#9C9EC0", 'foreground')} strokeWidth={1.6} />}
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12.5, color: themed(i <= active ? Colors.ink : Colors.slate, 'foreground') }}>{s}</Text>
          </View>
        ))}
      </View>
    </AppScreen>
  );
}
