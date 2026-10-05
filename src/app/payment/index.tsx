import { useTheme } from '@/lib/theme-context';
import { Lock, ScanLine, TicketPercent } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, F, go, replace } from '@/components/ui';
import { CourseThumb } from '@/components/ui/art';

const methods = [
  { id: 'upi', name: 'UPI', sub: '(Google Pay, PhonePe, Paytm)' },
  { id: 'card', name: 'Cards', sub: '(Visa, MasterCard, RuPay)' },
  { id: 'wallet', name: 'Wallet', sub: '(Paytm, Amazon Pay)' },
  { id: 'bank', name: 'Net Banking', sub: '' },
];

export default function Payment() {
  const { Colors: palette, themed } = useTheme();

  const [method, setMethod] = useState('upi');
  const [coupon, setCoupon] = useState('');
  return (
    <AppScreen
      header={<AppBar title="Payment" right={<ScanLine size={20} color={palette.navy} />} />}
      footer={
        <View style={{ backgroundColor: themed('#FBF6F1', 'surface'), paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderTopWidth: 1, borderTopColor: themed('#EFEAF2', 'border') }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: F.s, fontSize: 14, color: palette.ink }}>Total Amount</Text>
            <Text style={{ fontFamily: F.b, fontSize: 18, color: palette.navy }}>₹4,999</Text>
          </View>
          <Button title="Proceed to Pay" height={52} style={{ borderRadius: 14 }} icon={<Lock size={16} color={themed("#fff", 'foreground')} />} onPress={() => replace('/payment/success')} />
        </View>
      }
      contentStyle={{ paddingTop: 2 }}
    >
      <Card style={{ padding: 14, borderRadius: 14 }}>
        <Text style={{ fontFamily: F.s, fontSize: 14.5, color: palette.navy }}>Order Summary</Text>
      </Card>
      <Card style={{ marginTop: 8, padding: 10, flexDirection: 'row', gap: 14, borderRadius: 14 }}>
        <CourseThumb size={92} radius={10} />
        <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 4 }}>
          <View>
            <Text style={{ fontFamily: F.s, fontSize: 13.5, color: palette.navy }}>Vedic Astrology Foundation</Text>
            <Text style={{ fontFamily: F.r, fontSize: 11, color: palette.slate, marginTop: 4 }}>6 Modules  •  12 hrs</Text>
          </View>
          <Text style={{ fontFamily: F.b, fontSize: 15, color: palette.navy }}>₹4,999</Text>
        </View>
      </Card>

      <Card style={{ marginTop: 12, padding: 14, borderRadius: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><TicketPercent size={18} color={palette.navy} /><Text style={{ fontFamily: F.s, fontSize: 12.5, color: palette.navy }}>Apply Coupon</Text></View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <View style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: themed('#E3DEEE', 'border'), backgroundColor: themed('#fff', 'surface'), paddingHorizontal: 12, justifyContent: 'center' }}>
            <TextInput selectionColor={palette.lavender} value={coupon} onChangeText={setCoupon} placeholder="Enter coupon code" placeholderTextColor={themed("#9AA0B8", 'foreground')} autoCapitalize="characters" style={{ fontFamily: F.r, fontSize: 12, color: palette.ink, paddingVertical: 0 }} />
          </View>
          <Pressable accessibilityRole="button" onPress={() => go('/offers')} style={{ width: 82, height: 44, borderRadius: 10, backgroundColor: themed('#6B63C2', 'surface'), alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: F.m, fontSize: 12.5, color: themed('#fff', 'foreground') }}>Apply</Text></Pressable>
        </View>
      </Card>

      <Card style={{ marginTop: 12, padding: 14, borderRadius: 14 }}>
        <Text style={{ fontFamily: F.s, fontSize: 14, color: palette.navy, marginBottom: 10 }}>Payment Method</Text>
        <View style={{ gap: 8 }}>
          {methods.map(m => (
            <Pressable key={m.id} accessibilityRole="radio" onPress={() => setMethod(m.id)} style={{ height: 52, borderRadius: 12, borderWidth: 1, borderColor: themed(method === m.id ? '#C9C3EA' : '#EEE8F3', 'border'), backgroundColor: themed('#FFFDFB', 'surface'), flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 12 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.4, borderColor: themed('#C9B3E8', 'border'), alignItems: 'center', justifyContent: 'center' }}>{m.id === 'upi' ? <Text style={{ fontFamily: F.b, fontSize: 11, color: themed('#E5663A', 'foreground') }}>▶</Text> : null}</View>
              <Text style={{ flex: 1, fontFamily: F.s, fontSize: 12, color: palette.navy }}>{m.name}<Text style={{ fontFamily: F.r, fontSize: 10.5, color: palette.slate }}>{m.sub ? `  ${m.sub}` : ''}</Text></Text>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.4, borderColor: themed(method === m.id ? '#3A4FB8' : 'transparent', 'border'), backgroundColor: themed(method === m.id ? '#3A4FB8' : 'transparent', 'surface'), alignItems: 'center', justifyContent: 'center' }}>{method === m.id ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: themed('#fff', 'surface') }} /> : null}</View>
            </Pressable>
          ))}
        </View>
      </Card>
    </AppScreen>
  );
}
