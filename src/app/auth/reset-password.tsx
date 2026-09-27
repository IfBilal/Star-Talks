import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { ActivityIndicator, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { PrimaryButton, Screen, TextField, Title } from '@/components/brand';
import { Colors } from '@/constants/theme';
import { requireSupabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    void requireSupabase().auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setHasSession(!error && Boolean(data.session));
      setReady(true);
    }).catch(() => {
      if (active) setReady(true);
    });
    return () => { active = false; };
  }, []);

  const savePassword = async () => {
    if (!password || !confirmPassword) {
      setMessage('Enter and confirm your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('The passwords do not match.');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const db = requireSupabase();
      const { error } = await db.auth.updateUser({ password });
      if (error) throw error;
      // The password is already changed; a local sign-out failure should not
      // strand the user on the reset form instead of returning them to login.
      try {
        await db.auth.signOut({ scope: 'local' });
      } catch {
        // Continue to login; the next sign-in will use the new password.
      }
      router.replace({ pathname: '/auth', params: { passwordReset: 'success' } });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update your password. Request a new reset link and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll style={{ paddingTop: 26 }}>
      <View style={{ flex: 1, justifyContent: 'flex-start' }}>
        <Image source={require('../../../assets/images/star-talks-mark.png')} contentFit="contain" accessibilityLabel="Star Talks" style={{ width: 86, height: 43, alignSelf: 'center', marginBottom: 3 }} />
        {!ready ? (
          <View style={{ alignItems: 'center', marginTop: 36 }}>
            <ActivityIndicator color={Colors.indigo} />
            <Text style={{ color: Colors.muted, marginTop: 12, fontFamily: 'Poppins_400Regular', fontSize: 12 }}>Checking your reset link…</Text>
          </View>
        ) : !hasSession ? (
          <>
            <Title subtitle="The link may have expired. Request a fresh password reset link to continue.">Reset Link Expired</Title>
            <PrimaryButton title="Back to Log In" onPress={() => router.replace('/auth')} />
          </>
        ) : (
          <>
            <Title subtitle="Choose a new password for your account">Create a New Password</Title>
            <TextField label="New Password" icon={<Lock size={16} color={Colors.muted} />} secure value={password} onChangeText={setPassword} placeholder="New password" />
            <TextField label="Confirm New Password" icon={<Lock size={16} color={Colors.muted} />} secure value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Re-enter new password" />
            {message ? <Text accessibilityRole="alert" style={{ color: Colors.danger, fontFamily: 'Poppins_400Regular', fontSize: 11, marginBottom: 8 }}>{message}</Text> : null}
            <PrimaryButton title="Update Password" loading={busy} onPress={savePassword} />
          </>
        )}
      </View>
    </Screen>
  );
}
