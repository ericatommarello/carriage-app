import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { WeddingFonts, WeddingPalette, WeddingShadows } from '@/constants/wedding-theme';
import { useWedding } from '@/context/wedding-context';
import { useResponsive } from '@/hooks/use-responsive';

export default function OfficiantProfileScreen() {
  const router = useRouter();
  const { officiantBusinessName, setOfficiantBusinessName, setRole, threads } = useWedding();
  const { horizontalGutter, isDesktop, isTopNavLayout } = useResponsive();
  const safeEdges = isDesktop || isTopNavLayout ? ([] as const) : (['top'] as const);
  const openLeads = threads.filter((t) => t.messages.some((m) => m.from === 'couple')).length;

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
            eyebrow="Studio"
            title="Your spotlight"
            subtitle="Polish the details that make couples lean in before they ever hit send."
          />

          <View style={[styles.statRow, isDesktop && styles.statRowDesktop]}>
            <View style={[styles.stat, WeddingShadows.soft]}>
              <Text style={styles.statNum}>{threads.length}</Text>
              <Text style={styles.statLabel}>Active threads</Text>
            </View>
            <View style={[styles.stat, styles.statAccent, WeddingShadows.soft]}>
              <Text style={styles.statNumLight}>{openLeads}</Text>
              <Text style={styles.statLabelLight}>Couples waiting</Text>
            </View>
          </View>

          <Text style={styles.label}>Business or ministry name</Text>
          <TextInput
            value={officiantBusinessName}
            onChangeText={setOfficiantBusinessName}
            placeholder="Ceremony Studio"
            placeholderTextColor={WeddingPalette.textMuted}
            style={styles.input}
          />

          <View style={[styles.card, WeddingShadows.soft]}>
            <Text style={styles.cardEyebrow}>On the roadmap</Text>
            <Text style={styles.cardTitle}>Public listing sync</Text>
            <Text style={styles.cardBody}>
              Bio tweaks, travel fees, calendar blocks—you’ll edit once and watch every touchpoint glow. For
              now, flex those storytelling muscles in your lead replies.
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
    maxWidth: 720,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 26,
  },
  statRowDesktop: {
    maxWidth: 640,
  },
  stat: {
    flex: 1,
    padding: 18,
    borderRadius: 18,
    backgroundColor: WeddingPalette.surface,
    borderWidth: 1,
    borderColor: WeddingPalette.border,
  },
  statAccent: {
    backgroundColor: WeddingPalette.primaryMuted,
    borderColor: WeddingPalette.primaryGlow,
  },
  statNum: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 32,
    color: WeddingPalette.primaryDark,
  },
  statNumLight: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 32,
    color: WeddingPalette.coralDeep,
  },
  statLabel: {
    fontFamily: WeddingFonts.sans,
    fontSize: 13,
    color: WeddingPalette.textSecondary,
    marginTop: 6,
  },
  statLabelLight: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 13,
    color: WeddingPalette.primaryDark,
    marginTop: 6,
  },
  label: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 14,
    color: WeddingPalette.text,
    marginBottom: 8,
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
  card: {
    marginTop: 28,
    padding: 22,
    borderRadius: 20,
    backgroundColor: WeddingPalette.accentMuted,
    borderWidth: 1,
    borderColor: WeddingPalette.accent,
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
