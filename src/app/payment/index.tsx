import { Lock, ScanLine, TicketPercent } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, F, go, replace } from '@/components/ui';
import { CourseThumb } from '@/components/ui/art';
import { Colors } from '@/constants/theme';

const methods = [
  { id: 'upi', name: 'UPI', sub: '(Google Pay, PhonePe, Paytm)' },
  { id: 'card', name: 'Cards', sub: '(Visa, MasterCard, RuPay)' },
  { id: 'wallet', name: 'Wallet', sub: '(Paytm, Amazon Pay)' },
  { id: 'bank', name: 'Net Banking', sub: '' },
];

export default function Payment() {
  const [method, setMethod] = useState('upi');
  const [coupon, setCoupon] = useState('');
  return (
    <AppScreen
      header={<AppBar title="Payment" right={<ScanLine size={20} color={Colors.navy} />} />}
      footer={
        <View style={{ backgroundColor: '#FBF6F1', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderTopWidth: 1, borderTopColor: '#EFEAF2' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: F.s, fontSize: 14, color: Colors.ink }}>Total Amount</Text>
            <Text style={{ fontFamily: F.b, fontSize: 18, color: Colors.navy }}>₹4,999</Text>
          </View>
          <Button title="Proceed to Pay" height={52} style={{ borderRadius: 14 }} icon={<Lock size={16} color="#fff" />} onPress={() => replace('/payment/success')} />
        </View>
      }
      contentStyle={{ paddingTop: 2 }}
    >
      <Card style={{ padding: 14, borderRadius: 14 }}>
        <Text style={{ fontFamily: F.s, fontSize: 14.5, color: Colors.navy }}>Order Summary</Text>
      </Card>
      <Card style={{ marginTop: 8, padding: 10, flexDirection: 'row', gap: 14, borderRadius: 14 }}>
        <CourseThumb size={92} radius={10} />
        <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 4 }}>
          <View>
            <Text style={{ fontFamily: F.s, fontSize: 13.5, color: Colors.navy }}>Vedic Astrology Foundation</Text>
            <Text style={{ fontFamily: F.r, fontSize: 11, color: Colors.slate, marginTop: 4 }}>6 Modules  •  12 hrs</Text>
          </View>
          <Text style={{ fontFamily: F.b, fontSize: 15, color: Colors.navy }}>₹4,999</Text>
        </View>
      </Card>

      <Card style={{ marginTop: 12, padding: 14, borderRadius: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><TicketPercent size={18} color={Colors.navy} /><Text style={{ fontFamily: F.s, fontSize: 12.5, color: Colors.navy }}>Apply Coupon</Text></View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <View style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#E3DEEE', backgroundColor: '#fff', paddingHorizontal: 12, justifyContent: 'center' }}>
            <TextInput value={coupon} onChangeText={setCoupon} placeholder="Enter coupon code" placeholderTextColor="#9AA0B8" autoCapitalize="characters" style={{ fontFamily: F.r, fontSize: 12, color: Colors.ink, paddingVertical: 0 }} />
          </View>
          <Pressable accessibilityRole="button" onPress={() => go('/offers')} style={{ width: 82, height: 44, borderRadius: 10, backgroundColor: '#6B63C2', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: F.m, fontSize: 12.5, color: '#fff' }}>Apply</Text></Pressable>
        </View>
      </Card>

      <Card style={{ marginTop: 12, padding: 14, borderRadius: 14 }}>
        <Text style={{ fontFamily: F.s, fontSize: 14, color: Colors.navy, marginBottom: 10 }}>Payment Method</Text>
        <View style={{ gap: 8 }}>
          {methods.map(m => (
            <Pressable key={m.id} accessibilityRole="radio" onPress={() => setMethod(m.id)} style={{ height: 52, borderRadius: 12, borderWidth: 1, borderColor: method === m.id ? '#C9C3EA' : '#EEE8F3', backgroundColor: '#FFFDFB', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 12 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.4, borderColor: '#C9B3E8', alignItems: 'center', justifyContent: 'center' }}>{m.id === 'upi' ? <Text style={{ fontFamily: F.b, fontSize: 11, color: '#E5663A' }}>▶</Text> : null}</View>
              <Text style={{ flex: 1, fontFamily: F.s, fontSize: 12, color: Colors.navy }}>{m.name}<Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate }}>{m.sub ? `  ${m.sub}` : ''}</Text></Text>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.4, borderColor: method === m.id ? '#3A4FB8' : 'transparent', backgroundColor: method === m.id ? '#3A4FB8' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{method === m.id ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} /> : null}</View>
            </Pressable>
          ))}
        </View>
      </Card>
    </AppScreen>
  );
}
