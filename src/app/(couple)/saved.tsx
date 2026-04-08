import { Link } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfficiantCard } from '@/components/officiant-card';
import { OfficiantGrid } from '@/components/officiant-grid';
import { WeddingFonts, WeddingPalette, WeddingShadows } from '@/constants/wedding-theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useWedding } from '@/context/wedding-context';

export default function SavedScreen() {
  const { officiants, favoriteIds } = useWedding();
  const { horizontalGutter, isDesktop, isTopNavLayout } = useResponsive();
  const safeEdges = isDesktop || isTopNavLayout ? ([] as const) : (['top'] as const);
  const saved = useMemo(
    () => officiants.filter((o) => favoriteIds.has(o.id)),
    [officiants, favoriteIds],
  );

  return (
    <SafeAreaView style={styles.safe} edges={safeEdges}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: horizontalGutter,
            paddingBottom: isDesktop || isTopNavLayout ? 48 : 36,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Your shortlist</Text>
        <View style={styles.rule} />

        {saved.length === 0 ? (
          <View style={[styles.empty, WeddingShadows.soft, isDesktop && styles.emptyDesktop]}>
            <Text style={styles.emptyIcon}>♡</Text>
            <Text style={styles.emptyMessage}>Heart an officiant to save them here.</Text>
            <Link href="/browse" asChild>
              <Pressable style={({ pressed }) => [styles.browseButton, pressed && styles.browseButtonPressed]}>
                <Text style={styles.browseButtonLabel}>Browse officiants</Text>
              </Pressable>
            </Link>
          </View>
        ) : (
          <OfficiantGrid>
            {saved.map((o) => (
              <OfficiantCard key={o.id} officiant={o} variant="compact" />
            ))}
          </OfficiantGrid>
        )}
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
    paddingTop: 8,
  },
  heading: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 34,
    lineHeight: 38,
    color: WeddingPalette.text,
    marginBottom: 10,
  },
  rule: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: WeddingPalette.primary,
    marginBottom: 28,
  },
  empty: {
    paddingVertical: 40,
    paddingHorizontal: 28,
    borderRadius: 20,
    backgroundColor: WeddingPalette.surface,
    borderWidth: 1,
    borderColor: WeddingPalette.border,
    alignItems: 'center',
    gap: 16,
  },
  emptyDesktop: {
    paddingVertical: 48,
    paddingHorizontal: 48,
    maxWidth: 560,
    alignSelf: 'center',
  },
  emptyIcon: {
    fontSize: 44,
    color: WeddingPalette.primary,
  },
  emptyMessage: {
    fontFamily: WeddingFonts.sans,
    fontSize: 17,
    lineHeight: 26,
    color: WeddingPalette.textSecondary,
    textAlign: 'center',
  },
  browseButton: {
    marginTop: 8,
    backgroundColor: WeddingPalette.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    ...WeddingShadows.button,
  },
  browseButtonPressed: {
    opacity: 0.92,
    backgroundColor: WeddingPalette.primaryPressed,
  },
  browseButtonLabel: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 16,
    color: WeddingPalette.onAccent,
  },
});
