import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Phone, ShieldCheck } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { PrimaryButton, Screen, TextField, Title } from '@/components/brand';
import { Colors } from '@/constants/theme';
import { hasVerifiedPhone, normalizeE164 } from '@/features/auth/phone-verification';
import { preferences } from '@/lib/preferences';
import { requireSupabase } from '@/lib/supabase';

const COOLDOWN_SECONDS = 60;

export default function VerifyPhoneScreen() {
  const [phone, setPhone] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(0);
  const remaining = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const continueToApp = async () => {
    const db = requireSupabase();
    const { data: { user }, error } = await db.auth.getUser();
    if (error) throw error;
    if (!hasVerifiedPhone(user)) throw new Error('Your phone has not been confirmed yet.');
    const { data, error: profileError } = await db.from('birth_profiles').select('id').eq('user_id', user!.id).eq('relationship', 'self').maybeSingle();
    if (profileError) throw profileError;
    if (data) await preferences.setOnboardingComplete(true);
    router.replace(data ? '/home' : await preferences.getOnboardingComplete()==='true' ? '/ai' : '/profile-setup');
  };

  useEffect(() => {
    void continueToApp().catch(() => {});
  }, []);

  const send = async () => {
    if (remaining > 0 || busy) return;
    const value = normalizeE164(phone);
    if (!value) { setMessage('Enter your full number with country code, for example +923001234567.'); return; }
    setBusy(true); setMessage('');
    try {
      const { error } = await requireSupabase().auth.updateUser({ phone: value });
      if (error) throw error;
      setSentTo(value);
      setCooldownUntil(Date.now() + COOLDOWN_SECONDS * 1000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to send a WhatsApp code. Please try again.');
    } finally { setBusy(false); }
  };

  const verify = async () => {
    if (busy) return;
    if (!/^\d{6}$/.test(code.trim())) { setMessage('Enter the six-digit code sent to WhatsApp.'); return; }
    setBusy(true); setMessage('');
    try {
      const db = requireSupabase();
      const { error } = await db.auth.verifyOtp({ phone: sentTo, token: code.trim(), type: 'phone_change' });
      if (error) throw error;
      await db.auth.refreshSession();
      await continueToApp();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'That code could not be verified.');
    } finally { setBusy(false); }
  };

  const signOut = async () => {
    setBusy(true);
    await requireSupabase().auth.signOut();
    router.dismissAll();
    router.replace('/auth');
  };

  return <Screen scroll style={{ paddingTop: 26 }}>
    <Image source={require('../../../assets/images/star-talks-mark.png')} contentFit="contain" accessibilityLabel="Star Talks" style={{ width: 86, height: 43, alignSelf: 'center', marginBottom: 3 }} />
    <Title subtitle="Secure your Star Talks account with a WhatsApp code">Verify your phone</Title>
    <View style={{ alignItems: 'center', marginVertical: 22 }}><ShieldCheck size={40} color={Colors.indigo} /></View>
    {!sentTo ? <>
      <TextField label="WhatsApp phone number" icon={<Phone size={16} color={Colors.muted} />} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+923001234567" autoCapitalize="none" />
      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: Colors.muted, lineHeight: 18, marginBottom: 15 }}>Include your country code. This number must be able to receive consumer WhatsApp messages.</Text>
      <PrimaryButton title="Send WhatsApp code" loading={busy} onPress={send} />
    </> : <>
      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: Colors.muted, textAlign: 'center', marginBottom: 12 }}>Code sent to WhatsApp at {sentTo.replace(/(\d{2})\d{4}(\d{2})$/, '$1••••$2')}</Text>
      <TextField label="Six-digit code" icon={<ShieldCheck size={16} color={Colors.muted} />} value={code} onChangeText={setCode} keyboardType="number-pad" placeholder="Enter code" />
      <PrimaryButton title="Verify and continue" loading={busy} onPress={verify} />
      <Pressable disabled={busy || remaining > 0} onPress={send} style={{ padding: 13, alignItems: 'center' }}><Text style={{ fontFamily: 'Poppins_500Medium', color: remaining ? Colors.muted : Colors.indigo, fontSize: 12 }}>{remaining ? `Resend in ${remaining}s` : 'Resend code'}</Text></Pressable>
      <Pressable disabled={busy} onPress={() => { setSentTo(''); setCode(''); setMessage(''); }} style={{ padding: 9, alignItems: 'center' }}><Text style={{ fontFamily: 'Poppins_500Medium', color: Colors.indigo, fontSize: 12 }}>Edit number</Text></Pressable>
    </>}
    {message ? <Text accessibilityRole="alert" style={{ fontFamily: 'Poppins_400Regular', color: Colors.danger, fontSize: 11, marginTop: 12, textAlign: 'center' }}>{message}</Text> : null}
    <Pressable disabled={busy} onPress={signOut} style={{ padding: 16, alignItems: 'center', marginTop: 16 }}><Text style={{ fontFamily: 'Poppins_500Medium', color: Colors.muted, fontSize: 12 }}>Use another account</Text></Pressable>
  </Screen>;
}
