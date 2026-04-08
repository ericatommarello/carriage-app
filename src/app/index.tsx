import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfficiantCard } from '@/components/officiant-card';
import { WeddingFonts, WeddingPalette } from '@/constants/wedding-theme';
import { MOCK_OFFICIANTS } from '@/data/mock-officiants';
import { useWedding } from '@/context/wedding-context';
import { useResponsive } from '@/hooks/use-responsive';

const LANDING_OFFICIANTS = MOCK_OFFICIANTS.slice(0, 3);

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { setRole } = useWedding();
  const { isDesktop, horizontalGutter, gridGap } = useResponsive();

  const startAsCouple = () => {
    setRole('couple');
    router.replace('/match');
  };

  const joinOfficiant = () => {
    setRole('officiant');
    router.replace('/officiant/apply');
  };

  return (
    <View style={[styles.root, isDesktop && styles.rootDesktop]}>
      <LinearGradient
        colors={[WeddingPalette.primaryMuted, WeddingPalette.background, WeddingPalette.backgroundWarm]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: isDesktop ? 56 : 36,
            },
          ]}>
          <View style={[styles.heroCream, isDesktop && styles.heroCreamDesktop]}>
            <View
              style={[
                styles.heroInner,
                { paddingHorizontal: horizontalGutter },
                isDesktop && styles.heroInnerDesktop,
              ]}>
              <Text style={[styles.heroHeadline, isDesktop && styles.heroHeadlineDesktop]} accessibilityRole="header">
                Your friend got ordained online on a Tuesday. Your ceremony deserves more than that.
              </Text>
              <Text style={[styles.heroSupporting, isDesktop && styles.heroSupportingDesktop]}>
                The person who pronounces you married matters more than the flowers, the venue, and the cake.
              </Text>
              <Pressable
                onPress={startAsCouple}
                style={({ pressed }) => [
                  styles.heroCtaButton,
                  isDesktop && styles.heroCtaButtonDesktop,
                  pressed && styles.ctaPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Find them on Carriage — start as a couple">
                <Text style={[styles.heroCtaButtonLabel, isDesktop && styles.heroCtaButtonLabelDesktop]}>
                  Find them on Carriage — the marketplace for wedding officiants.
                </Text>
              </Pressable>
            </View>
          </View>

          <View
            style={[
              styles.pageInner,
              { paddingHorizontal: horizontalGutter },
              isDesktop && styles.pageInnerDesktop,
            ]}>
            <View
              style={[
                styles.cardsRow,
                isDesktop && styles.cardsRowDesktop,
                { gap: gridGap },
              ]}>
              {LANDING_OFFICIANTS.map((officiant) => (
                <View key={officiant.id} style={isDesktop ? styles.cardColumnDesktop : styles.cardColumnMobile}>
                  <OfficiantCard officiant={officiant} showBackedBadge={false} />
                </View>
              ))}
            </View>

            <Text style={[styles.trustStrip, isDesktop && styles.trustStripDesktop]} accessibilityRole="text">
              <Text style={styles.trustShield}>🛡 </Text>
              Every officiant on Carriage is backed by our Backup Guarantee — if they cancel, we make it right.
            </Text>

            <View style={[styles.ctaRow, isDesktop && styles.ctaRowDesktop]}>
              <Pressable
                onPress={startAsCouple}
                style={({ pressed }) => [styles.ctaSolid, pressed && styles.ctaPressed]}
                accessibilityRole="button"
                accessibilityLabel="We are getting married">
                <Text style={styles.ctaSolidLabel}>We&apos;re getting married</Text>
              </Pressable>
              <Pressable
                onPress={joinOfficiant}
                style={({ pressed }) => [styles.ctaOutline, pressed && styles.ctaPressed]}
                accessibilityRole="button"
                accessibilityLabel="I am an officiant">
                <Text style={styles.ctaOutlineLabel}>I&apos;m an officiant</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WeddingPalette.background,
  },
  rootDesktop: {
    minHeight: '100%',
    width: '100%',
  },
  safe: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: '100%',
    paddingTop: 0,
  },
  heroCream: {
    width: '100%',
    backgroundColor: WeddingPalette.background,
    paddingVertical: 28,
    borderBottomWidth: 1,
    borderBottomColor: WeddingPalette.border,
  },
  heroCreamDesktop: {
    paddingVertical: 44,
  },
  heroInner: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    alignItems: 'center',
  },
  heroInnerDesktop: {
    maxWidth: 880,
  },
  heroHeadline: {
    fontFamily: WeddingFonts.serif,
    fontSize: 28,
    lineHeight: 36,
    color: WeddingPalette.text,
    letterSpacing: -0.2,
    marginBottom: 16,
    textAlign: 'center',
  },
  heroHeadlineDesktop: {
    fontSize: 44,
    lineHeight: 54,
    marginBottom: 20,
  },
  heroSupporting: {
    fontFamily: WeddingFonts.serif,
    fontSize: 17,
    lineHeight: 26,
    color: WeddingPalette.textSecondary,
    letterSpacing: -0.05,
    textAlign: 'center',
    marginBottom: 22,
    maxWidth: 640,
  },
  heroSupportingDesktop: {
    fontSize: 22,
    lineHeight: 32,
    marginBottom: 26,
    maxWidth: 720,
  },
  heroCtaButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 560,
    backgroundColor: WeddingPalette.coral,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(232, 90, 74, 0.28)',
      },
      default: {
        shadowColor: WeddingPalette.coralDeep,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
        elevation: 5,
      },
    }),
  },
  heroCtaButtonDesktop: {
    maxWidth: 520,
    paddingVertical: 18,
    paddingHorizontal: 36,
  },
  heroCtaButtonLabel: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.12,
    color: WeddingPalette.onAccent,
    textAlign: 'center',
  },
  heroCtaButtonLabelDesktop: {
    fontSize: 18,
    lineHeight: 26,
  },
  pageInner: {
    width: '100%',
    paddingTop: 24,
  },
  pageInnerDesktop: {
    maxWidth: 1200,
    alignSelf: 'center',
    paddingTop: 32,
  },
  cardsRow: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  cardsRowDesktop: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  cardColumnMobile: {
    width: '100%',
    alignSelf: 'stretch',
  },
  cardColumnDesktop: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
  },
  ctaRow: {
    width: '100%',
    marginTop: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    columnGap: 18,
    rowGap: 14,
    paddingHorizontal: 4,
  },
  ctaRowDesktop: {
    marginTop: 36,
    columnGap: 24,
    rowGap: 16,
  },
  ctaSolid: {
    backgroundColor: WeddingPalette.coral,
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 18,
    minWidth: 168,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(232, 90, 74, 0.28)',
      },
      default: {
        shadowColor: WeddingPalette.coralDeep,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
        elevation: 5,
      },
    }),
  },
  ctaOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: WeddingPalette.coral,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 18,
    minWidth: 168,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  ctaSolidLabel: {
    fontFamily: WeddingFonts.serif,
    fontSize: 18,
    lineHeight: 24,
    color: WeddingPalette.onAccent,
    textAlign: 'center',
  },
  ctaOutlineLabel: {
    fontFamily: WeddingFonts.serif,
    fontSize: 18,
    lineHeight: 24,
    color: WeddingPalette.coral,
    textAlign: 'center',
  },
  trustStrip: {
    marginTop: 28,
    marginBottom: 4,
    paddingHorizontal: 12,
    maxWidth: 720,
    alignSelf: 'center',
    fontFamily: WeddingFonts.sans,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: WeddingPalette.textSecondary,
  },
  trustStripDesktop: {
    marginTop: 36,
    maxWidth: 820,
    fontSize: 15,
    lineHeight: 22,
  },
  trustShield: {
    fontSize: 14,
    lineHeight: 21,
    color: WeddingPalette.coralDeep,
    opacity: 0.72,
  },
});
