import {
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

import { WeddingPalette } from '@/constants/wedding-theme';
import { WeddingProvider } from '@/context/wedding-context';

void SplashScreen.preventAutoHideAsync();

const NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: WeddingPalette.primary,
    background: WeddingPalette.background,
    card: WeddingPalette.surface,
    text: WeddingPalette.text,
    border: WeddingPalette.border,
    notification: WeddingPalette.primaryDark,
  },
};

export default function RootLayout() {
  const [loaded, err] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });

  useEffect(() => {
    if (loaded || err) void SplashScreen.hideAsync();
  }, [loaded, err]);

  if (!loaded && !err) return null;

  return (
    <WeddingProvider>
      <ThemeProvider value={NavTheme}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: WeddingPalette.background,
              ...(Platform.OS === 'web' ? ({ flex: 1, minHeight: '100%', width: '100%' } as object) : {}),
            },
          }}
        />
      </ThemeProvider>
    </WeddingProvider>
  );
}
