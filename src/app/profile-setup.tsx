import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Camera, ChevronDown, LogOut } from 'lucide-react-native';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PrimaryButton, Screen, TextField, Title } from '@/components/brand';
import { Colors } from '@/constants/theme';
import { preferences, readRegion } from '@/lib/preferences';
import { requireSupabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { t } = useTranslation();
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
        if (active) setError(e instanceof Error ? e.message : t('profile.couldNotLoad'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const save = async () => {
    if (!name.trim()) {
      setError(t('profile.enterNameError'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const db = requireSupabase();
      const user = (await db.auth.getUser()).data.user;
      if (!user) throw new Error(t('profile.signInRequired'));
      const rawRegion = await preferences.getRegion();
      const region = readRegion(rawRegion);
      const languageCode = await preferences.getLanguage() ?? 'en';
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
      setError(e instanceof Error ? e.message : t('profile.couldNotSave'));
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
      // Profile is pushed from Home, so replacing only Profile leaves Home
      // underneath it in the native stack. Clear that history before routing
      // to login so Android Back cannot reveal the signed-out Home screen.
      router.dismissAll();
      router.replace('/auth');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('profile.couldNotLogout'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <Screen><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={Colors.indigo} /></View></Screen>;
  }

  const genderLabels: Record<string, string> = { Female: t('profile.genderFemale'), Male: t('profile.genderMale'), Other: t('profile.genderOther') };

  return <Screen scroll style={{ paddingTop: 30 }}>
    <View style={{ flex: 1, zIndex: 1 }}>
      <Title subtitle={hasBirthProfile ? t('profile.manageSubtitle') : t('profile.createSubtitle')}>{hasBirthProfile ? t('profile.manageTitle') : t('profile.createTitle')}</Title>
      {!hasBirthProfile ? <Pressable style={{ alignSelf: 'center', width: 74, height: 74, borderRadius: 50, backgroundColor: '#ECE9F9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><Camera color={Colors.indigo} size={25} /></Pressable> : null}
      <TextField label={t('profile.fullNameLabel')} value={name} onChangeText={setName} placeholder={t('profile.fullNamePlaceholder')} />
      <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 12, color: Colors.text, marginBottom: 6, marginTop: 3 }}>{t('profile.genderLabel')}</Text>
      <Pressable onPress={() => setGenderOpen(true)} style={{ height: 43, borderRadius: 8, borderWidth: 1, borderColor: '#E5E3DF', backgroundColor: 'white', paddingHorizontal: 12, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: Colors.text }}>{genderLabels[gender]}</Text>
        <ChevronDown color={Colors.muted} size={17} />
      </Pressable>
      {error ? <Text accessibilityRole="alert" style={{ color: Colors.danger, fontSize: 11, marginTop: 8 }}>{error}</Text> : null}
      <View style={{ flex: 1, minHeight: 20 }} />
      <PrimaryButton title={hasBirthProfile ? t('profile.saveChanges') : t('common.continue')} loading={busy} onPress={save} />
      {hasBirthProfile ? <Pressable accessibilityRole="button" disabled={busy} onPress={logout} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
        <LogOut color={Colors.danger} size={17} />
        <Text style={{ fontFamily: 'Poppins_500Medium', color: Colors.danger, fontSize: 12 }}>{t('profile.logOut')}</Text>
      </Pressable> : null}
    </View>
    <Modal visible={genderOpen} animationType="fade" transparent onRequestClose={() => setGenderOpen(false)}>
      <Pressable onPress={() => setGenderOpen(false)} style={{ flex: 1, backgroundColor: '#0005', justifyContent: 'center', paddingHorizontal: 35 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 14, padding: 8 }}>{['Female', 'Male', 'Other'].map(g => <Pressable key={g} onPress={() => { setGender(g); setGenderOpen(false); }} style={{ height: 48, justifyContent: 'center', paddingHorizontal: 12, borderBottomWidth: .5, borderBottomColor: '#EEE' }}><Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: Colors.text }}>{genderLabels[g]}</Text></Pressable>)}</View>
      </Pressable>
    </Modal>
  </Screen>;
}
