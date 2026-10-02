import { useLocalSearchParams } from 'expo-router';
import { Camera, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { AppBar, AppScreen, BellButton, Button, F, replace, Sheet, Stepper, Type } from '@/components/ui';
import { Colors } from '@/constants/theme';

const cats = ['Payment issue', 'Refund issue', 'AI issue', 'Account issue', 'Technical issue', 'Course issue', 'Report issue', 'Other'];

export default function NewTicket() {
  const { c } = useLocalSearchParams<{ c?: string }>();
  const [cat, setCat] = useState(c ?? 'Payment issue');
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  return (
    <AppScreen header={<AppBar brand dark right={<BellButton dark />} />} contentStyle={{ paddingTop: 10 }}>
      <Text style={[Type.h1, { fontSize: 17, marginBottom: 12 }]}>Create Support Ticket</Text>
      <Stepper steps={['Select Issue', 'Details', 'Submit']} current={0} />
      <Text style={[Type.section, { marginTop: 4, marginBottom: 8 }]}>Issue Category</Text>
      <Pressable onPress={() => setOpen(true)} style={{ height: 46, borderRadius: 10, borderWidth: 1, borderColor: '#E6E1EF', backgroundColor: '#fff', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: F.r, fontSize: 12, color: Colors.ink }}>{cat}</Text><ChevronDown size={16} color={Colors.navy} />
      </Pressable>
      <Text style={[Type.section, { marginTop: 18, marginBottom: 8 }]}>Description</Text>
      <View style={{ height: 130, borderRadius: 10, borderWidth: 1, borderColor: '#E6E1EF', backgroundColor: '#fff', padding: 12 }}>
        <TextInput value={text} onChangeText={t => setText(t.slice(0, 500))} multiline placeholder="Describe your issue in detail..." placeholderTextColor="#9AA0B8" style={{ flex: 1, fontFamily: F.r, fontSize: 12, color: Colors.ink, textAlignVertical: 'top' }} />
        <Text style={{ alignSelf: 'flex-end', fontFamily: F.r, fontSize: 9.5, color: Colors.slate }}>{`${text.length}/500`}</Text>
      </View>
      <Text style={{ fontFamily: F.s, fontSize: 12, color: Colors.navy, marginTop: 18, marginBottom: 8 }}>Attach Screenshot <Text style={{ fontFamily: F.r, color: Colors.slate }}>(Optional)</Text></Text>
      <Pressable accessibilityRole="button" style={{ height: 120, borderRadius: 12, borderWidth: 1.2, borderStyle: 'dashed', borderColor: '#D3CFDB', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Camera size={22} color={Colors.navy} strokeWidth={1.6} /><Text style={{ fontFamily: F.m, fontSize: 11.5, color: Colors.navy }}>Add image</Text>
      </Pressable>
      <Button title="Submit Ticket" height={50} style={{ borderRadius: 12, marginTop: 24 }} onPress={() => replace('/support/tickets')} />
      <Sheet visible={open} onClose={() => setOpen(false)} title="Issue Category" items={cats.map(x => ({ label: x, onPress: () => setCat(x) }))} />
    </AppScreen>
  );
}
