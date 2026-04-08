import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { WeddingFonts, WeddingPalette } from '@/constants/wedding-theme';
import { useResponsive } from '@/hooks/use-responsive';

type Props = {
  title: string;
  subtitle?: string;
  /** Short label above the title — uppercase, energetic */
  eyebrow?: string;
};

export function ScreenHeader({ title, subtitle, eyebrow }: Props) {
  const { isDesktop } = useResponsive();

  return (
    <View style={styles.wrap}>
      {eyebrow ? (
        <View style={styles.eyebrowRow}>
          <Text style={styles.spark}>✦</Text>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
        </View>
      ) : null}
      <Text style={[styles.title, isDesktop && styles.titleDesktop]}>{title}</Text>
      <View style={styles.accentRule} />
      {subtitle ? <Text style={[styles.subtitle, isDesktop && styles.subtitleDesktop]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 24,
    gap: 10,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spark: {
    fontSize: 12,
    color: WeddingPalette.accent,
  },
  eyebrow: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: WeddingPalette.coralDeep,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 34,
    lineHeight: 38,
    color: WeddingPalette.text,
    letterSpacing: 0.2,
  },
  titleDesktop: {
    fontSize: 44,
    lineHeight: 48,
    maxWidth: 900,
  },
  accentRule: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: WeddingPalette.primary,
    marginTop: 2,
  },
  subtitle: {
    fontFamily: WeddingFonts.serifItalic,
    fontSize: 17,
    lineHeight: 25,
    color: WeddingPalette.textSecondary,
    marginTop: 4,
  },
  subtitleDesktop: {
    fontSize: 20,
    lineHeight: 30,
    maxWidth: 720,
  },
});
