import { useTheme } from '@/lib/theme-context';
import { Moon, ChevronRight, FileText, FileLock2, Gavel, LockKeyhole, LogOut, MonitorSmartphone, ShieldCheck, Trash2, UserRoundX, Database, ScrollText } from 'lucide-react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import { AppBar, AppScreen, Avatar, Card, F, go, ListRow, useTypography } from '@/components/ui';
import { requireSupabase } from '@/lib/supabase';

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const Type = useTypography();

  return (<><Text style={[Type.section, { marginTop: 16, marginBottom: 8 }]}>{title}</Text><Card style={{ borderRadius: 14 }}>{children}</Card></>);
}

export default function AccountSettings() {
  const { Colors: palette, themed, isDark, setMode } = useTheme();

  const [name, setName] = useState('Your account');
  const [email, setEmail] = useState('');
  useEffect(() => {
    void (async () => {
      try {
        const db = requireSupabase();
        const { data: { user } } = await db.auth.getUser();
        if (!user) return;
        if (user.email) setEmail(user.email);
        const { data } = await db.from('profiles').select('display_name').eq('id', user.id).maybeSingle();
        if (data?.display_name) setName(data.display_name);
      } catch { /* Show the neutral account label until data can be loaded. */ }
    })();
  }, []);
  const logoutAll = async () => {
    try { const { error } = await requireSupabase().auth.signOut({ scope: 'global' }); if (error) throw error; router.dismissAll(); router.replace('/auth'); }
    catch (e) { Alert.alert('Could not log out', e instanceof Error ? e.message : 'Please try again.'); }
  };
  const r = (icon: (c: string) => React.ReactNode, title: string, sub: string, onPress: () => void, divider = true, danger?: boolean) => (
    <ListRow icon={icon} title={title} subtitle={sub} onPress={onPress} divider={divider} tileBg={themed(danger ? '#FBE4E6' : undefined, 'surface')} iconColor={themed(danger ? '#B4424D' : undefined, 'foreground')} style={{ minHeight: 58 }} />
  );
  return (
    <AppScreen tab="profile" header={<AppBar brand />} contentStyle={{ paddingTop: 6 }}>
      <Card tint={themed("#EFEAF9", 'surface')} onPress={() => go('/profile-setup')} style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14 }}>
        <Avatar name={name} size={48} bg={themed("#DCD4F0", 'surface')} />
        <View style={{ flex: 1 }}><Text style={{ fontFamily: F.s, fontSize: 14, color: palette.navy }} numberOfLines={1}>{name}</Text><Text style={{ fontFamily: F.r, fontSize: 10.5, color: palette.slate }} numberOfLines={1}>{email}</Text></View>
        <ChevronRight size={18} color={palette.navy} />
      </Card>
      <Group title="Appearance">
        <ListRow icon={c => <Moon size={19} color={c} />} title="Dark mode" subtitle={isDark ? 'Dark appearance is on' : 'Light appearance is on'} chevron={false}
          right={<Switch accessibilityLabel="Dark mode" value={isDark} onValueChange={value => { void setMode(value ? 'dark' : 'light').catch(() => Alert.alert('Appearance', 'The theme changed, but could not be saved. Please try again.')); }} trackColor={{ false: palette.track, true: '#7065C5' }} thumbColor="#FFFFFF" ios_backgroundColor={palette.track} />} />
      </Group>
      <Group title="Account Settings">
        {r(c => <LockKeyhole size={18} color={themed(c, 'foreground')} strokeWidth={1.6} />, 'Change Password', 'Update your password', () => go('/settings/password'))}
        {r(c => <MonitorSmartphone size={18} color={themed(c, 'foreground')} strokeWidth={1.6} />, 'Login & Device Management', 'Manage your devices and sessions', () => go('/settings/devices'))}
        {r(c => <LogOut size={18} color={themed(c, 'foreground')} strokeWidth={1.6} />, 'Logout from All Devices', 'Secure your account', logoutAll, false)}
      </Group>
      <Group title="Data & Privacy">
        {r(c => <Trash2 size={18} color={themed(c, 'foreground')} strokeWidth={1.6} />, 'Delete AI Conversations', 'Remove your AI chat history', () => go('/settings/delete/conversations'))}
        {r(c => <Trash2 size={18} color={themed(c, 'foreground')} strokeWidth={1.6} />, 'Delete Saved Profiles', 'Remove your astrology profiles', () => go('/settings/delete/profiles'))}
        {r(c => <UserRoundX size={18} color={themed(c, 'foreground')} strokeWidth={1.6} />, 'Delete Account', 'Permanently delete your account', () => go('/settings/delete/account'))}
        {r(c => <Database size={18} color={themed(c, 'foreground')} strokeWidth={1.6} />, 'Data Deletion Request', 'Request data removal (GDPR)', () => go('/settings/delete/request'), false)}
      </Group>
      <Group title="Legal & Privacy">
        {r(c => <FileText size={18} color={themed(c, 'foreground')} strokeWidth={1.6} />, 'Privacy Policy', 'Read our privacy policy', () => go('/legal/privacy'))}
        {r(c => <ScrollText size={18} color={themed(c, 'foreground')} strokeWidth={1.6} />, 'Terms & Conditions', 'View terms and conditions', () => go('/legal/terms'))}
        {r(c => <Gavel size={18} color={themed(c, 'foreground')} strokeWidth={1.6} />, 'Consent Management', 'Manage your data consent', () => go('/legal/consent'))}
        {r(c => <FileLock2 size={18} color={themed(c, 'foreground')} strokeWidth={1.6} />, 'Data Protection', 'Your data is secure with us', () => go('/legal/data'), false)}
      </Group>
      <Card tint={themed("#EFEAF9", 'surface')} style={{ marginTop: 16, padding: 14, borderRadius: 14, flexDirection: 'row', gap: 12 }}>
        <ShieldCheck size={30} color={palette.navy} strokeWidth={1.4} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.s, fontSize: 11.5, color: palette.navy }}>How We Use Your Data</Text>
          <Text style={{ fontFamily: F.r, fontSize: 10.5, lineHeight: 16, color: themed('#4A5590', 'foreground'), marginTop: 3 }}>Selected birth details, questions and consented photos are sent to our AI provider for readings. You can manage future AI use and delete saved history here.</Text>
        </View>
      </Card>
    </AppScreen>
  );
}
