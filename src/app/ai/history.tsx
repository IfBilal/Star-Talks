import { useTheme } from '@/lib/theme-context';
import { EllipsisVertical, Search } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AppBar, AppScreen, Card, Chip, ListRow } from '@/components/ui';
import { aiCall, type AiConversation, type AiCursor } from '@/features/ai/api';
import { moduleById, MODULES } from '@/features/uiData/ai';

export default function AiHistory() {
  const { Colors: palette, themed } = useTheme();

  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [search,setSearch]=useState('');
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [cursor,setCursor]=useState<AiCursor|null>(null);
  const [moreBusy,setMoreBusy]=useState(false);
  const request=useRef(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(()=>{const timer=setTimeout(()=>setSearch(query.trim()),300);return()=>clearTimeout(timer);},[query]);
  const load = useCallback(async () => {
    const current=++request.current;
    setLoading(true); setError('');
    try { const result = await aiCall('list-conversations',{moduleFilter:filter==='All'?undefined:filter,search});if(current===request.current){setConversations(result.conversations ?? []);setCursor(result.nextCursor??null);} }
    catch (cause) { if(current===request.current)setError(cause instanceof Error ? cause.message : 'History is unavailable.'); }
    finally { if(current===request.current)setLoading(false); }
  }, [filter,search]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const loadMore=async()=>{if(!cursor||moreBusy)return;setMoreBusy(true);try{const result=await aiCall('list-conversations',{moduleFilter:filter==='All'?undefined:filter,search,cursor});setConversations(previous=>[...previous,...(result.conversations??[])]);setCursor(result.nextCursor??null);}catch(cause){setError(cause instanceof Error?cause.message:'More history could not be loaded.');}finally{setMoreBusy(false);}};
  const deleteAll = () => Alert.alert('Delete all AI history?', 'This permanently removes your AI conversations, messages, feedback, and reading photos.', [
    {text:'Cancel',style:'cancel'},
    {text:'Delete all',style:'destructive',onPress:()=>void (async()=>{try{await aiCall('delete-all-ai-history',{confirmation:'DELETE'});await load();}catch(cause){setError(cause instanceof Error?cause.message:'Could not delete AI history.');}})()},
  ]);
  const list = conversations;
  return <AppScreen tab="ai" header={<AppBar title="AI Astrology" right={<Pressable onPress={() => void load()} accessibilityLabel="Refresh history"><EllipsisVertical size={18} color={palette.navy} /></Pressable>} />} pad={0} contentStyle={{ paddingTop: 6 }}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} style={{ flexGrow: 0 }}>
      <Chip label="All" on={filter === 'All'} onPress={() => setFilter('All')} style={{ height: 36, paddingHorizontal: 18, borderRadius: 12 }} />
      {MODULES.map(module => <Chip key={module.id} label={module.name} on={filter === module.id} onPress={() => setFilter(module.id)} style={{ height: 36, paddingHorizontal: 18, borderRadius: 12 }} />)}
    </ScrollView>
    <View style={{ paddingHorizontal: 16 }}>
      <View style={{ height: 46, borderRadius: 12, backgroundColor: themed('#fff', 'surface'), borderWidth: 1, borderColor: themed('#EFEAF5', 'border'), marginTop: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Search size={17} color={palette.navy} /><TextInput selectionColor={palette.lavender} value={query} onChangeText={setQuery} placeholder="Search conversations..." placeholderTextColor={themed("#9AA0B8", 'foreground')} style={{ flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 12, color: palette.ink, paddingVertical: 0 }} />
      </View>
      {error ? <Text accessibilityRole="alert" style={{ textAlign: 'center', color: palette.danger, fontFamily: 'Poppins_400Regular', fontSize: 11, marginTop: 20 }}>{error}</Text> : null}
      {conversations.length ? <Pressable onPress={deleteAll} accessibilityRole="button" style={{alignSelf:'flex-end',paddingVertical:10}}><Text style={{fontFamily:'Poppins_500Medium',fontSize:11,color:palette.danger}}>Delete all AI history</Text></Pressable> : null}
      {loading ? <Text style={{ textAlign: 'center', color: palette.slate, fontFamily: 'Poppins_400Regular', fontSize: 12, marginTop: 30 }}>Loading conversations…</Text> : null}
      <View style={{ gap: 4, marginTop: 10 }}>
        {list.map(item => { const module = moduleById(item.module_id); return <Card key={item.id} style={{ borderRadius: 14 }}><ListRow icon={() => module.icon(module.ink, 21)} tileBg={themed(module.tint, 'surface')} title={item.title} subtitle={`${module.name}  •  ${new Date(item.updated_at).toLocaleDateString()}${item.first_reading_status==='failed'?'  •  Retry needed':''}`} onPress={() => router.push({ pathname: '/ai/[module]', params: { module: item.module_id, conversationId: item.id } })} style={{ minHeight: 62 }} /></Card>; })}
        {!loading && list.length === 0 ? <Text style={{ textAlign: 'center', color: palette.slate, fontFamily: 'Poppins_400Regular', fontSize: 12, marginTop: 30 }}>No conversations found</Text> : null}
        {cursor?<Pressable accessibilityRole="button" disabled={moreBusy} onPress={()=>void loadMore()} style={{alignSelf:'center',padding:14}}><Text style={{fontFamily:'Poppins_500Medium',fontSize:12,color:palette.indigo}}>{moreBusy?'Loading…':'Load more'}</Text></Pressable>:null}
      </View>
    </View>
  </AppScreen>;
}
