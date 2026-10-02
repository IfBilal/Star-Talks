import { ChevronRight, FileText, FileLock2, Gavel, LockKeyhole, LogOut, MonitorSmartphone, ShieldCheck, Trash2, UserRound, UserRoundX, Database, ScrollText } from 'lucide-react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { AppBar, AppScreen, Avatar, Card, F, go, ListRow, Type } from '@/components/ui';
import { requireSupabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (<><Text style={[Type.section, { marginTop: 16, marginBottom: 8 }]}>{title}</Text><Card style={{ borderRadius: 14 }}>{children}</Card></>);
}

export default function AccountSettings() {
  const [name, setName] = useState('Neha Sharma');
  const [email, setEmail] = useState('neha.sharma@gmail.com');
  useEffect(() => {
    void (async () => {
      try {
        const db = requireSupabase();
        const { data: { user } } = await db.auth.getUser();
        if (!user) return;
        if (user.email) setEmail(user.email);
        const { data } = await db.from('profiles').select('display_name').eq('id', user.id).maybeSingle();
        if (data?.display_name) setName(data.display_name);
      } catch { /* demo values */ }
    })();
  }, []);
  const logoutAll = async () => {
    try { const { error } = await requireSupabase().auth.signOut({ scope: 'global' }); if (error) throw error; router.dismissAll(); router.replace('/auth'); }
    catch (e) { Alert.alert('Could not log out', e instanceof Error ? e.message : 'Please try again.'); }
  };
  const r = (icon: (c: string) => React.ReactNode, title: string, sub: string, onPress: () => void, divider = true, danger?: boolean) => (
    <ListRow icon={icon} title={title} subtitle={sub} onPress={onPress} divider={divider} tileBg={danger ? '#FBE4E6' : undefined} iconColor={danger ? '#B4424D' : undefined} style={{ minHeight: 58 }} />
  );
  return (
    <AppScreen tab="profile" header={<AppBar brand />} contentStyle={{ paddingTop: 6 }}>
      <Card tint="#EFEAF9" onPress={() => go('/profile-setup')} style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14 }}>
        <Avatar name={name} size={48} bg="#DCD4F0" />
        <View style={{ flex: 1 }}><Text style={{ fontFamily: F.s, fontSize: 14, color: Colors.navy }} numberOfLines={1}>{name}</Text><Text style={{ fontFamily: F.r, fontSize: 10.5, color: Colors.slate }} numberOfLines={1}>{email}</Text></View>
        <ChevronRight size={18} color={Colors.navy} />
      </Card>
      <Group title="Account Settings">
        {r(c => <LockKeyhole size={18} color={c} strokeWidth={1.6} />, 'Change Password', 'Update your password', () => go('/settings/password'))}
        {r(c => <MonitorSmartphone size={18} color={c} strokeWidth={1.6} />, 'Login & Device Management', 'Manage your devices and sessions', () => go('/settings/devices'))}
        {r(c => <LogOut size={18} color={c} strokeWidth={1.6} />, 'Logout from All Devices', 'Secure your account', logoutAll, false)}
      </Group>
      <Group title="Data & Privacy">
        {r(c => <Trash2 size={18} color={c} strokeWidth={1.6} />, 'Delete AI Conversations', 'Remove your AI chat history', () => go('/settings/delete/conversations'))}
        {r(c => <Trash2 size={18} color={c} strokeWidth={1.6} />, 'Delete Saved Profiles', 'Remove your astrology profiles', () => go('/settings/delete/profiles'))}
        {r(c => <UserRoundX size={18} color={c} strokeWidth={1.6} />, 'Delete Account', 'Permanently delete your account', () => go('/settings/delete/account'))}
        {r(c => <Database size={18} color={c} strokeWidth={1.6} />, 'Data Deletion Request', 'Request data removal (GDPR)', () => go('/settings/delete/request'), false)}
      </Group>
      <Group title="Legal & Privacy">
        {r(c => <FileText size={18} color={c} strokeWidth={1.6} />, 'Privacy Policy', 'Read our privacy policy', () => go('/legal/privacy'))}
        {r(c => <ScrollText size={18} color={c} strokeWidth={1.6} />, 'Terms & Conditions', 'View terms and conditions', () => go('/legal/terms'))}
        {r(c => <Gavel size={18} color={c} strokeWidth={1.6} />, 'Consent Management', 'Manage your data consent', () => go('/legal/consent'))}
        {r(c => <FileLock2 size={18} color={c} strokeWidth={1.6} />, 'Data Protection', 'Your data is secure with us', () => go('/legal/data'), false)}
      </Group>
      <Card tint="#EFEAF9" style={{ marginTop: 16, padding: 14, borderRadius: 14, flexDirection: 'row', gap: 12 }}>
        <ShieldCheck size={30} color={Colors.navy} strokeWidth={1.4} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.s, fontSize: 11.5, color: Colors.navy }}>How We Use Your Data</Text>
          <Text style={{ fontFamily: F.r, fontSize: 10.5, lineHeight: 16, color: '#4A5590', marginTop: 3 }}>Your birth details, palm images and AI conversations are used only to provide personalized astrology services and are never shared with third parties.</Text>
        </View>
      </Card>
    </AppScreen>
  );
}
