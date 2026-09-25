import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Camera, ChevronDown, LogOut } from 'lucide-react-native';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { PrimaryButton, Screen, TextField, Title } from '@/components/brand';
import { Colors } from '@/constants/theme';
import { preferences, readRegion } from '@/lib/preferences';
import { requireSupabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Female');
  const [genderOpen, setGenderOpen] = useState(false);
  const [hasBirthProfile, setHasBirthProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const db = requireSupabase();
        const user = (await db.auth.getUser()).data.user;
        if (!user) {
          router.replace('/auth');
          return;
        }
        const [{ data: profile }, { data: birthProfile }] = await Promise.all([
          db.from('profiles').select('display_name,gender').eq('id', user.id).maybeSingle(),
          db.from('birth_profiles').select('id').eq('user_id', user.id).eq('relationship', 'self').maybeSingle(),
        ]);
        if (!active) return;
        if (profile?.display_name) setName(profile.display_name);
        if (profile?.gender && ['female', 'male', 'other'].includes(profile.gender.toLowerCase())) {
          setGender(profile.gender[0].toUpperCase() + profile.gender.slice(1).toLowerCase());
        }
        setHasBirthProfile(Boolean(birthProfile));
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Could not load your profile.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const save = async () => {
    if (!name.trim()) {
      setError('Enter your name to continue.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const db = requireSupabase();
      const user = (await db.auth.getUser()).data.user;
      if (!user) throw new Error('Please sign in to save your profile.');
      const rawRegion = await preferences.getRegion();
      const region = readRegion(rawRegion);
      const language = await preferences.getLanguage() ?? 'English';
      const languageCode = language === 'हिन्दी' ? 'hi' : language === 'اردو' ? 'ur' : language === 'Español' ? 'es' : language === 'Français' ? 'fr' : language === 'العربية' ? 'ar' : 'en';
      const { error: saveError } = await db.from('profiles').upsert({
        id: user.id,
        display_name: name.trim(),
        gender: gender.toLowerCase(),
        country_code: region?.code,
        country_name: region?.name,
        currency_code: region?.currency,
        date_format: region?.dateFormat,
        language_code: languageCode,
      }, { onConflict: 'id' });
      if (saveError) throw saveError;

      if (hasBirthProfile) {
        router.replace('/home');
      } else {
        router.push('/birth-details');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save profile.');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    setError('');
    try {
      const { error: signOutError } = await requireSupabase().auth.signOut();
      if (signOutError) throw signOutError;
      router.replace('/auth');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not log out. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <Screen><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={Colors.indigo} /></View></Screen>;
  }

  return <Screen scroll style={{ paddingTop: 30 }}>
    <View style={{ flex: 1, zIndex: 1 }}>
      <Title subtitle={hasBirthProfile ? 'Manage your account details.' : "Let's get to know you better."}>{hasBirthProfile ? 'Your Profile' : 'Create Your Profile'}</Title>
      {!hasBirthProfile ? <Pressable style={{ alignSelf: 'center', width: 74, height: 74, borderRadius: 50, backgroundColor: '#ECE9F9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Camera color={Colors.indigo} size={25} /></Pressable> : null}
      <TextField label="Full Name" value={name} onChangeText={setName} placeholder="Your full name" />
      <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 12, color: Colors.text, marginBottom: 6, marginTop: 3 }}>Gender</Text>
      <Pressable onPress={() => setGenderOpen(true)} style={{ height: 43, borderRadius: 8, borderWidth: 1, borderColor: '#E5E3DF', backgroundColor: 'white', paddingHorizontal: 12, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: Colors.text }}>{gender}</Text>
        <ChevronDown color={Colors.muted} size={17} />
      </Pressable>
      {error ? <Text accessibilityRole="alert" style={{ color: Colors.danger, fontSize: 11, marginTop: 8 }}>{error}</Text> : null}
      <View style={{ flex: 1, minHeight: 20 }} />
      <PrimaryButton title={hasBirthProfile ? 'Save Changes' : 'Continue'} loading={busy} onPress={save} />
      {hasBirthProfile ? <Pressable accessibilityRole="button" disabled={busy} onPress={logout} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
        <LogOut color={Colors.danger} size={17} />
        <Text style={{ fontFamily: 'Poppins_500Medium', color: Colors.danger, fontSize: 12 }}>Log Out</Text>
      </Pressable> : null}
    </View>
    <Modal visible={genderOpen} animationType="fade" transparent onRequestClose={() => setGenderOpen(false)}>
      <Pressable onPress={() => setGenderOpen(false)} style={{ flex: 1, backgroundColor: '#0005', justifyContent: 'center', paddingHorizontal: 35 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 14, padding: 8 }}>{['Female', 'Male', 'Other'].map(g => <Pressable key={g} onPress={() => { setGender(g); setGenderOpen(false); }} style={{ height: 48, justifyContent: 'center', paddingHorizontal: 12, borderBottomWidth: .5, borderBottomColor: '#EEE' }}><Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: Colors.text }}>{g}</Text></Pressable>)}</View>
      </Pressable>
    </Modal>
  </Screen>;
}
