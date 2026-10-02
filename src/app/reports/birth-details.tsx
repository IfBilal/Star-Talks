import { CalendarDays, Clock3, MapPin, Sparkle, Ellipsis } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Button, DotProgress, go, OutlineField, Type } from '@/components/ui';
import { Colors } from '@/constants/theme';

export default function ReportBirthDetails() {
  const [date, setDate] = useState('12 Mar 1995');
  const [time, setTime] = useState('10:30 AM');
  const [place, setPlace] = useState('New Delhi, India');
  return (
    <AppScreen
      header={<AppBar title="Birth Details" align="center" right={<View style={{ flexDirection: 'row', gap: 12 }}><Sparkle size={14} color={Colors.slate} /><Ellipsis size={16} color={Colors.slate} /></View>} />}
      footer={<View style={{ paddingHorizontal: 16, paddingBottom: 6 }}><Button title="Continue" height={50} style={{ borderRadius: 26 }} onPress={() => go('/reports/select')} /></View>}
      contentStyle={{ paddingTop: 2 }}
    >
      <DotProgress count={5} current={0} />
      <Text style={[Type.h2, { textAlign: 'center', fontSize: 16, marginTop: 16 }]}>Enter Your Birth Details</Text>
      <Text style={[Type.body, { textAlign: 'center', color: Colors.slate, marginTop: 6, marginBottom: 22 }]}>{'Accurate details help us create a personalized\nand precise report.'}</Text>
      <OutlineField label="Date of Birth" value={date} onChangeText={setDate} right={<CalendarDays size={18} color={Colors.navy} />} />
      <OutlineField label="Time of Birth" value={time} onChangeText={setTime} right={<Clock3 size={18} color={Colors.navy} />} />
      <OutlineField label="Place of Birth" value={place} onChangeText={setPlace} right={<MapPin size={18} color={Colors.navy} />} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 22, paddingHorizontal: 4 }}>
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#F4B544', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 14 }}>!</Text></View>
        <View>
          <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 12, color: Colors.ink }}>Not sure about time?</Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 10.5, color: Colors.slate }}>You can still get a general reading.</Text>
        </View>
      </View>
    </AppScreen>
  );
}
