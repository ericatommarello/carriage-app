import { Stack } from 'expo-router';
import React from 'react';

import { WeddingFonts, WeddingPalette } from '@/constants/wedding-theme';

export default function OfficiantLeadsStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: WeddingPalette.background },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: WeddingFonts.displayBold,
          fontSize: 20,
          color: WeddingPalette.text,
        },
        headerTintColor: WeddingPalette.primary,
        contentStyle: { backgroundColor: WeddingPalette.background },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          title: '',
          headerBackTitle: 'Your leads',
        }}
      />
    </Stack>
  );
}
