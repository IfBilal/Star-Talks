import { ChevronRight, FileText, GraduationCap, Heart, MessagesSquare, UsersRound } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { AppBar, AppScreen, Avatar, Card, Chip, F, go, Progress } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { aiCall, type AiConversation } from '@/features/ai/api';
import { requireSupabase } from '@/lib/supabase';

function Block({ icon, title, sub, onPress, children }: { icon: React.ReactNode; title: string; sub: string; onPress: () => void; children?: React.ReactNode }) {
  return (
    <Card onPress={onPress} style={{ borderRadius: 16, padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#ECE6F8', alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
        <View style={{ flex: 1 }}><Text style={{ fontFamily: F.serifM, fontSize: 15, color: Colors.navy }}>{title}</Text><Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate, marginTop: 1 }}>{sub}</Text></View>
        <ChevronRight size={18} color={Colors.navy} />
      </View>
      {children ? <View style={{ marginTop: 10, marginLeft: 58 }}>{children}</View> : null}
    </Card>
  );
}

function Thumb({ bg = '#ECE6F8' }: { bg?: string }) { return <View style={{ width: 34, height: 44, borderRadius: 4, backgroundColor: bg, borderWidth: 1, borderColor: '#D8D0EE' }} />; }

export default function Saved() {
  const [f, setF] = useState('All');
  const [chats,setChats]=useState<AiConversation[]>([]);
  const [chatCount,setChatCount]=useState(0);
  const [analyses,setAnalyses]=useState<{id:string;created_at:string;result:{firstName:string;secondName:string}}[]>([]);
  const [profiles,setProfiles]=useState<{display_name:string}[]>([]);
  useFocusEffect(useCallback(()=>{let active=true;void Promise.all([
    aiCall<{conversations:AiConversation[];total?:number;error?:string}>('list-conversations'),
    aiCall<{analyses:typeof analyses;error?:string}>('list-compatibility'),
    requireSupabase().from('birth_profiles').select('display_name').order('created_at'),
  ]).then(([ai,compatibility,people])=>{if(active){setChats(ai.conversations??[]);setChatCount(ai.total??ai.conversations.length);setAnalyses(compatibility.analyses??[]);setProfiles(people.data??[]);}}).catch(()=>{});return()=>{active=false};},[]));
  const show = (k: string) => f === 'All' || f === k;
  return (
    <AppScreen tab="profile" header={<AppBar brand />} pad={0} contentStyle={{ paddingTop: 4 }}>
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ fontFamily: F.serif, fontSize: 25, color: Colors.navy }}>My Favourites</Text>
        <Text style={{ fontFamily: F.r, fontSize: 11.5, color: Colors.navy, marginTop: 3, marginBottom: 12 }}>All your saved items in one place</Text>
        <View style={{ position: 'absolute', right: 26, top: -6 }}><Heart size={66} color="#3A479A" fill="#3A479A" strokeWidth={0} /></View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }} style={{ flexGrow: 0 }}>
        {['All', 'AI Chats', 'Reports', 'Profiles', 'Courses', 'Compatibility'].map(c => <Chip key={c} label={c} on={f === c} onPress={() => setF(c)} style={{ height: 34, paddingHorizontal: 18, borderRadius: 12 }} />)}
      </ScrollView>
      <View style={{ paddingHorizontal: 16, gap: 10, marginTop: 14 }}>
        {show('AI Chats') ? <Block icon={<MessagesSquare size={21} color={Colors.navy} />} title="Saved AI Conversations" sub={`${chatCount} saved conversations`} onPress={() => go('/ai/history')}>{chats[0]?<View style={{ flexDirection: 'row', gap: 10 }}><Thumb /><View><Text style={{ fontFamily: F.r, fontSize: 11, color: Colors.ink }}>{chats[0].title}</Text><Text style={{ fontFamily: F.r, fontSize: 10, color: Colors.slate, marginTop: 2 }}>{chats[0].module_id} · {new Date(chats[0].updated_at).toLocaleDateString()}</Text></View></View>:null}</Block> : null}
        {show('Reports') ? <Block icon={<FileText size={21} color={Colors.navy} />} title="Saved Reports" sub="6 saved reports" onPress={() => go('/reports/history')}><View style={{ flexDirection: 'row', gap: 10 }}><Thumb bg="#E3E8FB" /><View><Text style={{ fontFamily: F.m, fontSize: 11.5, color: Colors.navy }}>Career Analysis Report</Text><Text style={{ fontFamily: F.r, fontSize: 10, color: Colors.slate, marginTop: 2 }}>Generated · 5 Oct 2025</Text></View></View></Block> : null}
        {show('Profiles') ? <Block icon={<UsersRound size={21} color={Colors.navy} />} title="Saved Astrology Profiles" sub={`${profiles.length} saved profiles`} onPress={() => go('/profiles')}>{profiles.length?<View style={{ flexDirection: 'row', gap: 14 }}>{profiles.slice(0,3).map(person => <View key={person.display_name} style={{ alignItems: 'center', gap: 3 }}><Avatar name={person.display_name} size={36} /><Text numberOfLines={1} style={{ fontFamily: F.r, fontSize: 9, color: Colors.slate,maxWidth:60 }}>{person.display_name}</Text></View>)}{profiles.length>3?<View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#ECE6F8', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: F.m, fontSize: 10, color: Colors.navy }}>+{profiles.length-3}</Text></View>:null}</View>:null}</Block> : null}
        {show('Compatibility') ? <Block icon={<Heart size={21} color={Colors.navy} />} title="Saved Compatibility Analyses" sub={`${analyses.length} saved analyses`} onPress={() => go('/compatibility')}>{analyses[0]?<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><Avatar name={analyses[0].result.firstName} size={34} /><Avatar name={analyses[0].result.secondName} size={34} /><View><Text style={{ fontFamily: F.m, fontSize: 11.5, color: Colors.navy }}>{analyses[0].result.firstName} &amp; {analyses[0].result.secondName}</Text><Text style={{ fontFamily: F.r, fontSize: 10, color: Colors.slate }}>{new Date(analyses[0].created_at).toLocaleDateString()}</Text></View></View>:null}</Block> : null}
        {show('Courses') ? <Block icon={<GraduationCap size={21} color={Colors.navy} />} title="Saved Courses" sub="4 saved courses" onPress={() => go('/courses/mine')}><Text style={{ fontFamily: F.m, fontSize: 11.5, color: Colors.navy }}>Vedic Astrology for Beginners</Text><Text style={{ fontFamily: F.r, fontSize: 10, color: Colors.slate, marginTop: 2, marginBottom: 6 }}>50% completed</Text><Progress value={50} height={5} /></Block> : null}
      </View>
    </AppScreen>
  );
}
