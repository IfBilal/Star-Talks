import { useTheme } from '@/lib/theme-context';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, F, back } from '@/components/ui';

const currencies = [['INR (₹)', 'Indian Rupee'], ['USD ($)', 'US Dollar'], ['PKR (₨)', 'Pakistani Rupee'], ['EUR (€)', 'Euro'], ['GBP (£)', 'British Pound'], ['AED (د.إ)', 'UAE Dirham']];

export default function CurrencyPrefs() {
  const { Colors: palette, themed } = useTheme();

  const [sel, setSel] = useState('INR (₹)');
  return (
    <AppScreen header={<AppBar title="Currency Preferences" />} footer={<View style={{ paddingHorizontal: 16, paddingBottom: 10 }}><Button title="Save" height={50} style={{ borderRadius: 14 }} onPress={back} /></View>} contentStyle={{ paddingTop: 6 }}>
      <Card style={{ borderRadius: 14 }}>
        {currencies.map(([c, n], i) => (
          <Pressable key={c} accessibilityRole="radio" onPress={() => setSel(c)} style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderBottomWidth: i < currencies.length - 1 ? 1 : 0, borderBottomColor: themed('#EFEBF6', 'border') }}>
            <View style={{ flex: 1 }}><Text style={{ fontFamily: F.s, fontSize: 12.5, color: palette.navy }}>{c}</Text><Text style={{ fontFamily: F.r, fontSize: 10.5, color: palette.slate }}>{n}</Text></View>
            <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.4, borderColor: themed(sel === c ? '#4B4FAE' : '#CFCBE2', 'border'), backgroundColor: themed(sel === c ? '#4B4FAE' : 'transparent', 'surface'), alignItems: 'center', justifyContent: 'center' }}>{sel === c ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: themed('#fff', 'surface') }} /> : null}</View>
          </Pressable>
        ))}
      </Card>
    </AppScreen>
  );
}
