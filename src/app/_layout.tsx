import { ThemeProvider, useTheme } from '@/lib/theme-context';
import { Stack, router, useSegments, type Href } from 'expo-router';
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { PlayfairDisplay_500Medium, PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Cinzel_500Medium, Cinzel_600SemiBold } from '@expo-google-fonts/cinzel';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';

import { AuthProvider , useAuth } from '@/lib/auth-context';
import i18n, { initI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { needsPhoneVerification } from '@/features/auth/phone-verification';

function GuardedStack() {
  const { Colors: palette } = useTheme();

  const { session, loading } = useAuth();
  const segments = useSegments();
  const path = segments.join('/');
  useEffect(() => {
    if (loading || path === '') return;
    const isPublic = path === 'index' || path === 'auth' || path === 'auth/callback' || path === 'auth/reset-password' || path === 'region' || path === 'language' || path.startsWith('legal/');
    if (!session) {
      if (!isPublic) router.replace('/auth');
      return;
    }
    if (isPublic || path === 'auth/verify-phone') return;
    let active = true;
    void supabase?.auth.getUser().then(({ data, error }) => {
      if (active && (error || needsPhoneVerification(data.user))) router.replace('/auth/verify-phone' as Href);
    });
    return () => { active = false; };
  }, [loading, path, session]);
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: palette.ivory } }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="region" />
    <Stack.Screen name="language" />
    <Stack.Screen name="auth" />
    <Stack.Screen name="auth/callback" />
    <Stack.Screen name="auth/reset-password" />
    <Stack.Screen name="auth/verify-phone" />
    <Stack.Screen name="profile-setup" />
    <Stack.Screen name="birth-details" />
    <Stack.Screen name="palm-photo" />
    <Stack.Screen name="permissions" />
    <Stack.Screen name="home" />
  </Stack>;
}

export default function RootLayout() {
  const { Colors: palette } = useTheme();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Cinzel_500Medium,
    Cinzel_600SemiBold,
  });
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    void initI18n().then(() => setI18nReady(true));
  }, []);

  if (!fontsLoaded || !i18nReady) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.midnight }}><ActivityIndicator color={palette.gold} /></View>;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <ThemeProvider>
        <AuthProvider>
          <GuardedStack />
        </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}
