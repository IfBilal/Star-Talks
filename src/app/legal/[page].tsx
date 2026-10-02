import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Card, F, Toggle } from '@/components/ui';
import { Colors } from '@/constants/theme';

const pages: Record<string, { title: string; sections: [string, string][] }> = {
  privacy: { title: 'Privacy Policy', sections: [['What we collect', 'Your name, email, birth date, time and place, and any photos you choose to upload for a reading.'], ['How we use it', 'Only to create charts, readings and reports for you, and to run your account. We never sell your data.'], ['Your rights', 'You can view, export or delete your data at any time from Account Settings.']] },
  terms: { title: 'Terms & Conditions', sections: [['Using Star Talks', 'Readings are for guidance and entertainment and are not guaranteed predictions or professional advice.'], ['Credits and payments', 'One submitted question uses one AI credit. Failed responses are never charged.'], ['Your account', 'Keep your login secure. You can delete your account at any time.']] },
  data: { title: 'Data Protection', sections: [['How your data is stored', 'Birth details, images and conversations are encrypted in transit and at rest.'], ['Who can see it', 'Only you. Support staff can see a ticket only when you send one.'], ['Deletion', 'Deleted items are removed from active systems immediately and from backups within 30 days.']] },
};

export default function Legal() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const [c, setC] = useState({ personal: true, photos: true, analytics: false, marketing: false });
  if (page === 'consent') {
    const rows: [keyof typeof c, string, string][] = [['personal', 'Personal & birth details', 'Needed to calculate your charts and readings.'], ['photos', 'Palm & face photos', 'Used only for the Palmistry and Face Reading modules.'], ['analytics', 'Usage analytics', 'Helps us improve the app. Anonymous.'], ['marketing', 'Offers & promotions', 'Personalised offers by notification or email.']];
    return (
      <AppScreen header={<AppBar title="Consent Management" />} contentStyle={{ paddingTop: 6 }}>
        <Text style={{ fontFamily: F.r, fontSize: 11.5, lineHeight: 18, color: Colors.slate, marginBottom: 12 }}>Choose how your information is used. You can change this at any time.</Text>
        <Card style={{ borderRadius: 14 }}>
          {rows.map(([k, t, s], i) => (
            <View key={k} style={{ minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderBottomColor: '#EFEBF6' }}>
              <View style={{ flex: 1 }}><Text style={{ fontFamily: F.s, fontSize: 12.5, color: Colors.navy }}>{t}</Text><Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate, marginTop: 2 }}>{s}</Text></View>
              <Toggle value={c[k]} onChange={v => setC(p => ({ ...p, [k]: v }))} />
            </View>
          ))}
        </Card>
      </AppScreen>
    );
  }
  const p = pages[page] ?? pages.privacy;
  return (
    <AppScreen header={<AppBar title={p.title} />} contentStyle={{ paddingTop: 6 }}>
      <View style={{ gap: 14 }}>
        {p.sections.map(([h, b]) => (
          <Card key={h} style={{ borderRadius: 14, padding: 16 }}>
            <Text style={{ fontFamily: F.s, fontSize: 13, color: Colors.navy }}>{h}</Text>
            <Text style={{ fontFamily: F.r, fontSize: 12, lineHeight: 19, color: Colors.ink, marginTop: 6 }}>{b}</Text>
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}
