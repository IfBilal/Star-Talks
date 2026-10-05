import { useTheme } from '@/lib/theme-context';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppBar, AppScreen, Card, F, SearchBar } from '@/components/ui';

const faqs = [
  ['How do AI credits work?', 'Each question you submit uses 1 AI credit. Clarifying questions and suggested follow-ups do not use a credit until you send them. If an answer fails, your credit is restored automatically.'],
  ['How do I earn free credits?', 'Watch up to 5 ads a day from the Earn Credits screen. Each completed ad adds 1 free credit and the counter resets every day.'],
  ['Can I get a refund?', 'Yes. Refunds for failed services are returned to your wallet. Open Help & Support and create a ticket for anything else.'],
  ['How is my birth chart calculated?', 'We use your exact date, time and place of birth with historical time-zone and daylight-saving rules so the chart is accurate.'],
  ['How do I delete my data?', 'Go to Profile → Account Settings → Data & Privacy to delete conversations, saved profiles or your whole account.'],
];

export default function Faqs() {
  const { Colors: palette, themed } = useTheme();

  const [open, setOpen] = useState(0);
  const [q, setQ] = useState('');
  return (
    <AppScreen header={<AppBar title="FAQs" />} contentStyle={{ paddingTop: 4 }}>
      <SearchBar placeholder="Search questions..." value={q} onChangeText={setQ} style={{ height: 46, borderRadius: 14 }} />
      <View style={{ gap: 8, marginTop: 14 }}>
        {faqs.filter(([a]) => a.toLowerCase().includes(q.toLowerCase())).map(([a, b], i) => (
          <Card key={a} style={{ borderRadius: 14 }}>
            <Pressable onPress={() => setOpen(open === i ? -1 : i)} style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 }}>
              <Text style={{ flex: 1, fontFamily: F.s, fontSize: 12.5, color: palette.navy }}>{a}</Text>
              {open === i ? <ChevronUp size={17} color={palette.navy} /> : <ChevronDown size={17} color={palette.navy} />}
            </Pressable>
            {open === i ? <Text style={{ paddingHorizontal: 14, paddingBottom: 14, fontFamily: F.r, fontSize: 11.5, lineHeight: 18, color: themed('#3B4373', 'foreground') }}>{b}</Text> : null}
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}
