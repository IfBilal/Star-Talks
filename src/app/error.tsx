import { Brain, CreditCard, Headset, PlayCircle, Settings, ShieldCheck, WifiOff, CircleCheck } from 'lucide-react-native';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppBar, AppScreen, Button, Card, F, go } from '@/components/ui';
import { GoldStar } from '@/components/ui/icons';
import { Colors } from '@/constants/theme';

const tiles = [
  { icon: <CreditCard size={28} color={Colors.navy} strokeWidth={1.5} />, title: 'Payment Failed', sub: 'Your payment could not be processed.', action: 'Try Again', href: '/payment' },
  { icon: <Brain size={28} color={Colors.navy} strokeWidth={1.5} />, title: 'AI Response Failed', sub: "We couldn't generate a response right now.", action: 'Try Again', href: '/ai' },
  { icon: <Settings size={28} color={Colors.navy} strokeWidth={1.5} />, title: 'Calculation Error', sub: "We couldn't complete the astrology calculation.", action: 'Try Again', href: '/reports/generating' },
  { icon: <PlayCircle size={28} color={Colors.navy} strokeWidth={1.5} />, title: 'Ad Not Available', sub: 'Unable to load advertisement.', action: 'Try Again', href: '/earn-credits' },
];

export default function ErrorStates() {
  return (
    <AppScreen tab="profile" header={<AppBar title="" />} contentStyle={{ paddingTop: 0 }}>
      <View style={{ position: 'absolute', right: 18, top: -6 }}>
        <Svg width={84} height={64} viewBox="0 0 84 64"><Circle cx="52" cy="26" r="24" fill="#8F86D8" /><Circle cx="42" cy="24" r="1.6" fill="#3A3A8A" /><Circle cx="56" cy="24" r="1.6" fill="#3A3A8A" /></Svg>
        <View style={{ position: 'absolute', left: -8, top: 4 }}><GoldStar size={12} /></View>
      </View>
      <Text style={{ fontFamily: F.serif, fontSize: 20, color: Colors.navy, width: '75%' }}>Hmm... Something Went Wrong</Text>
      <Text style={{ fontFamily: F.r, fontSize: 11.5, lineHeight: 18, color: Colors.navy, marginTop: 6, marginBottom: 14 }}>{"Don't worry, we're here to help.\nYou can try again, or choose one of the options below."}</Text>
      <Card style={{ borderRadius: 16, padding: 18, alignItems: 'center' }}>
        <View><WifiOff size={44} color={Colors.navy} strokeWidth={1.6} /><View style={{ position: 'absolute', right: -6, bottom: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#E5464F', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontFamily: F.b, fontSize: 11 }}>!</Text></View></View>
        <Text style={{ fontFamily: F.serifM, fontSize: 17, color: Colors.ink, marginTop: 12 }}>No Internet Connection</Text>
        <Text style={{ fontFamily: F.r, fontSize: 11.5, lineHeight: 18, color: Colors.ink, marginTop: 6, textAlign: 'center' }}>{'Please check your internet connection\nand try again.'}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <Button title="Try Again" height={42} style={{ flex: 1, borderRadius: 10 }} onPress={() => go('/home')} />
          <Button title="Check Connection" variant="outline" height={42} style={{ flex: 1, borderRadius: 10 }} onPress={() => {}} />
        </View>
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
        {tiles.map(t => (
          <Card key={t.title} style={{ width: '48.4%', borderRadius: 14, padding: 12, alignItems: 'center' }}>
            {t.icon}
            <Text style={{ fontFamily: F.serifM, fontSize: 12.5, color: Colors.ink, marginTop: 8, textAlign: 'center' }}>{t.title}</Text>
            <Text style={{ fontFamily: F.r, fontSize: 9.5, lineHeight: 14, color: Colors.slate, marginTop: 3, textAlign: 'center', minHeight: 28 }}>{t.sub}</Text>
            <Button title={t.action} variant="outline" height={34} style={{ alignSelf: 'stretch', borderRadius: 8, marginTop: 8 }} textStyle={{ fontSize: 11 }} onPress={() => go(t.href)} />
          </Card>
        ))}
      </View>
      <View style={{ marginTop: 14, borderRadius: 14, backgroundColor: '#E6F3EA', borderWidth: 1, borderColor: '#CFE6D8', padding: 16, flexDirection: 'row', gap: 12 }}>
        <ShieldCheck size={34} color="#2B9A5F" strokeWidth={1.5} />
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={{ fontFamily: F.serifM, fontSize: 13.5, color: Colors.ink }}>Your Safety Matters</Text>
          {['No payment is deducted when a service fails', 'No AI credits are deducted if AI response fails', 'Automatic credit restoration if needed', 'We prevent duplicate charges', 'Your data and sessions are safe'].map(x => (
            <View key={x} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><CircleCheck size={15} color="#2B9A5F" /><Text style={{ flex: 1, fontFamily: F.r, fontSize: 10.5, color: Colors.ink }}>{x}</Text></View>
          ))}
        </View>
      </View>
      <Card onPress={() => go('/support')} style={{ marginTop: 14, padding: 16, borderRadius: 14, alignItems: 'center', borderColor: '#C9C4EA' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Headset size={20} color={Colors.navy} /><Text style={{ fontFamily: F.s, fontSize: 13.5, color: Colors.navy }}>Contact Support</Text></View>
        <Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate, marginTop: 6 }}>Still facing an issue? Our team is here to help.</Text>
      </Card>
    </AppScreen>
  );
}
