import { Check } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, F, replace } from '@/components/ui';
import { GoldStar } from '@/components/ui/icons';
import { Colors } from '@/constants/theme';

export default function PaymentSuccess() {
  return (
    <AppScreen header={<AppBar title="" onBack={() => replace('/home')} />} pad={22}>
      <View style={{ position: 'absolute', top: 30, left: 0, right: 0 }} pointerEvents="none">
        <View style={{ position: 'absolute', left: 40, top: 40 }}><GoldStar size={10} opacity={0.7} /></View>
        <View style={{ position: 'absolute', right: 36, top: 10 }}><GoldStar size={14} /></View>
        <View style={{ position: 'absolute', right: 60, top: 120 }}><GoldStar size={8} opacity={0.6} /></View>
      </View>
      <View style={{ alignItems: 'center', marginTop: 34 }}>
        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#ECE6F8', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#3A3C9C', alignItems: 'center', justifyContent: 'center' }}><Check size={36} color="#fff" strokeWidth={3} /></View>
        </View>
        <Text style={{ marginTop: 22, fontFamily: F.s, fontSize: 19, color: Colors.navy }}>Payment Successful</Text>
        <Text style={{ marginTop: 8, textAlign: 'center', fontFamily: F.r, fontSize: 12, lineHeight: 19, color: Colors.slate }}>{'Thank you! Your payment has been received\nand your purchase is now unlocked.'}</Text>
      </View>
      <Card style={{ marginTop: 26, padding: 16, borderRadius: 14, gap: 11 }}>
        {[['Item', 'Vedic Astrology Foundation'], ['Amount paid', '₹4,999'], ['Payment method', 'UPI'], ['Transaction ID', '#STK48213907'], ['Status', 'Completed']].map(([a, b]) => (
          <View key={a} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: F.r, fontSize: 11.5, color: Colors.slate }}>{a}</Text>
            <Text style={{ fontFamily: F.m, fontSize: 11.5, color: a === 'Status' ? Colors.success : Colors.ink }}>{b}</Text>
          </View>
        ))}
      </Card>
      <Button title="Start Learning" height={50} style={{ borderRadius: 14, marginTop: 22 }} onPress={() => replace('/courses/vedic-foundation/lesson')} />
      <Button title="View Transactions" variant="light" height={46} style={{ borderRadius: 14, marginTop: 10 }} onPress={() => replace('/wallet')} />
    </AppScreen>
  );
}
