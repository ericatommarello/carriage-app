import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { WeddingFonts, WeddingPalette, WeddingShadows } from '@/constants/wedding-theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useWedding } from '@/context/wedding-context';

export default function CoupleProfileScreen() {
  const router = useRouter();
  const { coupleDisplayName, setCoupleDisplayName, setRole } = useWedding();
  const { horizontalGutter, isDesktop, isTopNavLayout } = useResponsive();
  const safeEdges = isDesktop || isTopNavLayout ? ([] as const) : (['top'] as const);

  const goToLanding = () => {
    setRole(null);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={safeEdges}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: horizontalGutter,
            paddingBottom: 40,
            ...(isDesktop ? { alignItems: 'flex-start' as const } : {}),
          },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={isDesktop ? styles.desktopColumn : undefined}>
          <ScreenHeader
            eyebrow="Your love"
            title="Profile"
            subtitle="A few sparkling details so officiants know exactly who is sliding into their inbox."
          />
          <Text style={styles.label}>How should we introduce you?</Text>
          <TextInput
            value={coupleDisplayName}
            onChangeText={setCoupleDisplayName}
            placeholder="Alex & Morgan"
            placeholderTextColor={WeddingPalette.textMuted}
            style={styles.input}
          />
          <Text style={styles.hint}>
            This greeting appears on new threads—make it feel like you, nicknames and all.
          </Text>

          <View style={[styles.card, WeddingShadows.soft]}>
            <Text style={styles.cardEyebrow}>Coming soon</Text>
            <Text style={styles.cardTitle}>Planning snapshot</Text>
            <Text style={styles.cardBody}>
              Season, venue vibes, guest count—we’ll tuck those here soon. For now, splurge on context in
              your first message so pros can say yes with confidence.
            </Text>
          </View>

          <View style={styles.actionStack}>
            <Pressable
              onPress={goToLanding}
              style={({ pressed }) => [styles.outlineBtn, WeddingShadows.soft, pressed && styles.pressed]}>
              <Text style={styles.outlineLabel}>Switch role</Text>
            </Pressable>
            <Pressable
              onPress={goToLanding}
              style={({ pressed }) => [styles.signOutBtn, pressed && styles.signOutPressed]}>
              <Text style={styles.signOutLabel}>Sign out</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: WeddingPalette.background,
  },
  scroll: {
    width: '100%',
    maxWidth: '100%',
  },
  desktopColumn: {
    width: '100%',
    maxWidth: 640,
  },
  label: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 14,
    color: WeddingPalette.text,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 2,
    borderColor: WeddingPalette.borderStrong,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: WeddingFonts.sans,
    fontSize: 17,
    color: WeddingPalette.text,
    backgroundColor: WeddingPalette.surface,
  },
  hint: {
    fontFamily: WeddingFonts.serifItalic,
    fontSize: 14,
    color: WeddingPalette.textMuted,
    marginTop: 10,
    lineHeight: 21,
  },
  card: {
    marginTop: 28,
    padding: 22,
    borderRadius: 20,
    backgroundColor: WeddingPalette.primaryMuted,
    borderWidth: 1,
    borderColor: WeddingPalette.primaryGlow,
  },
  cardEyebrow: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: WeddingPalette.coralDeep,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 24,
    color: WeddingPalette.text,
    marginBottom: 10,
  },
  cardBody: {
    fontFamily: WeddingFonts.sans,
    fontSize: 16,
    lineHeight: 25,
    color: WeddingPalette.textSecondary,
  },
  actionStack: {
    marginTop: 32,
    gap: 12,
    width: '100%',
  },
  outlineBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: WeddingPalette.primary,
    alignItems: 'center',
    backgroundColor: WeddingPalette.surface,
  },
  pressed: {
    opacity: 0.9,
  },
  outlineLabel: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 16,
    color: WeddingPalette.primaryDark,
  },
  signOutBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: WeddingPalette.border,
    alignItems: 'center',
    backgroundColor: WeddingPalette.background,
  },
  signOutPressed: {
    opacity: 0.85,
  },
  signOutLabel: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 16,
    color: WeddingPalette.textMuted,
  },
});
