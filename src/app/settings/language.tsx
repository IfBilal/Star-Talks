import { useTheme } from '@/lib/theme-context';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, F, useTypography, back } from '@/components/ui';
import i18n, { setAppLanguage } from '@/lib/i18n';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/i18n/languages';

function Select({ label, value }: { label: string; value: string }) {
  const { Colors: palette, themed } = useTheme();
  const Type = useTypography();

  return (
    <View style={{ marginTop: 14 }}>
      <Text style={[Type.section, { marginBottom: 8 }]}>{label}</Text>
      <View style={{ height: 46, borderRadius: 10, borderWidth: 1, borderColor: themed('#E6E1EF', 'border'), backgroundColor: themed('#fff', 'surface'), paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: F.r, fontSize: 12, color: palette.ink }}>{value}</Text>
        <ChevronDown size={16} color={palette.navy} />
      </View>
    </View>
  );
}

export default function LanguageRegion() {
  const { Colors: palette, themed } = useTheme();
  const Type = useTypography();

  const [lang, setLang] = useState<LanguageCode>((i18n.language as LanguageCode) ?? 'en');
  return (
    <AppScreen header={<AppBar brand menu />} contentStyle={{ paddingTop: 10 }}>
      <Text style={[Type.h1, { fontSize: 20 }]}>Language & Region</Text>
      <Text style={{ fontFamily: F.r, fontSize: 11.5, color: palette.navy, marginTop: 3, marginBottom: 16 }}>We&apos;ve detected your location. You can change it anytime.</Text>
      <Card style={{ padding: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: themed('#F1ECFA', 'surface'), alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 26 }}>🇮🇳</Text></View>
        <View style={{ flex: 1 }}><Text style={{ fontFamily: F.s, fontSize: 14, color: palette.navy }}>India</Text><Text style={{ fontFamily: F.r, fontSize: 11, color: palette.slate }}>+91</Text></View>
        <ChevronRight size={18} color={palette.navy} />
      </Card>
      <Text style={[Type.section, { marginTop: 18, marginBottom: 8, fontSize: 14 }]}>Select Language</Text>
      <Card style={{ borderRadius: 14, overflow: 'hidden' }}>
        {SUPPORTED_LANGUAGES.map((l, i) => {
          const on = lang === l.code;
          return (
            <Pressable key={l.code} accessibilityRole="radio" onPress={() => setLang(l.code)} style={{ height: 50, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, backgroundColor: themed(on ? '#EEE9FA' : 'transparent', 'surface'), borderBottomWidth: i < SUPPORTED_LANGUAGES.length - 1 ? 1 : 0, borderBottomColor: themed('#EFEBF6', 'border') }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.4, borderColor: themed('#C9B3E8', 'border'), alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 11 }}>{l.flag}</Text></View>
              <Text style={{ flex: 1, fontFamily: F.m, fontSize: 12.5, color: palette.navy }}>{l.label}</Text>
              <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.4, borderColor: themed(on ? '#4B4FAE' : '#CFCBE2', 'border'), backgroundColor: themed(on ? '#4B4FAE' : 'transparent', 'surface'), alignItems: 'center', justifyContent: 'center' }}>{on ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: themed('#fff', 'surface') }} /> : null}</View>
            </Pressable>
          );
        })}
      </Card>
      <Select label="Currency" value="INR (₹)" />
      <Select label="Time Zone" value="(GMT+5:30) Asia/Kolkata" />
      <Button title="Save & Continue" height={50} style={{ borderRadius: 14, marginTop: 22 }} onPress={async () => { const restart = await setAppLanguage(lang); if (restart) Alert.alert('Restart needed', 'Close and reopen the app to apply the new text direction.'); back(); }} />
    </AppScreen>
  );
}
