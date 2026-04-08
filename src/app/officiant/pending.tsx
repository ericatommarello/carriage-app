import { useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WeddingFonts, WeddingPalette } from '@/constants/wedding-theme';
import { useResponsive } from '@/hooks/use-responsive';

export default function OfficiantPendingScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { horizontalGutter, isDesktop, isTopNavLayout } = useResponsive();
  const safeEdges = isDesktop || isTopNavLayout ? ([] as const) : (['top'] as const);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={safeEdges}>
      <View style={[styles.inner, { paddingHorizontal: horizontalGutter }]}>
        <Text style={styles.spark}>✦</Text>
        <Text style={styles.heading}>You&apos;re in the queue ✦</Text>
        <Text style={styles.body}>
          We review every celebrant personally — expect to hear from us within 2–3 business days. In the
          meantime, think about your first message to couples: warm, specific, and quick.
        </Text>
        <Pressable
          onPress={() => router.replace('/')}
          style={({ pressed }) => [styles.outlineBtn, pressed && styles.outlineBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Back to home">
          <Text style={styles.outlineBtnLabel}>Back to home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: WeddingPalette.background,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  spark: {
    fontSize: 56,
    lineHeight: 60,
    color: WeddingPalette.gold,
    marginBottom: 20,
  },
  heading: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 30,
    lineHeight: 36,
    color: WeddingPalette.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  body: {
    fontFamily: WeddingFonts.sans,
    fontSize: 17,
    lineHeight: 26,
    color: WeddingPalette.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  outlineBtn: {
    borderWidth: 2,
    borderColor: WeddingPalette.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    minWidth: 220,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  outlineBtnPressed: {
    opacity: 0.9,
  },
  outlineBtnLabel: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 16,
    color: WeddingPalette.primary,
  },
});
