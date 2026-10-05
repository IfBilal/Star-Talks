import { useTheme } from '@/lib/theme-context';
import { Send } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBar, F } from '@/components/ui';

export default function SupportChat() {
  const { Colors: palette, themed } = useTheme();

  const [msgs, setMsgs] = useState([{ mine: false, text: 'Hi! You are chatting with Star Talks Support. How can we help you today?' }]);
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    setMsgs(m => [...m, { mine: true, text: text.trim() }, { mine: false, text: 'Thanks! A support team member will reply here shortly.' }]);
    setText('');
  };
  return (
    <View style={{ flex: 1, backgroundColor: palette.ivory }}>
      <SafeAreaView edges={['top']}><AppBar title="Live Chat" /></SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }} style={{ flex: 1 }}>
        {msgs.map((m, i) => (
          <View key={i} style={{ alignSelf: m.mine ? 'flex-end' : 'flex-start', maxWidth: '82%', borderRadius: 16, backgroundColor: themed(m.mine ? '#E9E3FB' : '#fff', 'surface'), borderWidth: m.mine ? 0 : 1, borderColor: themed('#EFEAF5', 'border'), paddingHorizontal: 14, paddingVertical: 10 }}>
            <Text style={{ fontFamily: F.r, fontSize: 12, lineHeight: 18, color: palette.ink }}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>
      <SafeAreaView edges={['bottom']}>
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingBottom: 10 }}>
          <View style={{ flex: 1, height: 48, borderRadius: 24, backgroundColor: themed('#fff', 'surface'), borderWidth: 1, borderColor: themed('#EFEAF5', 'border'), paddingHorizontal: 18, justifyContent: 'center' }}>
            <TextInput selectionColor={palette.lavender} value={text} onChangeText={setText} onSubmitEditing={send} placeholder="Type a message..." placeholderTextColor={themed("#9AA0B8", 'foreground')} style={{ fontFamily: F.r, fontSize: 12.5, color: palette.ink, paddingVertical: 0 }} />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Send" onPress={send} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: themed('#6B63C4', 'surface'), alignItems: 'center', justifyContent: 'center' }}><Send size={18} color={themed("#fff", 'foreground')} /></Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
