import { useTheme } from '@/lib/theme-context';
import { useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CircleCheck, Clapperboard, EllipsisVertical, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { back, F } from '@/components/ui';
import { CosmicBg } from '@/components/ui/art';

export default function EarnCredits() {
  const { Colors: palette, themed } = useTheme();

  const { done: start } = useLocalSearchParams<{ done?: string }>();
  const [watched, setWatched] = useState(start ? Number(start) : 3);
  const limit = watched >= 5;
  const rules = ['Watch 1 ad = 1 AI credit', 'Max 5 ads per day (5 credits)', 'Resets next day', 'Credits added after successful completion'];
  return (
    <CosmicBg colors={['#1A1B5E', '#2A2882', '#3F3693']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']}>
        <View style={{ height: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 14 }}>
          <Pressable onPress={back} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back"><ArrowLeft size={21} color={themed("#fff", 'foreground')} /></Pressable>
          <Text style={{ flex: 1, fontFamily: F.s, fontSize: 15.5, color: themed('#fff', 'foreground') }}>Earn Credits</Text>
          <EllipsisVertical size={18} color={themed("#fff", 'foreground')} />
        </View>
      </SafeAreaView>
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Clapperboard size={58} color={themed("#EBCB8B", 'foreground')} strokeWidth={1.3} />
        <Text style={{ marginTop: 14, fontFamily: F.s, fontSize: 19, color: themed('#fff', 'foreground') }}>Watch Ads & Earn AI Credits</Text>
        <Text style={{ marginTop: 10, fontFamily: F.r, fontSize: 12, color: themed('#EDE8FA', 'foreground') }}>Complete 5 ads daily to get 5 free AI credits.</Text>
      </View>
      <View style={{ marginHorizontal: 16, marginTop: 26, backgroundColor: themed('#F6F1FB', 'surface'), borderRadius: 20, padding: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: themed('#E5DFF5', 'surface'), alignItems: 'center', justifyContent: 'center' }}><Clapperboard size={17} color={palette.navy} /></View>
          <Text style={{ fontFamily: F.s, fontSize: 13.5, color: palette.navy }}>{`${watched}/5 ads watched`}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <View style={{ flexDirection: 'row', gap: 13 }}>
            {Array.from({ length: 5 }, (_, i) => <View key={i} style={{ width: 19, height: 19, borderRadius: 10, borderWidth: 1.5, borderColor: themed('#5B54B5', 'border'), backgroundColor: themed(i < watched ? '#6A63C8' : '#fff', 'surface') }} />)}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: F.s, fontSize: 12, color: palette.navy }}>{`${5 - watched} credits`}</Text>
            <Text style={{ fontFamily: F.r, fontSize: 9.5, color: palette.slate }}>left today</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" disabled={limit} onPress={() => setWatched(w => Math.min(5, w + 1))} style={{ marginTop: 22, height: 52, borderRadius: 12, backgroundColor: themed(limit ? '#CFCBD8' : '#5A53B6', 'surface'), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {limit ? <Lock size={16} color={themed("#9B98A8", 'foreground')} /> : null}
          <Text style={{ fontFamily: F.m, fontSize: 13.5, color: themed(limit ? '#9B98A8' : '#fff', 'foreground') }}>{limit ? 'Daily limit reached' : 'Watch Ad'}</Text>
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <Text style={{ fontFamily: F.s, fontSize: 13.5, color: themed('#fff', 'foreground') }}>How it works?</Text>
        <View style={{ gap: 18, marginTop: 16 }}>
          {rules.map(r => (
            <View key={r} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <CircleCheck size={22} color={themed("#E9DFC4", 'foreground')} strokeWidth={1.5} />
              <Text style={{ fontFamily: F.r, fontSize: 12.5, color: themed('#fff', 'foreground') }}>{r}</Text>
            </View>
          ))}
        </View>
      </View>
    </CosmicBg>
  );
}
