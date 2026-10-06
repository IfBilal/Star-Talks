import { useTheme } from '@/lib/theme-context';
import { Share2, X, ArrowDown, BookmarkPlus, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, go } from '@/components/ui';
import { GoldStar } from '@/components/ui/icons';

export default function ReportReady() {
  const { Colors: palette, themed } = useTheme();

  const [askOpen, setAskOpen] = useState(true);
  return (
    <AppScreen header={<AppBar title="" />} pad={22}>
      <View style={{ position: 'absolute', top: 10, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
        <View style={{ position: 'absolute', left: 54, top: 82 }}><GoldStar size={8} opacity={0.7} /></View>
        <View style={{ position: 'absolute', right: 40, top: 20 }}><GoldStar size={12} /></View>
        <View style={{ position: 'absolute', right: 22, top: 94 }}><GoldStar size={15} /></View>
        <View style={{ position: 'absolute', left: 34, top: 172 }}><GoldStar size={9} opacity={0.6} /></View>
        <View style={{ position: 'absolute', left: '48%', bottom: 50 }}><GoldStar size={20} /></View>
      </View>
      <View style={{ alignItems: 'center', marginTop: 14 }}>
        <View style={{ width: 130, height: 130, borderRadius: 65, backgroundColor: themed('#ECE6F8', 'surface'), alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 62, height: 74, borderRadius: 9, borderWidth: 2, borderColor: themed('#3A3C9C', 'border'), backgroundColor: themed('#F8F5FF', 'surface'), padding: 8, gap: 5 }}>
            <View style={{ height: 3, width: 14, backgroundColor: themed('#3A3C9C', 'surface'), borderRadius: 2 }} />
            <View style={{ height: 3, width: 30, backgroundColor: themed('#3A3C9C', 'surface'), borderRadius: 2 }} />
            <View style={{ height: 3, width: 22, backgroundColor: themed('#3A3C9C', 'surface'), borderRadius: 2 }} />
          </View>
          <View style={{ position: 'absolute', right: 26, bottom: 24, width: 34, height: 34, borderRadius: 17, backgroundColor: themed('#3A3C9C', 'surface'), alignItems: 'center', justifyContent: 'center' }}><ArrowDown size={17} color={themed("#fff", 'foreground')} strokeWidth={2.4} /></View>
        </View>
        <Text style={{ marginTop: 22, fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: palette.navy }}>Your Report is Ready</Text>
        <Text style={{ marginTop: 14, fontFamily: 'Poppins_500Medium', fontSize: 13, color: palette.ink }}>Birth Chart Report</Text>
        <Text style={{ marginTop: 3, fontFamily: 'Poppins_400Regular', fontSize: 10.5, color: themed('#B5B2C9', 'foreground') }}>PDF • 12 Pages</Text>
      </View>
      <Button title="Download Report" height={50} style={{ borderRadius: 26, marginTop: 24 }} onPress={() => {}} />
      <Button title="Save to Library" variant="light" height={46} style={{ borderRadius: 23, marginTop: 12 }} icon={<BookmarkPlus size={18} color={palette.navy} />} onPress={() => go('/reports/history')} />
      <Button title="Share Report" variant="light" height={46} style={{ borderRadius: 23, marginTop: 10 }} icon={<Share2 size={18} color={palette.navy} />} onPress={() => {}} />
      {askOpen ? (
        <Card onPress={() => go('/ai/vedic')} style={{ marginTop: 18, padding: 16, borderRadius: 14, flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: themed('#FCE6EE', 'surface'), alignItems: 'center', justifyContent: 'center' }}><Sparkles size={19} color={themed("#C2416C", 'foreground')} /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12.5, color: palette.navy }}>Ask AI About This Report</Text>
            <Text style={{ marginTop: 3, fontFamily: 'Poppins_400Regular', fontSize: 10.5, lineHeight: 16, color: palette.slate }}>Get deeper insights and simple explanations.</Text>
          </View>
          <Pressable hitSlop={10} onPress={() => setAskOpen(false)} style={{ alignSelf: 'flex-start' }}><X size={15} color={palette.navy} /></Pressable>
        </Card>
      ) : null}
    </AppScreen>
  );
}
