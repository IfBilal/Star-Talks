import { useLocalSearchParams } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AppBar, AppScreen, Button, Card, F, back } from '@/components/ui';
import { Colors } from '@/constants/theme';

const copy: Record<string, { title: string; head: string; body: string; action: string; danger?: boolean }> = {
  conversations: { title: 'Delete AI Conversations', head: 'Clear your AI chat history?', body: 'All your conversations with every AI module will be permanently removed. Your credits and reports are not affected.', action: 'Delete All Conversations' },
  profiles: { title: 'Delete Saved Profiles', head: 'Remove saved profiles?', body: 'Family, partner and friend profiles will be removed, along with any photos attached to them. Your own profile stays.', action: 'Delete Saved Profiles' },
  account: { title: 'Delete Account', head: 'Permanently delete your account?', body: 'Your profile, birth details, reports, conversations and wallet balance will be erased and cannot be recovered.', action: 'Delete My Account', danger: true },
  request: { title: 'Data Deletion Request', head: 'Request removal of your data', body: 'We will review your request and confirm by email within 30 days. You can keep using the app while your request is processed.', action: 'Submit Request' },
};

export default function DeleteConfirm() {
  const { kind } = useLocalSearchParams<{ kind: string }>();
  const c = copy[kind] ?? copy.conversations;
  const [done, setDone] = useState(false);
  return (
    <AppScreen header={<AppBar title={c.title} />} contentStyle={{ paddingTop: 20 }}>
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: c.danger ? '#FBE4E6' : '#ECE6F8', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={36} color={c.danger ? '#B4424D' : Colors.navy} strokeWidth={1.5} /></View>
        <Text style={{ marginTop: 18, fontFamily: F.s, fontSize: 16, color: Colors.navy, textAlign: 'center' }}>{done ? 'Done' : c.head}</Text>
        <Text style={{ marginTop: 8, fontFamily: F.r, fontSize: 12, lineHeight: 19, color: Colors.slate, textAlign: 'center' }}>{done ? 'Your request has been received.' : c.body}</Text>
      </View>
      <Button title={done ? 'Back' : c.action} variant={done ? 'primary' : 'danger'} height={50} style={{ borderRadius: 14, marginTop: 30 }} onPress={() => (done ? back() : setDone(true))} />
      {!done ? <Button title="Cancel" variant="light" height={48} style={{ borderRadius: 14, marginTop: 10 }} onPress={back} /> : null}
    </AppScreen>
  );
}
