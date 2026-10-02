import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppBar, AppScreen, Button, Card, F, go, Segmented } from '@/components/ui';
import { CosmicBg } from '@/components/ui/art';
import { Colors } from '@/constants/theme';

const tabs = ['Overview', 'Strengths', 'Challenges', 'Timing'];
const content: Record<string, string[]> = {
  Strengths: ['Shared values and life goals', 'Good communication', 'Emotional understanding', 'Mutual respect and support'],
  Challenges: ['Different pace of decision-making', 'Need for more personal space at times', 'Stress can trigger silence instead of talk'],
  Timing: ['Jun – Aug 2025: a favourable period for commitment', 'Nov 2025: communication needs extra care', 'Early 2026: strong period for shared plans'],
};

export default function CompatibilityResult() {
  const [tab, setTab] = useState('Overview');
  return (
    <AppScreen
      header={<AppBar brand />}
      footer={
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 8 }}>
          <Button title="Save Report" variant="outline" height={46} style={{ flex: 1, borderRadius: 12 }} onPress={() => go('/saved')} />
          <Button title="Ask AI About This" height={46} style={{ flex: 1, borderRadius: 12 }} onPress={() => go('/ai/vedic')} />
        </View>
      }
      contentStyle={{ paddingTop: 2 }}
    >
      <View style={{ height: 150, borderRadius: 16, overflow: 'hidden' }}>
        <CosmicBg colors={['#22236F', '#34308A', '#4D3F9A']} style={{ flex: 1, padding: 18, justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.serifM, fontSize: 24, color: '#fff' }}>Neha & Rahul</Text>
          <Text style={{ fontFamily: F.m, fontSize: 13, color: '#fff', marginTop: 8 }}>Love Compatibility</Text>
          <View style={{ position: 'absolute', right: 14, top: 16, alignItems: 'center' }}>
            <View style={{ width: 86, height: 86, alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={86} height={86} viewBox="0 0 86 86"><Circle cx="43" cy="43" r="39" fill="none" stroke="#E9C77F" strokeWidth="3" /><Circle cx="43" cy="43" r="31" fill="none" stroke="#E9C77F" strokeWidth="0.8" opacity="0.5" /></Svg>
              <Text style={{ position: 'absolute', fontFamily: F.serifM, fontSize: 26, color: '#fff' }}>78%</Text>
            </View>
            <View style={{ marginTop: -10, backgroundColor: '#F6E6C4', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 }}><Text style={{ fontFamily: F.m, fontSize: 9.5, color: '#6B4A12' }}>Good Compatibility</Text></View>
          </View>
        </CosmicBg>
      </View>
      <View style={{ marginTop: 10 }}><Segmented items={tabs} value={tab} onChange={setTab} /></View>
      {tab === 'Overview' ? (
        <>
          <Card style={{ marginTop: 14, padding: 16, borderRadius: 14 }}>
            <Text style={{ fontFamily: F.s, fontSize: 14, color: Colors.navy }}>Key Insights</Text>
            <Text style={{ fontFamily: F.r, fontSize: 12, lineHeight: 19, color: '#3B4373', marginTop: 8 }}>Your combination shows a strong emotional and mental connection. You both value growth and stability, which creates a solid foundation for a long-term relationship.</Text>
          </Card>
          <Card style={{ marginTop: 12, padding: 16, borderRadius: 14 }}>
            <Text style={{ fontFamily: F.s, fontSize: 14, color: Colors.navy }}>Strengths</Text>
            {content.Strengths.map(x => (
              <View key={x} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 11 }}>
                <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.3, borderColor: Colors.navy, alignItems: 'center', justifyContent: 'center' }}><Check size={11} color={Colors.navy} strokeWidth={3} /></View>
                <Text style={{ fontFamily: F.r, fontSize: 12, color: '#3B4373' }}>{x}</Text>
              </View>
            ))}
          </Card>
        </>
      ) : (
        <Card style={{ marginTop: 14, padding: 16, borderRadius: 14 }}>
          <Text style={{ fontFamily: F.s, fontSize: 14, color: Colors.navy }}>{tab}</Text>
          {content[tab].map(x => (
            <View key={x} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 11 }}>
              <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.3, borderColor: Colors.navy, alignItems: 'center', justifyContent: 'center' }}><Check size={11} color={Colors.navy} strokeWidth={3} /></View>
              <Text style={{ flex: 1, fontFamily: F.r, fontSize: 12, color: '#3B4373' }}>{x}</Text>
            </View>
          ))}
        </Card>
      )}
    </AppScreen>
  );
}
