import { useTheme } from '@/lib/theme-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PrimaryButton, Screen, SelectRow, Title } from '@/components/brand';
import { setAppLanguage } from '@/lib/i18n';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/i18n/languages';

export default function LanguageScreen() {
  const { Colors: palette } = useTheme();

  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<LanguageCode>(i18n.language as LanguageCode);

  const next = async () => {
    const needsRestart = await setAppLanguage(language);
    router.push('/auth');
    if (needsRestart) {
      Alert.alert(t('language.restartTitle'), t('language.restartBody'));
    }
  };

  return <Screen style={{ paddingTop: 30 }}>
    <View style={{ flex: 1 }}>
      <Title subtitle={t('language.subtitle')}>{t('language.title')}</Title>
      <View>
        {SUPPORTED_LANGUAGES.map(({ code, flag, label }) => (
          <SelectRow key={code} flag={flag} selected={language === code} onPress={() => setLanguage(code)}>{label}</SelectRow>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <PrimaryButton title={t('common.continue')} onPress={next} />
      <Pressable onPress={() => router.push('/auth')} style={{ alignItems: 'center', padding: 12 }}>
        <Text style={{ color: palette.muted, fontSize: 11, fontFamily: 'Poppins_400Regular' }}>{t('common.skipForNow')}</Text>
      </Pressable>
    </View>
  </Screen>;
}
