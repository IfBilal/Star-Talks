import { useTheme } from '@/lib/theme-context';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Card, F, go, Progress, Segmented } from '@/components/ui';
import { CourseThumb } from '@/components/ui/art';
import { COURSES } from '@/features/uiData/courses';

const mine = [
  { c: COURSES[0], progress: 17, done: false },
  { c: COURSES[1], progress: 60, done: false },
  { c: COURSES[2], progress: 100, done: true },
];

export default function MyCourses() {
  const { Colors: palette } = useTheme();

  const { tab: t0 } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState(t0 === 'Completed' ? 'Completed' : 'In Progress');
  const list = mine.filter(m => (tab === 'Completed' ? m.done : !m.done));
  return (
    <AppScreen tab="courses" header={<AppBar title="My Courses" />} contentStyle={{ paddingTop: 4 }}>
      <Segmented items={['In Progress', 'Completed']} value={tab} onChange={setTab} />
      <View style={{ gap: 10, marginTop: 14 }}>
        {list.map(({ c, progress, done }) => (
          <Card key={c.id} onPress={() => go(done ? `/courses/${c.id}/certificate` : `/courses/${c.id}/lesson`)} style={{ borderRadius: 15, padding: 10, flexDirection: 'row', gap: 12 }}>
            <CourseThumb size={84} radius={12} />
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text numberOfLines={1} style={{ fontFamily: F.s, fontSize: 13, color: palette.navy }}>{c.title}</Text>
              <Text style={{ fontFamily: F.r, fontSize: 10.5, color: palette.slate, marginTop: 3 }}>{c.instructor}</Text>
              <View style={{ marginTop: 10 }}><Progress value={progress} height={6} /></View>
              <Text style={{ fontFamily: F.m, fontSize: 10.5, color: palette.navy, marginTop: 5 }}>{done ? 'Completed · View certificate' : `${progress}% complete`}</Text>
            </View>
          </Card>
        ))}
        {list.length === 0 ? <Text style={{ textAlign: 'center', marginTop: 40, fontFamily: F.r, fontSize: 12.5, color: palette.slate }}>Nothing here yet</Text> : null}
      </View>
    </AppScreen>
  );
}
