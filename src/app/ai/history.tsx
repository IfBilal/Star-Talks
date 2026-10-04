import { EllipsisVertical, Search } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AppBar, AppScreen, Card, Chip, ListRow } from '@/components/ui';
import { aiCall, type AiConversation } from '@/features/ai/api';
import { moduleById, MODULES } from '@/features/uiData/ai';
import { Colors } from '@/constants/theme';

export default function AiHistory() {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const result = await aiCall('list-conversations'); setConversations(result.conversations ?? []); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'History is unavailable.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const list = conversations.filter(item => (filter === 'All' || item.module_id === filter) && item.title.toLowerCase().includes(query.toLowerCase()));
  return <AppScreen tab="ai" header={<AppBar title="AI Astrology" right={<Pressable onPress={() => void load()} accessibilityLabel="Refresh history"><EllipsisVertical size={18} color={Colors.navy} /></Pressable>} />} pad={0} contentStyle={{ paddingTop: 6 }}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} style={{ flexGrow: 0 }}>
      <Chip label="All" on={filter === 'All'} onPress={() => setFilter('All')} style={{ height: 36, paddingHorizontal: 18, borderRadius: 12 }} />
      {MODULES.map(module => <Chip key={module.id} label={module.name} on={filter === module.id} onPress={() => setFilter(module.id)} style={{ height: 36, paddingHorizontal: 18, borderRadius: 12 }} />)}
    </ScrollView>
    <View style={{ paddingHorizontal: 16 }}>
      <View style={{ height: 46, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EFEAF5', marginTop: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Search size={17} color={Colors.navy} /><TextInput value={query} onChangeText={setQuery} placeholder="Search conversations..." placeholderTextColor="#9AA0B8" style={{ flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 12, color: Colors.ink, paddingVertical: 0 }} />
      </View>
      {error ? <Text accessibilityRole="alert" style={{ textAlign: 'center', color: Colors.danger, fontFamily: 'Poppins_400Regular', fontSize: 11, marginTop: 20 }}>{error}</Text> : null}
      {loading ? <Text style={{ textAlign: 'center', color: Colors.slate, fontFamily: 'Poppins_400Regular', fontSize: 12, marginTop: 30 }}>Loading conversations…</Text> : null}
      <View style={{ gap: 4, marginTop: 10 }}>
        {list.map(item => { const module = moduleById(item.module_id); return <Card key={item.id} style={{ borderRadius: 14 }}><ListRow icon={() => module.icon(module.ink, 21)} tileBg={module.tint} title={item.title} subtitle={`${module.name}  •  ${new Date(item.updated_at).toLocaleDateString()}${item.first_reading_status==='failed'?'  •  Retry needed':''}`} onPress={() => router.push({ pathname: '/ai/[module]', params: { module: item.module_id, conversationId: item.id } })} style={{ minHeight: 62 }} /></Card>; })}
        {!loading && list.length === 0 ? <Text style={{ textAlign: 'center', color: Colors.slate, fontFamily: 'Poppins_400Regular', fontSize: 12, marginTop: 30 }}>No conversations found</Text> : null}
      </View>
    </View>
  </AppScreen>;
}
