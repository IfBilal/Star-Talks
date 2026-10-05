import { useTheme } from '@/lib/theme-context';
import { useLocalSearchParams } from 'expo-router';
import { BookOpen, CircleCheck, Clock3, Lock, PlayCircle, Star, UserRound } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, F, go, Pill, SectionTitle } from '@/components/ui';
import { CourseThumb } from '@/components/ui/art';
import { COURSES, LESSONS } from '@/features/uiData/courses';
import { Colors } from '@/constants/theme';

export default function CourseDetails() {
  const { Colors: palette, themed } = useTheme();

  const { id } = useLocalSearchParams<{ id: string }>();
  const c = COURSES.find(x => x.id === id) ?? COURSES[0];
  return (
    <AppScreen
      header={<AppBar title="Course Details" />}
      footer={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: palette.ivory, borderTopWidth: 1, borderTopColor: themed('#EEEAF0', 'border') }}>
          <View><Text style={{ fontFamily: F.r, fontSize: 10, color: palette.slate }}>Price</Text><Text style={{ fontFamily: F.b, fontSize: 18, color: palette.navy }}>{c.price}</Text></View>
          <Button title="Enroll Now" height={48} style={{ flex: 1, borderRadius: 24 }} onPress={() => go('/payment')} />
        </View>
      }
    >
      <View style={{ alignItems: 'center', marginTop: 4 }}><CourseThumb size={150} radius={18} /></View>
      <Text style={{ marginTop: 16, fontFamily: F.s, fontSize: 18, color: palette.navy }}>{c.title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Star size={13} color={themed("#F0A93B", 'foreground')} fill="#F0A93B" /><Text style={{ fontFamily: F.m, fontSize: 11.5, color: palette.ink }}>{c.rating}</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><BookOpen size={13} color={palette.slate} /><Text style={{ fontFamily: F.r, fontSize: 11.5, color: palette.slate }}>{`${c.modules} Modules`}</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Clock3 size={13} color={palette.slate} /><Text style={{ fontFamily: F.r, fontSize: 11.5, color: palette.slate }}>{`${c.hours} hrs`}</Text></View>
        <Pill>{c.level}</Pill>
      </View>
      <Card style={{ marginTop: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14 }}>
        <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: palette.tile, alignItems: 'center', justifyContent: 'center' }}><UserRound size={20} color={palette.navy} /></View>
        <View><Text style={{ fontFamily: F.s, fontSize: 12.5, color: palette.navy }}>{c.instructor}</Text><Text style={{ fontFamily: F.r, fontSize: 10.5, color: palette.slate }}>Instructor · 12 years teaching astrology</Text></View>
      </Card>
      <SectionTitle>About this course</SectionTitle>
      <Text style={{ fontFamily: F.r, fontSize: 12, lineHeight: 19, color: palette.ink }}>A step-by-step introduction that builds from the basics to confident chart reading, with short video lessons, notes and a certificate on completion.</Text>
      <SectionTitle>Lessons</SectionTitle>
      <Card style={{ borderRadius: 14 }}>
        {LESSONS.map((l, i) => (
          <View key={l.title} style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, borderBottomWidth: i < LESSONS.length - 1 ? 1 : 0, borderBottomColor: themed('#EFEBF6', 'border') }}>
            {l.locked ? <Lock size={18} color={palette.slate} /> : l.done ? <CircleCheck size={18} color={palette.success} /> : <PlayCircle size={18} color={palette.navy} />}
            <View style={{ flex: 1 }}><Text style={{ fontFamily: F.m, fontSize: 12, color: themed(l.locked ? Colors.slate : Colors.navy, 'foreground') }}>{`${i + 1}. ${l.title}`}</Text></View>
            <Text style={{ fontFamily: F.r, fontSize: 10.5, color: palette.slate }}>{l.length}</Text>
          </View>
        ))}
      </Card>
    </AppScreen>
  );
}
