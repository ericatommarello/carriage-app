import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { WeddingFonts, WeddingPalette } from '@/constants/wedding-theme';
import { getProfileQuizCompleted } from '@/lib/couple-profile';
import { supabase } from '@/lib/supabase';

export default function CoupleBrowseStack() {
  const router = useRouter();
  const [gate, setGate] = useState<'loading' | 'ok'>('loading');

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session?.user?.id) {
        router.replace('/(couple)/sign-in');
        return;
      }

      const done = await getProfileQuizCompleted(session.user.id);
      if (cancelled) return;

      if (!done) {
        router.replace('/match');
        return;
      }

      setGate('ok');
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (gate !== 'ok') {
    return (
      <View style={styles.gate}>
        <ActivityIndicator size="large" color={WeddingPalette.primary} />
      </View>
    );
  }

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
          headerBackTitle: 'All celebrants',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  gate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: WeddingPalette.background,
  },
});
