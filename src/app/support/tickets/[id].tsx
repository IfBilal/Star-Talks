import { useTheme } from '@/lib/theme-context';
import { useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBar, Button, F, Pill } from '@/components/ui';

export default function TicketDetail() {
  const { Colors: palette, themed } = useTheme();

  const { id } = useLocalSearchParams<{ id: string }>();
  const [resolved, setResolved] = useState(id !== '4521');
  const [msgs, setMsgs] = useState([
    { mine: true, text: 'My course payment was deducted twice. Please help.' },
    { mine: false, text: 'Sorry about that! We are checking the duplicate charge and will refund it to your wallet.' },
  ]);
  const [text, setText] = useState('');
  return (
    <View style={{ flex: 1, backgroundColor: palette.ivory }}>
      <SafeAreaView edges={['top']}><AppBar title={`Ticket #${id}`} right={<Pill bg={themed(resolved ? '#DCEFE5' : '#E3E8FB', 'surface')} color={themed(resolved ? '#2B7A52' : '#3F58B0', 'foreground')}>{resolved ? 'Resolved' : 'In progress'}</Pill>} /></SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }} style={{ flex: 1 }}>
        {msgs.map((m, i) => (
          <View key={i} style={{ alignSelf: m.mine ? 'flex-end' : 'flex-start', maxWidth: '82%', borderRadius: 16, backgroundColor: themed(m.mine ? '#E9E3FB' : '#fff', 'surface'), borderWidth: m.mine ? 0 : 1, borderColor: themed('#EFEAF5', 'border'), paddingHorizontal: 14, paddingVertical: 10 }}>
            <Text style={{ fontFamily: F.r, fontSize: 12, lineHeight: 18, color: palette.ink }}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>
      <SafeAreaView edges={['bottom']}>
        {resolved ? <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}><Button title="Reopen Ticket" variant="outline" height={48} onPress={() => setResolved(false)} /></View> : (
          <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingBottom: 10 }}>
            <View style={{ flex: 1, height: 48, borderRadius: 24, backgroundColor: themed('#fff', 'surface'), borderWidth: 1, borderColor: themed('#EFEAF5', 'border'), paddingHorizontal: 18, justifyContent: 'center' }}>
              <TextInput selectionColor={palette.lavender} value={text} onChangeText={setText} placeholder="Reply to support..." placeholderTextColor={themed("#9AA0B8", 'foreground')} style={{ fontFamily: F.r, fontSize: 12.5, color: palette.ink, paddingVertical: 0 }} />
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Send" onPress={() => { if (text.trim()) { setMsgs(m => [...m, { mine: true, text: text.trim() }]); setText(''); } }} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: themed('#6B63C4', 'surface'), alignItems: 'center', justifyContent: 'center' }}><Send size={18} color={themed("#fff", 'foreground')} /></Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
