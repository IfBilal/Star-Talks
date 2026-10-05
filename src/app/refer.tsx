import { useTheme } from '@/lib/theme-context';
import { ChevronRight, Copy, Gift, History, Link2, MessageCircle, Send, Ellipsis, Tag, WalletCards } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { AppBar, AppScreen, BellButton, Button, Card, F, go, useTypography } from '@/components/ui';
import { GoldStar } from '@/components/ui/icons';

function Person({ flip }: { flip?: boolean }) {
  return (
    <Svg width={70} height={84} viewBox="0 0 70 84" style={flip ? { transform: [{ scaleX: -1 }] } : undefined}>
      <Circle cx="35" cy="42" r="34" fill="#EFEAF8" />
      <Circle cx="35" cy="30" r="12" fill="#F2DCC9" stroke="#3B3B8C" strokeWidth="1.5" />
      <Path d="M23 28c0-10 8-14 14-13c6 1 10 6 10 13c-4-3-8-6-12-6c-4 0-9 2-12 6Z" fill="#2E2E7A" />
      <Path d="M12 76c2-14 11-22 23-22s21 8 23 22Z" fill="#fff" stroke="#3B3B8C" strokeWidth="1.5" />
    </Svg>
  );
}

export default function Refer() {
  const { Colors: palette, themed } = useTheme();
  const Type = useTypography();

  const [copied, setCopied] = useState(false);
  return (
    <AppScreen tab="profile" header={<AppBar brand dark right={<BellButton dark />} />} contentStyle={{ paddingTop: 10 }}>
      <Text style={[Type.h1, { fontSize: 19 }]}>Refer & Earn</Text>
      <View style={{ alignItems: 'center', marginTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Person />
          <View>
            <Svg width={58} height={58} viewBox="0 0 58 58">
              <Rect x="8" y="22" width="42" height="32" rx="3" fill="#2D3B93" />
              <Rect x="8" y="22" width="42" height="9" rx="2" fill="#3D4BB0" />
              <Rect x="26" y="22" width="6" height="32" fill="#E5B45E" />
              <Path d="M29 22c-6-10-16-8-14-2c1 4 8 3 14 2Zm0 0c6-10 16-8 14-2c-1 4-8 3-14 2Z" fill="none" stroke="#E5B45E" strokeWidth="2.2" />
            </Svg>
          </View>
          <Person flip />
        </View>
        <View style={{ position: 'absolute', left: '26%', top: 6 }}><GoldStar size={9} /></View>
        <View style={{ position: 'absolute', right: '24%', top: 0 }}><GoldStar size={11} /></View>
        <Text style={{ marginTop: 10, fontFamily: F.s, fontSize: 14, color: palette.navy }}>Share the magic. Earn together.</Text>
        <Text style={{ marginTop: 6, fontFamily: F.r, fontSize: 11.5, color: themed('#4A5590', 'foreground') }}>Give your friends a special gift and get rewarded!</Text>
      </View>
      <Card style={{ marginTop: 16, padding: 14, borderRadius: 14 }}>
        <Text style={{ fontFamily: F.s, fontSize: 11.5, color: palette.navy }}>Your Referral Code</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 }}>
          <View style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: themed('#F4F0FA', 'surface'), flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10 }}>
            <Text style={{ fontFamily: F.s, fontSize: 14, color: palette.ink, letterSpacing: 0.4 }}>STARTALKS123</Text>
            <Copy size={15} color={palette.navy} />
          </View>
          <Button title={copied ? 'Copied' : 'Copy'} height={40} style={{ width: 84, borderRadius: 10 }} textStyle={{ fontSize: 12 }} onPress={() => setCopied(true)} />
        </View>
      </Card>
      <Card style={{ marginTop: 10, padding: 14, borderRadius: 14 }}>
        <Text style={{ fontFamily: F.s, fontSize: 11.5, color: palette.navy }}>Share Via</Text>
        <View style={{ flexDirection: 'row', gap: 14, marginTop: 12 }}>
          {[['#27C25A', <MessageCircle key="w" size={20} color={themed("#fff", 'foreground')} />], ['#2B9BDB', <Send key="t" size={19} color={themed("#fff", 'foreground')} />], ['#5B54B5', <Link2 key="l" size={19} color={themed("#fff", 'foreground')} />], ['#fff', <Ellipsis key="m" size={19} color={palette.navy} />]].map(([bg, icon], i) => (
            <Pressable key={i} accessibilityRole="button" style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: themed(bg as string, 'surface'), borderWidth: i === 3 ? 1 : 0, borderColor: themed('#D6D0EA', 'border'), alignItems: 'center', justifyContent: 'center' }}>{icon as React.ReactNode}</Pressable>
          ))}
        </View>
      </Card>
      <Card style={{ marginTop: 10, padding: 14, borderRadius: 14 }}>
        <Text style={{ fontFamily: F.s, fontSize: 11.5, color: palette.navy }}>Referral Rewards</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          {[[<Tag key="a" size={18} color={themed("#C2416C", 'foreground')} />, '#FBE2E4', 'Friend gets', '10% off'], [<WalletCards key="b" size={18} color={palette.navy} />, '#E6E1F5', 'You get', '100 credits']].map(([icon, bg, a, b], i) => (
            <View key={i} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: themed('#FBF7F3', 'surface'), borderRadius: 12, padding: 10 }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: themed(bg as string, 'surface'), alignItems: 'center', justifyContent: 'center' }}>{icon as React.ReactNode}</View>
              <View><Text style={{ fontFamily: F.r, fontSize: 10.5, color: palette.ink }}>{a as string}</Text><Text style={{ fontFamily: F.s, fontSize: 11.5, color: palette.ink }}>{b as string}</Text></View>
            </View>
          ))}
        </View>
      </Card>
      <Card onPress={() => {}} style={{ marginTop: 10, minHeight: 52, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14 }}>
        <History size={16} color={palette.navy} />
        <Text style={{ flex: 1, fontFamily: F.s, fontSize: 12.5, color: palette.navy }}>Referral History</Text>
        <ChevronRight size={17} color={palette.navy} />
      </Card>
    </AppScreen>
  );
}
