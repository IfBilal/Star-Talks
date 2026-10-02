import { Laptop, Smartphone } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, F, IconTile, Pill } from '@/components/ui';
import { Colors } from '@/constants/theme';

const devices = [
  { name: 'This device · Android phone', sub: 'Lahore, Pakistan · Active now', current: true, icon: <Smartphone size={19} color={Colors.navy} /> },
  { name: 'Chrome on Windows', sub: 'Delhi, India · 2 days ago', icon: <Laptop size={19} color={Colors.navy} /> },
  { name: 'Android tablet', sub: 'Mumbai, India · 12 Mar 2025', icon: <Smartphone size={19} color={Colors.navy} /> },
];

export default function Devices() {
  return (
    <AppScreen header={<AppBar title="Login & Devices" />} contentStyle={{ paddingTop: 6 }}>
      <View style={{ gap: 9 }}>
        {devices.map(d => (
          <Card key={d.name} style={{ borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <IconTile icon={d.icon} />
            <View style={{ flex: 1 }}><Text style={{ fontFamily: F.s, fontSize: 12.5, color: Colors.navy }}>{d.name}</Text><Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate, marginTop: 2 }}>{d.sub}</Text></View>
            {d.current ? <Pill bg="#DCEFE5" color="#2B7A52">Current</Pill> : <Text style={{ fontFamily: F.m, fontSize: 11, color: Colors.danger }}>Sign out</Text>}
          </Card>
        ))}
      </View>
      <Button title="Sign out of all other devices" variant="danger" height={48} style={{ borderRadius: 14, marginTop: 20 }} onPress={() => {}} />
    </AppScreen>
  );
}
