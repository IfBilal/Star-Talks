import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/lib/auth-context';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.midnight }}><ActivityIndicator color={Colors.gold} /></View>;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: Colors.ivory } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="region" />
          <Stack.Screen name="language" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="auth/callback" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="birth-details" />
          <Stack.Screen name="home" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
