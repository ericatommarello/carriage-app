import { Stack } from 'expo-router';
import React from 'react';

import { WeddingFonts, WeddingPalette } from '@/constants/wedding-theme';

export default function OfficiantOnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: WeddingPalette.background,
        },
        headerShadowVisible: false,
        headerTintColor: WeddingPalette.primaryDark,
        headerTitleStyle: {
          fontFamily: WeddingFonts.displayBold,
          fontSize: 20,
          color: WeddingPalette.text,
        },
        headerTitle: '✦ Carriage',
        headerBackTitle: 'Back',
      }}
    />
  );
}
