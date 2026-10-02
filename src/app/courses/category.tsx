import { Star } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppBar, AppScreen, Card, Chip, F, go, SearchBar } from '@/components/ui';
import { CourseThumb } from '@/components/ui/art';
import { CATEGORIES, COURSES } from '@/features/uiData/courses';
import { Colors } from '@/constants/theme';

export default function CourseList() {
  const { c } = useLocalSearchParams<{ c?: string }>();
  const [cat, setCat] = useState(c ?? 'All');
  const [q, setQ] = useState('');
  const list = COURSES.filter(x => (cat === 'All' || x.category === cat) && x.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <AppScreen tab="courses" header={<AppBar title={cat === 'All' ? 'All Courses' : cat} />} pad={0} contentStyle={{ paddingTop: 4 }}>
      <View style={{ paddingHorizontal: 16 }}><SearchBar placeholder="Search for courses..." value={q} onChangeText={setQ} style={{ height: 46, borderRadius: 14 }} /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }} style={{ flexGrow: 0 }}>
        {['All', ...CATEGORIES].map(x => <Chip key={x} label={x} on={cat === x} onPress={() => setCat(x)} />)}
      </ScrollView>
      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        {list.map(x => (
          <Card key={x.id} onPress={() => go(`/courses/${x.id}`)} style={{ borderRadius: 15, padding: 8, flexDirection: 'row', gap: 12 }}>
            <CourseThumb size={92} radius={12} />
            <View style={{ flex: 1, paddingVertical: 2 }}>
              <Text numberOfLines={1} style={{ fontFamily: F.s, fontSize: 13.5, color: Colors.navy }}>{x.title}</Text>
              <Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate, marginTop: 3 }}>{`${x.level}  •  ${x.modules} Modules  •  ${x.hours} hrs`}</Text>
              <Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate, marginTop: 6 }}>{x.instructor}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <Text style={{ fontFamily: F.b, fontSize: 14, color: Colors.navy }}>{x.price}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}><Star size={11} color="#F0A93B" fill="#F0A93B" /><Text style={{ fontFamily: F.r, fontSize: 10, color: Colors.slate }}>{x.rating}</Text></View>
              </View>
            </View>
          </Card>
        ))}
        {list.length === 0 ? <Text style={{ textAlign: 'center', marginTop: 40, fontFamily: F.r, fontSize: 12.5, color: Colors.slate }}>Courses in this category are coming soon.</Text> : null}
      </View>
    </AppScreen>
  );
}
