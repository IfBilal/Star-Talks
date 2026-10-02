import { CircleArrowDown, EllipsisVertical, Expand, Fullscreen, Captions, Play, ShieldCheck, ScanLine, Volume2, Download } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, F, go, IconTile, Segmented } from '@/components/ui';
import { CosmicBg, Meditator } from '@/components/ui/art';
import { ZodiacWheel } from '@/components/ui/icons';
import { Colors } from '@/constants/theme';

export default function Lesson() {
  const [tab, setTab] = useState('Video Lesson');
  const notes = ['Vedic astrology (Jyotish) studies the sky using the sidereal zodiac.', 'The chart is divided into twelve houses, each governing a life area.', 'Planets act as significators; their strength shapes outcomes.'];
  return (
    <AppScreen
      header={<AppBar title="Vedic Astrology Foundation" right={<EllipsisVertical size={18} color={Colors.navy} />} />}
      footer={<View style={{ paddingHorizontal: 16, paddingBottom: 10 }}><Button title="Mark as Complete" height={50} style={{ borderRadius: 14 }} onPress={() => go('/courses/vedic-foundation/certificate')} /></View>}
      contentStyle={{ paddingTop: 2 }}
    >
      <View style={{ height: 150, borderRadius: 14, overflow: 'hidden' }}>
        <CosmicBg colors={['#15164F', '#2A2780', '#47399A']} style={{ flex: 1 }}>
          <View style={{ position: 'absolute', right: -6, top: 4 }}><Meditator size={132} /></View>
          <View style={{ padding: 14 }}>
            <Text style={{ fontFamily: F.m, fontSize: 11, color: '#fff' }}>Lesson 1</Text>
            <Text style={{ width: '68%', marginTop: 6, fontFamily: F.s, fontSize: 15, lineHeight: 20, color: '#fff' }}>Introduction to Vedic Astrology</Text>
            <Text style={{ marginTop: 6, fontFamily: F.r, fontSize: 10.5, color: '#E9E3F7' }}>12:45  •  1/6</Text>
          </View>
          <View style={{ position: 'absolute', left: 12, bottom: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}><Play size={10} color="#fff" fill="#fff" /></View>
        </CosmicBg>
      </View>
      <View style={{ marginTop: 4 }}><Segmented items={['Video Lesson', 'Notes', 'Resources']} value={tab} onChange={setTab} /></View>

      {tab === 'Video Lesson' ? (
        <>
          <View style={{ height: 232, borderRadius: 14, overflow: 'hidden', marginTop: 14 }}>
            <CosmicBg colors={['#14154F', '#1F1F6A', '#2C2A80']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ opacity: 0.85 }}><ZodiacWheel size={176} /></View>
              <Pressable accessibilityRole="button" accessibilityLabel="Play" style={{ position: 'absolute', width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: '#fff', backgroundColor: 'rgba(12,12,50,0.85)', alignItems: 'center', justifyContent: 'center' }}><Play size={22} color="#fff" fill="#fff" style={{ marginLeft: 3 }} /></Pressable>
              <View style={{ position: 'absolute', left: 12, right: 12, bottom: 30, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' }}><View style={{ width: '3%', height: 3, backgroundColor: '#F1D9A4', borderRadius: 2 }} /></View>
              <View style={{ position: 'absolute', left: 12, right: 12, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Play size={13} color="#fff" fill="#fff" /><Volume2 size={14} color="#fff" />
                <Text style={{ fontFamily: F.r, fontSize: 9, color: '#fff' }}>0:00 / 12:45</Text>
                <View style={{ flex: 1 }} />
                <Text style={{ fontFamily: F.r, fontSize: 9, color: '#fff' }}>00:00 / 12:45</Text>
                <Captions size={14} color="#fff" /><Expand size={14} color="#fff" />
              </View>
            </CosmicBg>
          </View>
          <Card style={{ marginTop: 14, padding: 14, gap: 14, borderRadius: 14 }}>
            {[
              [<CircleArrowDown key="a" size={17} color={Colors.navy} />, 'This video is available only to enrolled students.'],
              [<Download key="b" size={17} color={Colors.navy} />, 'No download option is available.'],
              [<ShieldCheck key="c" size={17} color={Colors.navy} />, 'Your access is protected and secure.'],
              [<ScanLine key="d" size={17} color={Colors.navy} />, 'Screenshots and screen recording are restricted.'],
            ].map(([icon, text], i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <IconTile icon={icon as React.ReactNode} size={30} />
                <Text style={{ flex: 1, fontFamily: F.r, fontSize: 11.5, color: '#2B3270' }}>{text as string}</Text>
              </View>
            ))}
          </Card>
        </>
      ) : tab === 'Notes' ? (
        <Card style={{ marginTop: 14, padding: 16, gap: 12, borderRadius: 14 }}>
          {notes.map(n => <Text key={n} style={{ fontFamily: F.r, fontSize: 12, lineHeight: 19, color: Colors.ink }}>{'•  '}{n}</Text>)}
        </Card>
      ) : (
        <Card style={{ marginTop: 14, borderRadius: 14 }}>
          {['Lesson slides (PDF)', 'Houses & signs cheat sheet', 'Glossary of Sanskrit terms'].map((r, i, a) => (
            <View key={r} style={{ minHeight: 52, paddingHorizontal: 14, justifyContent: 'center', borderBottomWidth: i < a.length - 1 ? 1 : 0, borderBottomColor: '#EFEBF6' }}><Text style={{ fontFamily: F.m, fontSize: 12, color: Colors.navy }}>{r}</Text></View>
          ))}
        </Card>
      )}
    </AppScreen>
  );
}
