import { Link } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfficiantCard } from '@/components/officiant-card';
import { OfficiantGrid } from '@/components/officiant-grid';
import { ScreenHeader } from '@/components/screen-header';
import { WeddingFonts, WeddingPalette, WeddingShadows } from '@/constants/wedding-theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useWedding } from '@/context/wedding-context';
import { sortOfficiantsByMatch } from '@/types/match-profile';

export default function CoupleBrowseScreen() {
  const { officiants, matchProfile } = useWedding();
  const { horizontalGutter, isDesktop, isTopNavLayout } = useResponsive();
  const safeEdges = isDesktop || isTopNavLayout ? ([] as const) : (['top'] as const);

  const sortedOfficiants = useMemo(() => {
    if (!matchProfile) return officiants;
    return sortOfficiantsByMatch(officiants, matchProfile);
  }, [officiants, matchProfile]);

  return (
    <SafeAreaView style={styles.safe} edges={safeEdges}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: horizontalGutter,
            paddingTop: isDesktop || isTopNavLayout ? 32 : 24,
            paddingBottom: isDesktop || isTopNavLayout ? 48 : 36,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="Discover"
          title="Meet your moment"
          subtitle="Rich bios, honest pricing, and officiants who bring heart—not a script—to your aisle."
        />

        <Text style={[styles.gridTip, isDesktop && styles.gridTipDesktop]}>
          Tap a card to explore · Heart to save · Message when ready.
        </Text>

        {matchProfile ? (
          <View style={[styles.matchBanner, isDesktop && styles.matchBannerDesktop]}>
            <Text style={styles.matchBannerText}>
              ✦ Sorted for you based on your answers ·{' '}
            </Text>
            <Link href="/match" asChild>
              <Pressable hitSlop={6}>
                <Text style={styles.matchBannerLink}>Edit preferences</Text>
              </Pressable>
            </Link>
          </View>
        ) : (
          <View style={[styles.promptCard, WeddingShadows.soft, isDesktop && styles.promptCardDesktop]}>
            <Text style={styles.promptText}>
              ✦ Want us to sort these for you?{' '}
            </Text>
            <Link href="/match" asChild>
              <Pressable hitSlop={6}>
                <Text style={styles.promptLink}>Tell us about your day →</Text>
              </Pressable>
            </Link>
          </View>
        )}

        <Text style={styles.sectionLabel}>
          {sortedOfficiants.length} celebrants ready to meet you
        </Text>
        <OfficiantGrid>
          {sortedOfficiants.map((o) => (
            <OfficiantCard key={o.id} officiant={o} />
          ))}
        </OfficiantGrid>
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
  gridTip: {
    fontFamily: WeddingFonts.serifItalic,
    fontSize: 15,
    lineHeight: 22,
    color: WeddingPalette.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  gridTipDesktop: {
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 720,
  },
  sectionLabel: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: WeddingPalette.coralDeep,
    marginBottom: 14,
  },
  matchBanner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 14,
    gap: 4,
  },
  matchBannerDesktop: {
    maxWidth: 720,
  },
  matchBannerText: {
    fontFamily: WeddingFonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: WeddingPalette.textSecondary,
  },
  matchBannerLink: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 14,
    color: WeddingPalette.primary,
  },
  promptCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: WeddingPalette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: WeddingPalette.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 6,
  },
  promptCardDesktop: {
    maxWidth: 720,
  },
  promptText: {
    fontFamily: WeddingFonts.sans,
    fontSize: 14,
    color: WeddingPalette.textSecondary,
  },
  promptLink: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 14,
    color: WeddingPalette.primary,
  },
});
