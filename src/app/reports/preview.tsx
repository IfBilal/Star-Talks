import { useTheme } from '@/lib/theme-context';
import { Ellipsis, Sparkle } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, go, Segmented, useTypography } from '@/components/ui';
import { GoldStar, ZodiacWheel } from '@/components/ui/icons';
import { Colors } from '@/constants/theme';

const planets = [['Sun', 'Capricorn · 10th house'], ['Moon', 'Capricorn · 10th house'], ['Mercury', 'Sagittarius · 9th house'], ['Venus', 'Scorpio · 8th house'], ['Mars', 'Virgo · 6th house'], ['Jupiter', 'Scorpio · 8th house']];
const houses = [['1st House', 'Taurus · Self & identity'], ['2nd House', 'Gemini · Wealth & speech'], ['3rd House', 'Cancer · Courage & siblings'], ['4th House', 'Leo · Home & mother'], ['5th House', 'Virgo · Creativity & children'], ['6th House', 'Libra · Health & service']];

export default function ReportPreview() {
  const { Colors: palette, themed } = useTheme();
  const Type = useTypography();

  const [tab, setTab] = useState('Overview');
  return (
    <AppScreen
      header={<AppBar title="Birth Chart Report" align="center" right={<Sparkle size={14} color={palette.slate} />} />}
      footer={
        <View style={{ flexDirection: 'row', gap: 14, paddingHorizontal: 18, paddingBottom: 8 }}>
          <Button title="Download" height={46} style={{ flex: 1, borderRadius: 24 }} onPress={() => go('/payment')} />
          <Button title="Save" height={46} style={{ flex: 1, borderRadius: 24 }} onPress={() => go('/reports/ready')} />
        </View>
      }
      contentStyle={{ paddingTop: 2 }}
    >
      <View style={{ flexDirection: 'row', backgroundColor: themed('#F0ECF8', 'surface'), borderRadius: 18, padding: 3, marginBottom: 12 }}>
        {['Overview', 'Planets', 'Houses'].map(i => (
          <Pressable key={i} onPress={() => setTab(i)} style={{ flex: 1, height: 32, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: themed(tab === i ? Colors.primaryFrom : 'transparent', 'surface') }}>
            <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 12, color: themed(tab === i ? '#fff' : Colors.navy, 'foreground') }}>{i}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'Overview' ? (
        <>
          <Card style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 14, gap: 4 }}>
            <ZodiacWheel size={150} />
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ paddingVertical: 16, paddingHorizontal: 12, borderRadius: 10, backgroundColor: themed('#FFFDFB', 'surface') }}>
                <Text style={Type.rowSub}>Ascendant</Text>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: palette.ink }}>Taurus</Text>
              </View>
              <View style={{ paddingVertical: 16, paddingHorizontal: 12, borderRadius: 10, backgroundColor: themed('#FFFDFB', 'surface') }}>
                <Text style={Type.rowSub}>Moon Sign</Text>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: palette.ink }}>Capricorn</Text>
              </View>
            </View>
          </Card>
          <Card style={{ marginTop: 14, padding: 16, borderRadius: 14 }}>
            <Text style={[Type.h2, { fontSize: 15 }]}>Key Insights</Text>
            <View style={{ gap: 16, marginTop: 14 }}>
              {['Strong communication skills', 'Good career potential in creative fields', 'Emotional depth and intuition', 'Need for balance in personal life'].map(t => (
                <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <GoldStar size={11} color={themed("#5B5BC0", 'foreground')} />
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12.5, color: themed('#3B4373', 'foreground') }}>{t}</Text>
                </View>
              ))}
            </View>
          </Card>
        </>
      ) : (
        <Card style={{ borderRadius: 14 }}>
          {(tab === 'Planets' ? planets : houses).map(([a, b], i, arr) => (
            <View key={a} style={{ paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: themed('#EFEBF6', 'border') }}>
              <Text style={Type.rowTitle}>{a}</Text>
              <Text style={[Type.rowSub, { marginTop: 2 }]}>{b}</Text>
            </View>
          ))}
        </Card>
      )}
    </AppScreen>
  );
}
