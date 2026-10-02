import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { PlayfairDisplay_500Medium, PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Cinzel_500Medium, Cinzel_600SemiBold } from '@expo-google-fonts/cinzel';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';

import { AuthProvider } from '@/lib/auth-context';
import { Colors } from '@/constants/theme';
import i18n, { initI18n } from '@/lib/i18n';

export default function RootLayout() {
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
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.midnight }}><ActivityIndicator color={Colors.gold} /></View>;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: Colors.ivory } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="region" />
            <Stack.Screen name="language" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="auth/callback" />
            <Stack.Screen name="auth/reset-password" />
            <Stack.Screen name="profile-setup" />
            <Stack.Screen name="birth-details" />
            <Stack.Screen name="palm-photo" />
            <Stack.Screen name="permissions" />
            <Stack.Screen name="home" />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}
