import { ChevronRight, EllipsisVertical, Search } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AppBar, AppScreen, Card, Chip, go, ListRow } from '@/components/ui';
import { HISTORY, moduleById, MODULES } from '@/features/uiData/ai';
import { Colors } from '@/constants/theme';

export default function AiHistory() {
  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState('');
  const list = HISTORY.filter(h => (filter === 'All' || moduleById(h.module).name.startsWith(filter)) && h.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <AppScreen tab="ai" header={<AppBar title="AI Astrology" right={<EllipsisVertical size={18} color={Colors.navy} />} />} pad={0} contentStyle={{ paddingTop: 6 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} style={{ flexGrow: 0 }}>
        {['All', 'Vedic', 'Tarot', 'Palmistry', 'Numerology', 'Western', 'Lal Kitab', 'Chinese', 'Korean', 'Face'].map(c => (
          <Chip key={c} label={c} on={filter === c} onPress={() => setFilter(c)} style={{ height: 36, paddingHorizontal: 18, borderRadius: 12 }} />
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: 16 }}>
        <View style={{ height: 46, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EFEAF5', marginTop: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Search size={17} color={Colors.navy} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search conversations..." placeholderTextColor="#9AA0B8" style={{ flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 12, color: Colors.ink, paddingVertical: 0 }} />
        </View>
        <View style={{ gap: 4, marginTop: 10 }}>
          {list.map(h => {
            const m = moduleById(h.module);
            return (
              <Card key={h.title} style={{ borderRadius: 14 }}>
                <ListRow icon={() => m.icon(m.ink, 21)} tileBg={m.tint} title={h.title} subtitle={`${m.name}  •  ${h.date}`} onPress={() => go(`/ai/${h.module}?view=answer`)} style={{ minHeight: 62 }} />
              </Card>
            );
          })}
          {list.length === 0 ? <Text style={{ textAlign: 'center', color: Colors.slate, fontFamily: 'Poppins_400Regular', fontSize: 12, marginTop: 30 }}>No conversations found</Text> : null}
        </View>
      </View>
    </AppScreen>
  );
}
