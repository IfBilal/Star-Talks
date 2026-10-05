import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { ActivityIndicator, Appearance, View } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { Colors as LightColors } from '@/constants/theme';
import { adaptColor, DarkColors, type Palette, type ThemeColor, type ThemeMode } from '@/constants/appearance';

export const THEME_KEY = 'star-talks.appearance';
const lightColor: ThemeColor = value => value;
const darkColor: ThemeColor = (value, role) => adaptColor(value, 'dark', role);
type Theme = { mode: ThemeMode; isDark: boolean; Colors: Palette; themed: ThemeColor; setMode: (mode: ThemeMode) => Promise<void> };
const ThemeContext = createContext<Theme>({ mode: 'light', isDark: false, Colors: LightColors, themed: lightColor, setMode: async () => {} });

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [ready, setReady] = useState(false);
  const pendingWrite = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(THEME_KEY).then(saved => {
      if (active && (saved === 'light' || saved === 'dark')) setModeState(saved);
    }).catch(() => {}).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!ready) return;
    Appearance.setColorScheme?.(mode);
    void SystemUI.setBackgroundColorAsync(mode === 'dark' ? DarkColors.ivory : LightColors.ivory).catch(() => {});
  }, [mode, ready]);
  const value = useMemo<Theme>(() => ({
    mode, isDark: mode === 'dark', Colors: mode === 'dark' ? DarkColors : LightColors,
    themed: mode === 'dark' ? darkColor : lightColor,
    setMode: async next => {
      setModeState(next);
      // Serialize rapid toggles so the last visible choice also survives a restart.
      const write = pendingWrite.current.catch(() => {}).then(() => AsyncStorage.setItem(THEME_KEY, next));
      pendingWrite.current = write;
      await write;
    },
  }), [mode]);
  if (!ready) return <View style={{ flex: 1, backgroundColor: LightColors.midnight, justifyContent: 'center' }}><ActivityIndicator color={LightColors.white} /></View>;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
export function useThemedStyles<T>(factory: (Colors: Palette, themed: ThemeColor) => T): T {
  const { Colors, themed } = useTheme();
  return useMemo(() => factory(Colors, themed), [Colors, themed, factory]);
}
