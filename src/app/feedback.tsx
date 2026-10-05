import { useTheme } from '@/lib/theme-context';
import { Bug, Headset, Lightbulb, MessageCircle, Star, X , Flower2 } from 'lucide-react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, F, go } from '@/components/ui';

const reviews = [['Priya S.', '"This app has been a blessing. The insights are so accurate!"'], ['Ahmed K.', '"Love the clean design and supportive readings."'], ['Maria D.', '"Very helpful and easy to use. Highly recommended!"']];

export default function Feedback() {
  const { Colors: palette, themed } = useTheme();

const tile = (icon: React.ReactNode, title: string, sub: string, onPress: () => void, w: string) => (
  <Pressable key={title} accessibilityRole="button" onPress={onPress} style={{ width: w as `${number}%`, minHeight: 108, borderRadius: 14, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.cardBorder, alignItems: 'center', justifyContent: 'center', padding: 8, gap: 6 }}>
    {icon}
    <Text style={{ fontFamily: F.s, fontSize: 11, color: palette.navy, textAlign: 'center' }}>{title}</Text>
    <Text style={{ fontFamily: F.r, fontSize: 9, color: palette.slate, textAlign: 'center' }}>{sub}</Text>
  </Pressable>
);

  const [banner, setBanner] = useState(true);
  return (
    <AppScreen tab="profile" header={<AppBar brand />} contentStyle={{ paddingTop: 6 }}>
      <Text style={{ fontFamily: F.serif, fontSize: 22, color: palette.navy }}>Help Us Make STAR TALKS Better</Text>
      <Text style={{ fontFamily: F.r, fontSize: 11.5, lineHeight: 17, color: palette.navy, marginTop: 4, marginBottom: 14, width: '80%' }}>Your feedback helps us create a more meaningful experience for everyone.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {tile(<Star size={26} color={palette.navy} strokeWidth={1.5} />, 'Rate the App', 'Share your experience on the app store', () => {}, '31.4%')}
        {tile(<MessageCircle size={26} color={palette.navy} strokeWidth={1.5} />, 'Submit Feedback', 'Tell us what you think', () => go('/support/new'), '31.4%')}
        {tile(<Bug size={26} color={palette.navy} strokeWidth={1.5} />, 'Report a Problem', 'Let us know what went wrong', () => go('/support/new?c=Technical%20issue'), '31.4%')}
        {tile(<Lightbulb size={26} color={palette.navy} strokeWidth={1.5} />, 'Suggest a Feature', 'Help us improve', () => go('/support/new?c=Other'), '48.6%')}
        {tile(<Headset size={26} color={palette.navy} strokeWidth={1.5} />, 'Contact Support', 'Get help from our team', () => go('/support'), '48.6%')}
      </View>
      {banner ? (
        <Card tint={themed("#EEE9FB", 'surface')} style={{ marginTop: 14, padding: 12, borderRadius: 14, flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 62, height: 62, borderRadius: 14, backgroundColor: themed('#2A2C78', 'surface'), alignItems: 'center', justifyContent: 'center' }}><Image source={require('../../assets/images/star-talks-mark.png')} contentFit="contain" style={{ width: 48, height: 24 }} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.serifM, fontSize: 14, color: palette.navy }}>Enjoying STAR TALKS?</Text>
            <Text style={{ fontFamily: F.r, fontSize: 10, lineHeight: 15, color: themed('#4A5590', 'foreground'), marginTop: 2 }}>If you love using the app, please take a moment to rate us on the Play Store.</Text>
            <Button title="Rate on Play Store" variant="outline" height={30} style={{ borderRadius: 8, marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 12 }} textStyle={{ fontSize: 10.5 }} onPress={() => {}} />
          </View>
          <Pressable hitSlop={10} onPress={() => setBanner(false)} style={{ alignSelf: 'flex-start' }}><X size={15} color={palette.navy} /></Pressable>
        </Card>
      ) : null}
      <Text style={{ fontFamily: F.serifM, fontSize: 14.5, color: palette.navy, marginTop: 18, marginBottom: 8 }}>Recent Feedback from Our Community</Text>
      <View style={{ gap: 7 }}>
        {reviews.map(([n, q]) => (
          <Card key={n} style={{ borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: themed('#E6E0F6', 'surface'), alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: F.s, fontSize: 12, color: palette.navy }}>{n[0]}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.s, fontSize: 10.5, color: palette.ink }}>{n}</Text>
              <View style={{ flexDirection: 'row', gap: 1, marginVertical: 1 }}>{[0, 1, 2, 3, 4].map(i => <Star key={i} size={11} color={themed("#F0A93B", 'foreground')} fill="#F0A93B" />)}</View>
              <Text style={{ fontFamily: F.r, fontSize: 9.5, color: palette.slate }}>{q}</Text>
            </View>
          </Card>
        ))}
      </View>
      <LinearGradient colors={[themed('#E9E1F8', 'surface')!, themed('#D9CFF0', 'surface')!]} style={{ marginTop: 16, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Flower2 size={46} color={themed("#8A6DD0", 'foreground')} strokeWidth={1.3} />
        <View style={{ flex: 1 }}><Text style={{ fontFamily: F.serifM, fontSize: 14, color: palette.navy }}>Your Safety Matters</Text><Text style={{ fontFamily: F.r, fontSize: 10, lineHeight: 15, color: themed('#4A5590', 'foreground'), marginTop: 3 }}>Together, we can make spiritual guidance more accessible for everyone.</Text></View>
      </LinearGradient>
    </AppScreen>
  );
}
