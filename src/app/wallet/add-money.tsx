import { useState } from 'react';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, Chip, F, go } from '@/components/ui';
import { Colors } from '@/constants/theme';

export default function AddMoney() {
  const [amount, setAmount] = useState('1,000');
  const quick = ['500', '1,000', '2,000', '5,000'];
  return (
    <AppScreen
      header={<AppBar title="Add Money" />}
      footer={<View style={{ paddingHorizontal: 16, paddingBottom: 10 }}><Button title="Proceed to Pay" height={50} style={{ borderRadius: 14 }} onPress={() => go('/payment')} /></View>}
    >
      <Card style={{ padding: 16, borderRadius: 16 }}>
        <Text style={{ fontFamily: F.r, fontSize: 11.5, color: Colors.slate }}>Current balance</Text>
        <Text style={{ fontFamily: F.s, fontSize: 22, color: Colors.ink, marginTop: 2 }}>₹2,450</Text>
      </Card>
      <Text style={{ fontFamily: F.s, fontSize: 13.5, color: Colors.navy, marginTop: 20, marginBottom: 8 }}>Enter amount</Text>
      <View style={{ height: 64, borderRadius: 14, borderWidth: 1, borderColor: '#D9D4EA', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 6 }}>
        <Text style={{ fontFamily: F.s, fontSize: 24, color: Colors.navy }}>₹</Text>
        <Text style={{ fontFamily: F.s, fontSize: 26, color: Colors.ink }}>{amount}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        {quick.map(q => <Chip key={q} label={`₹${q}`} on={amount === q} onPress={() => setAmount(q)} />)}
      </View>
      <Text style={{ fontFamily: F.r, fontSize: 11, lineHeight: 17, color: Colors.slate, marginTop: 20 }}>Money added to your wallet can be used for reports, courses and AI credit packs. Refunds are returned to your wallet.</Text>
    </AppScreen>
  );
}
