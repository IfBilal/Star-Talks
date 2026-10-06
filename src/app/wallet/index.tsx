import { useTheme } from '@/lib/theme-context';
import { useLocalSearchParams } from 'expo-router';
import { Clapperboard, Coins, Wallet } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, F, go, Segmented } from '@/components/ui';
import { CREDIT_ACTIVITY, TRANSACTIONS } from '@/features/uiData/wallet';
import { Colors } from '@/constants/theme';

function Dots({ done, total = 5 }: { done: number; total?: number }) {
  const { themed } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ width: 19, height: 19, borderRadius: 10, borderWidth: 1.5, borderColor: themed(i < done ? '#5B54B5' : '#E58A9A', 'border'), backgroundColor: themed(i < done ? '#6A63C8' : '#fff', 'surface') }} />
      ))}
    </View>
  );
}

export default function WalletScreen() {
  const { Colors: palette, themed } = useTheme();

  const { tab: initial } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState(initial === 'Transactions' ? 'Transactions' : 'Credit History');
  return (
    <AppScreen tab="home" header={<AppBar title="Wallet & AI Credits" />} contentStyle={{ paddingTop: 4 }}>
      <Card style={{ padding: 14, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: themed('#EAE3F7', 'surface'), alignItems: 'center', justifyContent: 'center' }}><Wallet size={22} color={palette.navy} strokeWidth={1.7} /></View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.r, fontSize: 11.5, color: palette.navy }}>Wallet Balance</Text>
          <Text style={{ fontFamily: F.s, fontSize: 22, color: palette.ink, marginTop: 1 }}>₹2,450</Text>
        </View>
        <Button title="Add Money" height={38} style={{ width: 100, borderRadius: 12 }} textStyle={{ fontSize: 12 }} onPress={() => go('/wallet/add-money')} />
      </Card>
      <Card style={{ padding: 14, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 }}>
        <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: themed('#CDEBD7', 'surface'), alignItems: 'center', justifyContent: 'center' }}><Coins size={22} color={themed("#2B7A52", 'foreground')} strokeWidth={1.7} /></View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.r, fontSize: 11.5, color: palette.navy }}>AI Credits</Text>
          <Text style={{ fontFamily: F.s, fontSize: 22, color: palette.ink, marginTop: 1 }}>8 credits</Text>
        </View>
        <Button title="Buy Credits" height={38} style={{ width: 100, borderRadius: 12 }} textStyle={{ fontSize: 12 }} onPress={() => go('/wallet/buy-credits')} />
      </Card>

      <View style={{ marginTop: 14 }}><Segmented items={['Credit History', 'Transactions']} value={tab} onChange={setTab} /></View>

      {tab === 'Credit History' ? (
        <>
          <Card style={{ marginTop: 14, padding: 14, borderRadius: 16, flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 48, alignItems: 'center', paddingTop: 2 }}><Clapperboard size={40} color={themed("#5B54B5", 'foreground')} strokeWidth={1.5} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.s, fontSize: 14.5, color: palette.navy }}>Watch Ads & Earn Credits</Text>
              <Text style={{ fontFamily: F.r, fontSize: 11, color: themed('#3D57B5', 'foreground'), marginTop: 2 }}>Watch 5 ads daily and get 5 free AI credits!</Text>
              <Text style={{ fontFamily: F.s, fontSize: 13, color: palette.navy, marginTop: 14 }}>3/5 ads watched</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <Dots done={3} />
              </View>
              <View style={{ alignSelf: 'flex-end', marginTop: -26, marginRight: 0, height: 26, paddingHorizontal: 10, borderRadius: 13, backgroundColor: themed('#F0ECF8', 'surface'), justifyContent: 'center' }}><Text style={{ fontFamily: F.m, fontSize: 10.5, color: palette.navy }}>2 credits left</Text></View>
              <Button title="Watch Ad" height={46} style={{ borderRadius: 12, marginTop: 20 }} onPress={() => go('/earn-credits')} />
            </View>
          </Card>
          <Text style={{ fontFamily: F.s, fontSize: 13.5, color: palette.navy, marginTop: 18, marginBottom: 8 }}>Recent credit activity</Text>
          <Card style={{ borderRadius: 14 }}>
            {CREDIT_ACTIVITY.map((t, i) => (
              <View key={t.title + i} style={{ minHeight: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderBottomWidth: i < CREDIT_ACTIVITY.length - 1 ? 1 : 0, borderBottomColor: themed('#EFEBF6', 'border') }}>
                <View style={{ flex: 1 }}><Text style={{ fontFamily: F.m, fontSize: 12, color: palette.navy }}>{t.title}</Text><Text style={{ fontFamily: F.r, fontSize: 10, color: palette.slate, marginTop: 1 }}>{t.date}</Text></View>
                <Text style={{ fontFamily: F.s, fontSize: 12, color: themed(t.kind === 'in' ? Colors.success : Colors.ink, 'foreground') }}>{t.amount}</Text>
              </View>
            ))}
          </Card>
        </>
      ) : (
        <Card style={{ marginTop: 14, borderRadius: 14 }}>
          {TRANSACTIONS.map((t, i) => (
            <View key={t.title + i} style={{ minHeight: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderBottomWidth: i < TRANSACTIONS.length - 1 ? 1 : 0, borderBottomColor: themed('#EFEBF6', 'border') }}>
              <View style={{ flex: 1 }}><Text style={{ fontFamily: F.m, fontSize: 12, color: palette.navy }}>{t.title}</Text><Text style={{ fontFamily: F.r, fontSize: 10, color: palette.slate, marginTop: 1 }}>{t.date}</Text></View>
              <Text style={{ fontFamily: F.s, fontSize: 12.5, color: themed(t.kind === 'in' ? Colors.success : Colors.ink, 'foreground') }}>{t.amount}</Text>
            </View>
          ))}
        </Card>
      )}
    </AppScreen>
  );
}
