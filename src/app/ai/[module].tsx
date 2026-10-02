import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { ArrowLeft, EllipsisVertical, Gem, Send, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { back, Button, Card, Chip, go, IconTile, Sheet } from '@/components/ui';
import { TarotCard } from '@/components/ui/icons';
import { moduleById, type ModuleUi } from '@/features/uiData/ai';
import { Colors } from '@/constants/theme';

type Msg =
  | { kind: 'first' }
  | { kind: 'user'; text: string }
  | { kind: 'answer'; text: string; bullets?: { head: string; items?: string[]; text?: string }[] }
  | { kind: 'cards' }
  | { kind: 'protect'; module: string }
  | { kind: 'followup'; text: string; chips: string[] };

const REASONS = ['Too generic', 'Did not answer question', 'Incorrect interpretation', 'Did not understand question', 'Too long', 'Too short', 'Other'];

function vedicAnswer(): Msg[] {
  return [
    { kind: 'user', text: 'Will I get a promotion this year?' },
    {
      kind: 'answer',
      text: 'Based on your Vedic chart, a promotion is likely in the second half of 2026, especially between August and November. The Jupiter transit in your 10th house supports career growth, and your dasha also favors recognition during this period.',
      bullets: [
        { head: 'Supporting factors:', items: ['Jupiter in 10th house (career growth)', 'Current dasha aligns with professional gains', 'Strong Mercury (communication & leadership)'] },
        { head: 'Possible delay:', text: "Early 2026 may feel slow due to Saturn's influence in your 6th house (work pressures)." },
      ],
    },
    { kind: 'followup', text: 'Would you like me to check the most favorable months or explore your career in more detail?', chips: ['Best Months', 'Career Details', 'More'] },
  ];
}

function initial(m: ModuleUi, view?: string): Msg[] {
  if (view === 'answer') {
    if (m.id === 'vedic') return vedicAnswer();
    return [
      { kind: 'user', text: 'What should I focus on this year?' },
      { kind: 'answer', text: `Based on your ${m.name} reading, the coming months favour steady progress. Focus on one priority at a time and avoid rushing big decisions.`, bullets: [{ head: 'Supporting factors:', items: m.insights.slice(0, 3).map(i => `${i.title}: ${i.text}`) }] },
      { kind: 'followup', text: m.question, chips: m.chips },
    ];
  }
  if (view === 'cards' && m.id === 'tarot') return [{ kind: 'cards' }, { kind: 'followup', text: 'Would you like to know when this positive shift might happen?', chips: ['Timing', 'Love', 'Career'] }];
  if (view === 'protect') return [{ kind: 'user', text: 'Can you tell me my Vedic dasha?' }, { kind: 'protect', module: m.name }];
  return [{ kind: 'first' }];
}

function Bubble({ children, mine, style }: { children: React.ReactNode; mine?: boolean; style?: object }) {
  return (
    <View style={[{ borderRadius: 16, backgroundColor: mine ? '#E9E3FB' : '#F1EDFB', paddingHorizontal: 14, paddingVertical: 11 }, mine ? { alignSelf: 'flex-end', maxWidth: '84%' } : { borderTopLeftRadius: 4 }, style]}>{children}</View>
  );
}

const Avatar = () => <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#E6DFF7', alignItems: 'center', justifyContent: 'center' }}><Gem size={15} color="#5B4FB0" strokeWidth={1.8} /></View>;
const body = { fontFamily: 'Poppins_400Regular', fontSize: 11.8, lineHeight: 18.5, color: '#2B3270' } as const;

export default function AiChat() {
  const { module: id, view } = useLocalSearchParams<{ module: string; view?: string }>();
  const m = moduleById(id);
  const [msgs, setMsgs] = useState<Msg[]>(() => initial(m, view));
  const [text, setText] = useState('');
  const [menu, setMenu] = useState(false);
  const [fb, setFb] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const scroll = useRef<ScrollView>(null);

  const send = (q: string) => {
    const question = q.trim();
    if (!question) return;
    const next: Msg[] = [{ kind: 'user', text: question }];
    if (m.id !== 'vedic' && /dasha/i.test(question)) next.push({ kind: 'protect', module: m.name });
    else next.push({ kind: 'answer', text: `Here is what I see in your ${m.name} reading: ${m.insights[0].text} ${m.insights[1].text}` }, { kind: 'followup', text: m.question, chips: m.chips });
    setMsgs(prev => [...prev, ...next]);
    setText('');
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 80);
  };

  const Chips = ({ items }: { items: string[] }) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginLeft: 42, marginTop: 10 }}>
      {items.map(c => <Chip key={c} label={c} onPress={() => send(c)} style={{ height: 34, paddingHorizontal: 15, borderRadius: 17, backgroundColor: '#fff', borderColor: '#D9D4EC' }} />)}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FCF7F3' }}>
      <LinearGradient colors={['#E6DDF6', '#F3EDF8', '#FCF7F3']} style={{ paddingBottom: 6 }}>
        <SafeAreaView edges={['top']}>
          <View style={{ height: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}>
            <Pressable onPress={back} hitSlop={10} accessibilityLabel="Back" accessibilityRole="button"><ArrowLeft size={21} color={Colors.navy} /></Pressable>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: Colors.navy }}>{m.name.replace(' Astrology', m.id === 'vedic' || m.id === 'western' ? ' Astrology' : '')}</Text>
            <View style={{ height: 24, paddingHorizontal: 11, borderRadius: 12, backgroundColor: '#5B54B5', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 9.5, color: '#fff' }}>{m.badge}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Pressable onPress={() => setMenu(true)} hitSlop={10} accessibilityLabel="More" accessibilityRole="button"><EllipsisVertical size={18} color={Colors.navy} /></Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroll} contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 4, paddingBottom: 14 }} showsVerticalScrollIndicator={false}>
          {msgs.map((msg, idx) => {
            if (msg.kind === 'first') {
              return (
                <View key={idx}>
                  <Card style={{ borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8E9D6', alignItems: 'center', justifyContent: 'center' }}>{m.icon('#9A6A35', 20)}</View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: m.readingSub ? 15.5 : 13.5, color: m.titleColor ?? Colors.navy }}>{m.readingTitle}</Text>
                      {m.readingSub ? <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11.5, color: Colors.navy, marginTop: 1 }}>{m.readingSub}</Text> : null}
                    </View>
                  </Card>
                  <View style={{ gap: 7, marginTop: 7 }}>
                    {m.insights.map(ins => (
                      <Card key={ins.title} style={{ borderRadius: 14, padding: 13, flexDirection: 'row', gap: 12 }}>
                        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#F8EBDA', alignItems: 'center', justifyContent: 'center' }}>{ins.icon('#8A5A2B')}</View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 11.8, color: Colors.navy }}>{ins.title}</Text>
                          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 10.8, lineHeight: 16.5, color: '#4A5590', marginTop: 2 }}>{ins.text}</Text>
                        </View>
                      </Card>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                    <Avatar />
                    <Bubble style={{ flex: 1 }}>
                      <Text style={body}>{m.question}</Text>
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 9.5, color: Colors.slate, marginTop: 6 }}>(Consumes 1 AI credit)</Text>
                    </Bubble>
                  </View>
                  <Chips items={m.chips} />
                </View>
              );
            }
            if (msg.kind === 'user') return <Bubble key={idx} mine style={{ marginTop: 10 }}><Text style={{ ...body, color: Colors.navy }}>{msg.text}</Text></Bubble>;
            if (msg.kind === 'answer') {
              return (
                <View key={idx} style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  <Avatar />
                  <Bubble style={{ flex: 1 }}>
                    <Text style={body}>{msg.text}</Text>
                    {msg.bullets?.map(b => (
                      <View key={b.head} style={{ marginTop: 8 }}>
                        <Text style={{ ...body, fontFamily: 'Poppins_600SemiBold', color: Colors.navy }}>{b.head}</Text>
                        {b.items?.map(it => <Text key={it} style={{ ...body, marginTop: 1 }}>{'•  '}{it}</Text>)}
                        {b.text ? <Text style={body}>{b.text}</Text> : null}
                      </View>
                    ))}
                    <View style={{ flexDirection: 'row', gap: 14, marginTop: 10 }}>
                      <Pressable hitSlop={8} accessibilityLabel="Helpful" onPress={() => { setVote('up'); }}><ThumbsUp size={15} color={vote === 'up' ? Colors.primaryFrom : Colors.slate} fill={vote === 'up' ? Colors.primaryFrom : 'none'} /></Pressable>
                      <Pressable hitSlop={8} accessibilityLabel="Not helpful" onPress={() => { setVote('down'); setFb(true); }}><ThumbsDown size={15} color={vote === 'down' ? Colors.danger : Colors.slate} /></Pressable>
                    </View>
                  </Bubble>
                </View>
              );
            }
            if (msg.kind === 'followup') {
              return (
                <View key={idx}>
                  <View style={{ flexDirection: 'row', marginTop: 8, marginLeft: 42 }}>
                    <Bubble style={{ flex: 1, maxWidth: undefined }}>
                      <Text style={body}>{msg.text}</Text>
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 9.5, color: Colors.slate, marginTop: 6 }}>(Consumes 1 AI credit)</Text>
                    </Bubble>
                  </View>
                  <Chips items={msg.chips} />
                </View>
              );
            }
            if (msg.kind === 'cards') {
              return (
                <View key={idx} style={{ marginTop: 6 }}>
                  <Card style={{ borderRadius: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    <TarotCard kind="star" width={88} /><TarotCard kind="moon" width={88} /><TarotCard kind="sun" width={88} />
                  </Card>
                  <Text style={{ ...body, marginTop: 14, paddingHorizontal: 4, color: '#3A4585' }}>Your cards suggest a period of change and healing. The Star brings hope, The Moon highlights emotions, and The Sun shows a positive outcome.</Text>
                </View>
              );
            }
            return (
              <View key={idx} style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <Avatar />
                <Card style={{ flex: 1, borderRadius: 16, padding: 16 }}>
                  <Text style={body}>{`That's a great question! However, I am currently in the ${msg.module} module, which focuses on ${m.id === 'tarot' ? 'card readings and tarot interpretation' : 'its own methodology'}.`}</Text>
                  <View style={{ height: 1, backgroundColor: '#EFEBF6', marginVertical: 12 }} />
                  <Text style={body}>For Vedic dasha and planetary periods, please switch to the Vedic Astrology module.</Text>
                  <Button title="Switch to Vedic Astrology" height={42} style={{ borderRadius: 8, marginTop: 14 }} onPress={() => go('/ai/vedic')} />
                  <Pressable onPress={() => go('/ai/modules')} style={{ alignSelf: 'center', marginTop: 12 }}><Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: Colors.navy, textDecorationLine: 'underline' }}>Learn more about Vedic Astrology</Text></Pressable>
                </Card>
              </View>
            );
          })}
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#FCF7F3' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingBottom: 10, paddingTop: 4 }}>
            <View style={{ flex: 1, height: 48, borderRadius: 24, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EFEAF5', paddingHorizontal: 18, justifyContent: 'center' }}>
              <TextInput value={text} onChangeText={setText} onSubmitEditing={() => send(text)} placeholder="Ask a question..." placeholderTextColor="#9AA0B8" returnKeyType="send" style={{ fontFamily: 'Poppins_400Regular', fontSize: 12.5, color: Colors.ink, paddingVertical: 0 }} />
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Send" onPress={() => send(text)} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#6B63C4', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} color="#fff" strokeWidth={1.9} style={{ marginLeft: -2 }} />
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <Sheet visible={menu} onClose={() => setMenu(false)} items={[
        { label: 'Rename conversation' },
        { label: 'Save conversation' },
        { label: 'Give feedback', onPress: () => setFb(true) },
        { label: 'Conversation history', onPress: () => go('/ai/history') },
        { label: 'Switch module', onPress: () => go('/ai/modules') },
        { label: 'Report a response', danger: true, onPress: () => setFb(true) },
        { label: 'Delete conversation', danger: true },
      ]} />
      <Sheet visible={fb} onClose={() => setFb(false)} title="How was this response?">
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <Button title="Helpful" variant={vote === 'up' ? 'primary' : 'light'} height={42} style={{ flex: 1 }} icon={<ThumbsUp size={15} color={vote === 'up' ? '#fff' : Colors.navy} />} onPress={() => setVote('up')} />
          <Button title="Not helpful" variant={vote === 'down' ? 'primary' : 'light'} height={42} style={{ flex: 1 }} icon={<ThumbsDown size={15} color={vote === 'down' ? '#fff' : Colors.navy} />} onPress={() => setVote('down')} />
        </View>
        <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 12, color: Colors.navy, marginBottom: 8 }}>What went wrong?</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {REASONS.map(r => <Chip key={r} label={r} on={reasons.includes(r)} onPress={() => setReasons(p => (p.includes(r) ? p.filter(x => x !== r) : [...p, r]))} />)}
        </View>
        <Button title="Submit feedback" height={46} onPress={() => setFb(false)} />
        <Pressable onPress={() => setFb(false)} style={{ alignItems: 'center', paddingTop: 14 }}><Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 12, color: Colors.danger }}>Report this response</Text></Pressable>
      </Sheet>
    </View>
  );
}
