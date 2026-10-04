import { CircleAlert, Clock3, Flower2, Gavel, HeartCrack, HeartPulse, ShieldCheck, ShieldAlert, Skull, Stethoscope, Swords, TriangleAlert, Wallet, CircleCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppBar, AppScreen, Card, F, go } from '@/components/ui';
import { Colors } from '@/constants/theme';

const rules = [
  [<Clock3 key="a" size={20} color="#D9823B" />, 'No guaranteed predictions', 'AI does not present predictions as absolute facts.', '#FBEBD6'],
  [<CircleCheck key="b" size={20} color="#2B7A52" />, 'No fabricated personal details', 'AI will not create false information to impress you.', '#DCEFE5'],
  [<ShieldAlert key="c" size={20} color={Colors.navy} />, 'No dangerous instructions', 'AI does not give medical, legal or financial advice.', '#E6E1F5'],
  [<ShieldCheck key="d" size={20} color={Colors.navy} />, 'Sensitive questions handled with care', 'You will receive safe and supportive responses.', '#E6E1F5'],
] as const;

export default function AiSafety() {
  const areas = [[[<Skull key="1" size={15} color={Colors.navy} />, 'Death'], [<HeartPulse key="2" size={15} color={Colors.navy} />, 'Serious illness'], [<HeartCrack key="3" size={15} color={Colors.navy} />, 'Self-harm'], [<Swords key="4" size={15} color={Colors.navy} />, 'Violence']], [[<Stethoscope key="5" size={15} color={Colors.navy} />, 'Medical treatment'], [<Gavel key="6" size={15} color={Colors.navy} />, 'Legal matters'], [<Wallet key="7" size={15} color={Colors.navy} />, 'Financial decisions']]];
  return (
    <AppScreen tab="ai" header={<AppBar brand />} contentStyle={{ paddingTop: 4 }}>
      <LinearGradient colors={['#E5DDF7', '#F1ECFA']} style={{ borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Svg width={64} height={72} viewBox="0 0 64 72"><Path d="M32 3L58 12V34c0 18-11 30-26 36C17 64 6 52 6 34V12Z" fill="#F4E9D0" stroke="#C99A3C" strokeWidth="2.4" /><Path d="M19 36l9 9l18-20" stroke="#3B3B8C" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></Svg>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.s, fontSize: 17, lineHeight: 23, color: Colors.navy }}>{'AI Safety &\nResponsible Responses'}</Text>
          <Text style={{ fontFamily: F.r, fontSize: 10.5, color: '#4A5590', marginTop: 6 }}>Your safety and well-being matter to us</Text>
        </View>
      </LinearGradient>
      <Card style={{ marginTop: 10, padding: 14, borderRadius: 14 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Clock3 size={22} color="#D9823B" />
          <Text style={{ flex: 1, fontFamily: F.r, fontSize: 11, lineHeight: 17, color: Colors.ink }}>Our AI is designed to provide helpful, personalized astrology guidance, while keeping your safety, privacy and well-being as the top priority.</Text>
        </View>
        <View style={{ gap: 14, marginTop: 14 }}>
          {rules.map(([icon, t, s, bg]) => (
            <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
              <View style={{ flex: 1 }}><Text style={{ fontFamily: F.s, fontSize: 11.5, color: Colors.navy }}>{t}</Text><Text style={{ fontFamily: F.r, fontSize: 10, color: Colors.slate, marginTop: 1 }}>{s}</Text></View>
            </View>
          ))}
        </View>
      </Card>
      <Card style={{ marginTop: 10, padding: 14, borderRadius: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#FBEBD6', alignItems: 'center', justifyContent: 'center' }}><TriangleAlert size={20} color="#D9823B" /></View>
          <View><Text style={{ fontFamily: F.s, fontSize: 12.5, color: Colors.navy }}>Sensitive Areas</Text><Text style={{ fontFamily: F.r, fontSize: 10, color: Colors.slate }}>We provide extra care when you ask about:</Text></View>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 14 }}>
          {areas.map((col, i) => (
            <View key={i} style={{ flex: 1, gap: 12, borderLeftWidth: i ? 1 : 0, borderLeftColor: '#ECE7F4', paddingLeft: i ? 14 : 0 }}>
              {col.map(([icon, label]) => (
                <View key={label as string} style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#EEE9F8', alignItems: 'center', justifyContent: 'center' }}>{icon as React.ReactNode}</View>
                  <Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate }}>{label as string}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Card>
      <Card style={{ marginTop: 10, padding: 14, borderRadius: 14, flexDirection: 'row', gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E6E1F5', alignItems: 'center', justifyContent: 'center' }}><CircleAlert size={20} color={Colors.navy} /></View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.s, fontSize: 12.5, color: Colors.navy }}>Report a Response</Text>
          <Text style={{ fontFamily: F.r, fontSize: 10.5, lineHeight: 16, color: Colors.slate, marginTop: 2 }}>If you find an AI response unsafe, inappropriate or incorrect, please report it.</Text>
          <Pressable accessibilityRole="button" onPress={() => go('/ai/history')} style={{ alignSelf: 'flex-start', marginTop: 10, height: 32, paddingHorizontal: 18, borderRadius: 16, borderWidth: 1, borderColor: Colors.navy, justifyContent: 'center' }}><Text style={{ fontFamily: F.m, fontSize: 11, color: Colors.navy }}>Choose a response to report</Text></Pressable>
        </View>
      </Card>
      <LinearGradient colors={['#E9E1F8', '#D9CFF0']} style={{ marginTop: 10, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Flower2 size={46} color="#8A6DD0" strokeWidth={1.3} />
        <View><Text style={{ fontFamily: F.s, fontSize: 12.5, color: Colors.navy }}>A Safe, Supportive</Text><Text style={{ fontFamily: F.s, fontSize: 12.5, color: Colors.navy }}>AI Experience</Text><Text style={{ fontFamily: F.r, fontSize: 10.5, color: '#4A5590', marginTop: 4 }}>Guidance you can trust.</Text></View>
      </LinearGradient>
    </AppScreen>
  );
}
