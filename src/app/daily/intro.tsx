import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StatusBar, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { F, go } from '@/components/ui';

export default function DailyIntro() {
  return (
    <LinearGradient colors={['#23245E', '#3B3585', '#6B5BAE', '#B58A8C', '#6A5A98', '#2D2F78']} locations={[0, 0.25, 0.5, 0.66, 0.78, 1]} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      {[[12, 10], [30, 6], [55, 14], [78, 8], [90, 22], [20, 26], [66, 30], [44, 20], [8, 38]].map(([x, y], i) => (
        <View key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 2, height: 2, borderRadius: 1, backgroundColor: '#fff', opacity: 0.6 }} />
      ))}
      <View style={{ position: 'absolute', right: 40, top: 110 }}>
        <Svg width={110} height={110} viewBox="0 0 110 110">
          <Circle cx="55" cy="55" r="52" fill="#EBD9C4" />
          <Circle cx="38" cy="42" r="9" fill="#D9C2AA" opacity="0.7" /><Circle cx="66" cy="62" r="12" fill="#D9C2AA" opacity="0.6" /><Circle cx="50" cy="76" r="6" fill="#D9C2AA" opacity="0.6" />
        </Svg>
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '36%' }} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 400 240" preserveAspectRatio="none">
          <Path d="M0 120L60 70L110 100L170 40L230 95L290 60L350 105L400 80V240H0Z" fill="#4A4388" opacity="0.75" />
          <Path d="M0 170L70 120L130 150L200 100L270 150L340 120L400 160V240H0Z" fill="#2E2C72" />
        </Svg>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}>
        <Text style={{ textAlign: 'center', fontFamily: F.serifM, fontSize: 24, lineHeight: 36, color: '#F3ECF7' }}>{'A little guidance\nevery day, for a brighter you.'}</Text>
      </View>
      <View style={{ position: 'absolute', left: 28, right: 28, bottom: 92 }}>
        <Pressable accessibilityRole="button" onPress={() => go('/daily')} style={{ height: 56, borderRadius: 28, backgroundColor: '#F6E8D2', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.m, fontSize: 13.5, color: '#2A3070' }}>View Today's Horoscope</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}
