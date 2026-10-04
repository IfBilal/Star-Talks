import { Check, ChevronRight, Ellipsis, Plus } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, Avatar, Button, Card, F, go, Pill, Sheet } from '@/components/ui';
import { REL_TYPES } from '@/features/uiData/profiles';
import { Colors } from '@/constants/theme';
import { requireSupabase } from '@/lib/supabase';

type BirthProfile = {
  id: string; display_name: string; relationship: string; birth_date: string;
  birth_time: string | null; place_label: string;
};

const labelFor = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function MyProfiles() {
  const [rel, setRel] = useState('Self');
  const [selected, setSelected] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setMessage('');
    try {
      const db = requireSupabase();
      const { data: { user }, error: authError } = await db.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Please sign in again.');
      const { data, error } = await db.from('birth_profiles')
        .select('id,display_name,relationship,birth_date,birth_time,place_label')
        .eq('user_id', user.id).order('created_at', { ascending: true });
      if (error) throw error;
      setProfiles((data ?? []) as BirthProfile[]);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to load profiles.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const filtered = rel === 'Self' || rel === 'All' ? profiles : profiles.filter(p => labelFor(p.relationship) === rel);
  const active = profiles.find(p => p.id === menu);
  const remove = (profile: BirthProfile) => {
    if (profile.relationship === 'self') { setMessage('Your main birth profile can be edited but cannot be deleted here.'); return; }
    Alert.alert('Delete profile?', `Delete ${profile.display_name} and its saved readings?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void (async () => {
        const { error } = await requireSupabase().from('birth_profiles').delete().eq('id', profile.id);
        if (error) setMessage(error.message); else await load();
      })() },
    ]);
  };

  return <AppScreen tab="profile" header={<AppBar brand />}
    footer={<View style={{ paddingHorizontal: 18, paddingBottom: 8 }}><Button title="Add New Profile" height={50} style={{ borderRadius: 14 }} icon={<Plus size={19} color="#fff" />} onPress={() => go('/profiles/new')} /></View>}
    contentStyle={{ paddingTop: 4 }}>
    <Text style={{ fontFamily: F.s, fontSize: 22, color: Colors.navy }}>My Profiles</Text>
    <Text style={{ fontFamily: F.r, fontSize: 11.5, color: Colors.navy, marginTop: 3, marginBottom: 14 }}>Manage your family and other profiles for personalized readings.</Text>
    <View style={{ flexDirection: 'row', gap: 7 }}>
      {REL_TYPES.map(t => {
        const on = rel === t.id;
        return <Pressable key={t.id} accessibilityRole="button" onPress={() => setRel(t.id)} style={{ flex: 1, height: on ? 84 : 78, borderRadius: 14, backgroundColor: '#FFFDFB', borderWidth: 1, borderColor: '#F0EAF3', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <View style={{ width: on ? 46 : 40, height: on ? 46 : 40, borderRadius: 23, backgroundColor: on ? '#4B4FAE' : '#EDE8F8', alignItems: 'center', justifyContent: 'center' }}>{t.icon(on ? '#fff' : Colors.navy, 19)}</View>
          <Text style={{ fontFamily: F.s, fontSize: 9.5, color: Colors.navy }}>{t.id}</Text>
        </Pressable>;
      })}
    </View>
    {message ? <Text accessibilityRole="alert" style={{ fontFamily: F.r, color: Colors.danger, fontSize: 11, marginTop: 10 }}>{message}</Text> : null}
    <View style={{ gap: 9, marginTop: 14 }}>
      {filtered.map(p => <Card key={p.id} onPress={() => setSelected(p.id)} tint={selected === p.id ? '#EEE8FA' : undefined} style={{ borderRadius: 15, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={p.display_name} size={52} bg={p.relationship === 'family' ? '#F7E8D4' : '#E6E0F6'} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.s, fontSize: 13, color: Colors.navy }}>{p.display_name}</Text>
          <Pill style={{ marginTop: 3 }} bg="#F5F1F7" color={Colors.slate}>{labelFor(p.relationship)}</Pill>
          <Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate, marginTop: 4 }}>{`${p.birth_date}  •  ${p.birth_time?.slice(0, 5) ?? 'Unknown time'}  •  ${p.place_label}`}</Text>
        </View>
        <Pressable hitSlop={10} onPress={() => setMenu(p.id)} accessibilityLabel={`Options for ${p.display_name}`}><Ellipsis size={18} color={Colors.navy} /></Pressable>
        {selected === p.id ? <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#4B4FAE', alignItems: 'center', justifyContent: 'center' }}><Check size={13} color="#fff" strokeWidth={3} /></View> : <ChevronRight size={18} color={Colors.navy} />}
      </Card>)}
      {!loading && profiles.length === 0 ? <Text style={{ fontFamily: F.r, fontSize: 12, color: Colors.slate, textAlign: 'center', marginTop: 22 }}>No birth profiles yet. Add one to personalize readings.</Text> : null}
      {loading ? <Text style={{ fontFamily: F.r, fontSize: 11, color: Colors.slate }}>Loading profiles…</Text> : null}
    </View>
    <Sheet visible={menu !== null} onClose={() => setMenu(null)} title="Profile options" items={[
      { label: 'Edit profile', onPress: () => active && router.push({ pathname: '/profiles/new', params: { id: active.id } }) },
      { label: 'Use for AI reading', onPress: () => active && router.push({ pathname: '/ai', params: { profileId: active.id } }) },
      { label: 'Use for compatibility', onPress: () => go('/compatibility') },
      { label: 'Delete profile', danger: true, onPress: () => active && remove(active) },
    ]} />
  </AppScreen>;
}
