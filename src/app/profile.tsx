import {
  Award, Bell, CalendarCheck, CircleDollarSign, Clock3, Globe, LockKeyhole, LogOut, MessageCircle, Settings, ShieldCheck,
  Sparkles, Trash2, UserRound, UserRoundX, Wallet,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/languages';
import { Avatar, AppBar, AppScreen, Card, go, ListRow, Type } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { requireSupabase } from '@/lib/supabase';

type Row = { icon: (c: string) => React.ReactNode; title: string; subtitle: string; href?: string; danger?: boolean; action?: 'logout' };

export default function ProfileTab() {
  const { i18n } = useTranslation();
  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language)?.label ?? 'English';
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
      } catch {
        // Demo values stay in place when no account data is available.
      }
    })();
  }, []);

  const logoutAll = async () => {
    try {
      const { error } = await requireSupabase().auth.signOut({ scope: 'global' });
      if (error) throw error;
      router.dismissAll();
      router.replace('/auth');
    } catch (e) {
      Alert.alert('Could not log out', e instanceof Error ? e.message : 'Please try again.');
    }
  };

  const rows: Row[] = [
    { icon: c => <UserRound size={19} color={c} strokeWidth={1.7} />, title: 'Edit Profile', subtitle: 'Update your personal information', href: '/profile-setup' },
    { icon: c => <CalendarCheck size={19} color={c} strokeWidth={1.7} />, title: 'Birth Details', subtitle: 'Date, time and place of birth', href: '/birth-details' },
    { icon: c => <MessageCircle size={19} color={c} strokeWidth={1.7} />, title: 'Language', subtitle: currentLanguage, href: '/settings/language' },
    { icon: c => <Globe size={19} color={c} strokeWidth={1.7} />, title: 'Country / Region', subtitle: 'India', href: '/settings/language' },
    { icon: c => <CircleDollarSign size={19} color={c} strokeWidth={1.7} />, title: 'Currency Preferences', subtitle: 'INR (₹)', href: '/settings/currency' },
    { icon: c => <Bell size={19} color={c} strokeWidth={1.7} />, title: 'Notification Settings', subtitle: 'Manage your notifications', href: '/notifications/settings' },
    { icon: c => <Settings size={19} color={c} strokeWidth={1.7} />, title: 'Account Settings', subtitle: 'Account preferences', href: '/settings/account' },
    { icon: c => <ShieldCheck size={19} color={c} strokeWidth={1.7} />, title: 'Security Settings', subtitle: 'Password, login & device management', href: '/settings/account' },
    { icon: c => <Clock3 size={19} color={c} strokeWidth={1.7} />, title: 'View History', subtitle: 'Your activity history', href: '/history' },
    { icon: c => <Award size={19} color={c} strokeWidth={1.7} />, title: 'Certificates', subtitle: 'View and download certificates', href: '/certificates' },
    { icon: c => <Wallet size={19} color={c} strokeWidth={1.7} />, title: 'Wallet', subtitle: 'Manage your wallet', href: '/wallet' },
    { icon: c => <Sparkles size={19} color={c} strokeWidth={1.7} />, title: 'AI Credit Balance', subtitle: 'View your AI credits', href: '/wallet' },
    { icon: c => <UserRound size={19} color={c} strokeWidth={1.7} />, title: 'Saved Profiles', subtitle: 'Family, partner, friends & more', href: '/profiles' },
    { icon: c => <LockKeyhole size={19} color={c} strokeWidth={1.7} />, title: 'Privacy Settings', subtitle: 'Data and privacy controls', href: '/settings/account' },
    { icon: c => <Trash2 size={19} color={c} strokeWidth={1.7} />, title: 'Delete AI Conversations', subtitle: 'Clear your AI chat history', href: '/settings/delete/conversations' },
    { icon: c => <Trash2 size={19} color={c} strokeWidth={1.7} />, title: 'Delete Saved Profiles', subtitle: 'Remove saved profiles', href: '/settings/delete/profiles', danger: true },
    { icon: c => <UserRoundX size={19} color={c} strokeWidth={1.7} />, title: 'Delete Account', subtitle: 'Permanently delete your account', href: '/settings/delete/account', danger: true },
    { icon: c => <LogOut size={19} color={c} strokeWidth={1.7} />, title: 'Logout From All Devices', subtitle: 'Secure logout', action: 'logout' },
  ];

  return (
    <AppScreen tab="profile" header={<AppBar brand menu right={<View />} />} pad={12} contentStyle={{ paddingTop: 8 }}>
      <Card style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16 }}>
        <Avatar name={name} size={62} bg="#E6DEF3" />
        <View style={{ flex: 1 }}>
          <Text style={[Type.h2, { fontSize: 15.5 }]} numberOfLines={1}>{name}</Text>
          <Text style={[Type.rowSub, { fontSize: 11, marginTop: 3 }]} numberOfLines={1}>{email}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => go('/profile-setup')} style={{ height: 30, paddingHorizontal: 11, borderRadius: 15, borderWidth: 1, borderColor: '#C9C4E2', backgroundColor: '#fff', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 10.5, color: Colors.navy }}>Edit Profile</Text>
        </Pressable>
      </Card>

      <View style={{ gap: 3.5, marginTop: 10 }}>
        {rows.map(r => (
          <Card key={r.title} style={{ borderRadius: 12 }}>
            <ListRow
              icon={r.icon}
              title={r.title}
              subtitle={r.subtitle}
              tileBg={r.danger ? '#FBE4E6' : undefined}
              iconColor={r.danger ? '#B4424D' : undefined}
              onPress={r.action === 'logout' ? logoutAll : () => go(r.href!)}
              style={{ minHeight: 64 }}
            />
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}
