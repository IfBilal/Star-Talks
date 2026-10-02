import { Check, ChevronRight, Ellipsis, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, Avatar, Button, Card, F, go, Pill, Sheet } from '@/components/ui';
import { PEOPLE, REL_TYPES } from '@/features/uiData/profiles';
import { Colors } from '@/constants/theme';

export default function MyProfiles() {
  const [rel, setRel] = useState('Self');
  const [sel, setSel] = useState('neha');
  const [menu, setMenu] = useState<string | null>(null);
  const list = PEOPLE.filter(p => rel === 'Self' || p.rel === rel || rel === 'All');
  return (
    <AppScreen
      tab="profile"
      header={<AppBar brand />}
      footer={<View style={{ paddingHorizontal: 18, paddingBottom: 8 }}><Button title="Add New Profile" height={50} style={{ borderRadius: 14 }} icon={<Plus size={19} color="#fff" />} onPress={() => go('/profiles/new')} /></View>}
      contentStyle={{ paddingTop: 4 }}
    >
      <Text style={{ fontFamily: F.s, fontSize: 22, color: Colors.navy }}>My Profiles</Text>
      <Text style={{ fontFamily: F.r, fontSize: 11.5, color: Colors.navy, marginTop: 3, marginBottom: 14 }}>Manage your family and other profiles for personalized readings.</Text>
      <View style={{ flexDirection: 'row', gap: 7 }}>
        {REL_TYPES.map(t => {
          const on = rel === t.id;
          return (
            <Pressable key={t.id} accessibilityRole="button" onPress={() => setRel(t.id)} style={{ flex: 1, height: on ? 84 : 78, borderRadius: 14, backgroundColor: '#FFFDFB', borderWidth: 1, borderColor: '#F0EAF3', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <View style={{ width: on ? 46 : 40, height: on ? 46 : 40, borderRadius: 23, backgroundColor: on ? '#4B4FAE' : '#EDE8F8', alignItems: 'center', justifyContent: 'center' }}>{t.icon(on ? '#fff' : Colors.navy, 19)}</View>
              <Text style={{ fontFamily: F.s, fontSize: 9.5, color: Colors.navy }}>{t.id}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ gap: 9, marginTop: 14 }}>
        {(rel === 'Self' ? PEOPLE : list).map(p => (
          <Card key={p.id} onPress={() => { setSel(p.id); }} tint={sel === p.id ? '#EEE8FA' : undefined} style={{ borderRadius: 15, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={p.name} size={52} bg={p.rel === 'Family' ? '#F7E8D4' : '#E6E0F6'} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.s, fontSize: 13, color: Colors.navy }}>{p.name}</Text>
              <Pill style={{ marginTop: 3 }} bg="#F5F1F7" color={Colors.slate}>{p.rel}</Pill>
              <Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate, marginTop: 4 }}>{`${p.dob}  •  ${p.time}  •  ${p.place}`}</Text>
            </View>
            <Pressable hitSlop={10} onPress={() => setMenu(p.id)} accessibilityLabel="More"><Ellipsis size={18} color={Colors.navy} /></Pressable>
            {sel === p.id ? <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#4B4FAE', alignItems: 'center', justifyContent: 'center' }}><Check size={13} color="#fff" strokeWidth={3} /></View> : <ChevronRight size={18} color={Colors.navy} />}
          </Card>
        ))}
      </View>
      <Sheet visible={menu !== null} onClose={() => setMenu(null)} title="Profile options" items={[
        { label: 'Edit profile', onPress: () => go('/profiles/new') },
        { label: 'Use for AI reading', onPress: () => go('/ai') },
        { label: 'Use for report', onPress: () => go('/reports/birth-details') },
        { label: 'Use for compatibility', onPress: () => go('/compatibility') },
        { label: 'Delete profile', danger: true, onPress: () => go('/settings/delete/profiles') },
      ]} />
    </AppScreen>
  );
}
