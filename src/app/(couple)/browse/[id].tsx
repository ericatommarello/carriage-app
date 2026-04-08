import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useLayoutEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WeddingFonts, WeddingPalette, WeddingShadows } from '@/constants/wedding-theme';
import { getPlaceholderReviews } from '@/data/mock-reviews';
import { useResponsive } from '@/hooks/use-responsive';
import { useWedding } from '@/context/wedding-context';
import type { WeddingSize } from '@/types/match-profile';

const PRICING_DETAIL_ROWS: { size: WeddingSize; label: string }[] = [
  { size: 'micro', label: 'Elopement / micro' },
  { size: 'intimate', label: 'Intimate (30–75)' },
  { size: 'full', label: 'Full celebration (75–150)' },
  { size: 'grand', label: 'Grand affair (150+)' },
];

export default function CoupleOfficiantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isDesktop, horizontalGutter } = useResponsive();
  const { officiants, getOrCreateThreadForOfficiant, coupleDisplayName, matchProfile } = useWedding();
  const officiant = officiants.find((o) => o.id === id);
  const [heroPhotoFailed, setHeroPhotoFailed] = useState(false);

  const startMessage = () => {
    if (!id) return;
    const thread = getOrCreateThreadForOfficiant(id, coupleDisplayName);
    router.push({ pathname: '/(couple)/messages/[id]', params: { id: thread.id } });
  };

  useLayoutEffect(() => {
    if (!officiant) return;
    navigation.setOptions({
      title: officiant.name,
      headerBackTitle: 'All celebrants',
    });
  }, [navigation, officiant]);

  useLayoutEffect(() => {
    setHeroPhotoFailed(false);
  }, [id]);

  if (!officiant) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.missing}>This officiant is no longer listed.</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backLabel}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const short = officiant.name.split(' ')[0];
  const placeholderReviews = getPlaceholderReviews(officiant.id);

  const yourSize = matchProfile?.weddingSize;

  const hero = (
    <View style={[styles.hero, WeddingShadows.soft, isDesktop && styles.heroDesktop]}>
      {!heroPhotoFailed ? (
        <Image
          source={{ uri: officiant.photoUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
          onError={() => setHeroPhotoFailed(true)}
        />
      ) : (
        <LinearGradient
          colors={[WeddingPalette.coral, WeddingPalette.coralSoft, officiant.imageColor]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {heroPhotoFailed ? (
        <View style={styles.heroFallbackAvatar} pointerEvents="none">
          <Text style={styles.heroInitial}>{officiant.name.charAt(0)}</Text>
        </View>
      ) : null}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.78)']}
        locations={[0.42, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.heroBottomFade}
        pointerEvents="none"
      />
      <Text style={styles.heroSpark}>✦</Text>
      <View style={styles.heroCopy}>
        <Text style={[styles.heroName, isDesktop && styles.heroNameDesktop]}>{officiant.name}</Text>
        <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>{officiant.title}</Text>
      </View>
    </View>
  );

  const mainContent = (
    <>
      <View style={[styles.trustBanner, WeddingShadows.soft]}>
        <View style={styles.trustBannerTitleRow}>
          <Text style={styles.trustBannerSpark}>✦</Text>
          <Text style={styles.trustBannerHeadline}>Backed by the Carriage Guarantee</Text>
        </View>
        <Text style={styles.trustBannerBody}>
          If your officiant cancels, we make it right — rebooking credit, backup placement, and full support.
        </Text>
      </View>

      <View style={styles.pricingTable}>
        {PRICING_DETAIL_ROWS.map((row, i) => {
          const active = yourSize != null && yourSize === row.size;
          const isLast = i === PRICING_DETAIL_ROWS.length - 1;
          return (
            <View
              key={row.size}
              style={[styles.pricingRow, active && styles.pricingRowHighlight, !isLast && styles.pricingRowBorder]}>
              <Text style={styles.pricingRowLabel}>{row.label}</Text>
              <Text style={styles.pricingRowPrice}>${officiant.pricing[row.size]}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.stats}>
        <View style={styles.statPill}>
          <Text style={styles.statVal}>{officiant.rating.toFixed(2)} ★</Text>
          <Text style={styles.statLab}>{officiant.reviewCount} reviews</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statVal}>{officiant.yearsExperience}+</Text>
          <Text style={styles.statLab}>years</Text>
        </View>
      </View>

      <Text style={styles.meta}>
        <Text style={styles.metaStrong}>{officiant.location}</Text>
        {' · '}
        ceremonies & celebrations
      </Text>

      <View style={styles.tagRow}>
        {officiant.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.bioLabel}>Why couples love {short}</Text>
      <Text style={[styles.bio, isDesktop && styles.bioDesktop]}>{officiant.bio}</Text>
    </>
  );

  const cta = (
    <Pressable
      onPress={startMessage}
      style={({ pressed }) => [styles.cta, WeddingShadows.button, pressed && styles.ctaPressed]}>
      <LinearGradient
        colors={[WeddingPalette.primary, WeddingPalette.primaryPressed]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.ctaGradient}>
        <Text style={styles.ctaText}>Request a free consultation</Text>
        <Text style={styles.ctaSub}>Free 20-min call — no commitment</Text>
      </LinearGradient>
    </Pressable>
  );

  const reviewsSection = (
    <View style={[styles.reviewsSection, isDesktop && styles.reviewsSectionDesktop]}>
      <Text style={styles.reviewsHeading}>What couples say</Text>
      <View style={styles.reviewsGrid}>
        {placeholderReviews.map((r) => (
          <View key={r.id} style={[styles.reviewCard, WeddingShadows.soft]}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewAuthor}>{r.author}</Text>
              <Text style={styles.reviewStars}>
                {'★'.repeat(r.stars)}
                {'☆'.repeat(5 - r.stars)}
              </Text>
            </View>
            <Text style={styles.reviewQuote}>&ldquo;{r.quote}&rdquo;</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        {
          paddingHorizontal: horizontalGutter,
          paddingBottom: 32 + insets.bottom,
        },
      ]}>
      {isDesktop ? (
        <>
          <View style={styles.desktopRow}>
            <View style={styles.desktopColHero}>{hero}</View>
            <View style={styles.desktopColMain}>
              {mainContent}
              {cta}
            </View>
          </View>
          {reviewsSection}
        </>
      ) : (
        <>
          {hero}
          {mainContent}
          {cta}
          {reviewsSection}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: WeddingPalette.background,
  },
  content: {
    width: '100%',
    maxWidth: '100%',
  },
  desktopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 40,
    width: '100%',
    paddingTop: 8,
  },
  desktopColHero: {
    flex: 1,
    minWidth: 320,
    maxWidth: 440,
  },
  desktopColMain: {
    flex: 1.2,
    minWidth: 360,
    maxWidth: 720,
  },
  hero: {
    borderRadius: 24,
    marginTop: 4,
    marginBottom: 20,
    overflow: 'hidden',
    minHeight: 300,
    position: 'relative',
  },
  heroDesktop: {
    marginBottom: 0,
    minHeight: 420,
  },
  heroBottomFade: {
    ...StyleSheet.absoluteFillObject,
  },
  heroSpark: {
    position: 'absolute',
    top: 22,
    left: 22,
    fontSize: 18,
    color: 'rgba(255,255,255,0.95)',
    zIndex: 2,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroFallbackAvatar: {
    position: 'absolute',
    left: '50%',
    marginLeft: -46,
    top: '50%',
    marginTop: -46,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: WeddingPalette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.95)',
    ...WeddingShadows.soft,
    zIndex: 1,
  },
  heroInitial: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 40,
    color: WeddingPalette.text,
  },
  heroCopy: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 22,
    paddingBottom: 26,
    paddingTop: 48,
    zIndex: 2,
  },
  heroName: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  heroNameDesktop: {
    fontSize: 32,
  },
  heroTitle: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  heroTitleDesktop: {
    fontSize: 18,
    lineHeight: 26,
  },
  trustBanner: {
    width: '100%',
    backgroundColor: WeddingPalette.surfaceWarm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: WeddingPalette.primaryGlow,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowOpacity: 0.08,
  },
  trustBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  trustBannerSpark: {
    fontSize: 15,
    color: WeddingPalette.primary,
  },
  trustBannerHeadline: {
    flex: 1,
    minWidth: 200,
    fontFamily: WeddingFonts.displayBold,
    fontSize: 18,
    lineHeight: 24,
    color: WeddingPalette.primaryDark,
  },
  trustBannerBody: {
    fontFamily: WeddingFonts.sans,
    fontSize: 14,
    lineHeight: 22,
    color: WeddingPalette.textSecondary,
  },
  pricingTable: {
    width: '100%',
    backgroundColor: WeddingPalette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: WeddingPalette.border,
    marginBottom: 16,
    overflow: 'hidden',
    ...WeddingShadows.soft,
    shadowOpacity: 0.06,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  pricingRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WeddingPalette.border,
  },
  pricingRowHighlight: {
    backgroundColor: WeddingPalette.primaryMuted,
  },
  pricingRowLabel: {
    flex: 1,
    fontFamily: WeddingFonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: WeddingPalette.textSecondary,
  },
  pricingRowPrice: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 16,
    color: WeddingPalette.primary,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statPill: {
    flexGrow: 1,
    minWidth: '28%',
    backgroundColor: WeddingPalette.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: WeddingPalette.border,
    ...WeddingShadows.soft,
    shadowOpacity: 0.06,
  },
  statVal: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 20,
    color: WeddingPalette.primaryDark,
  },
  statLab: {
    fontFamily: WeddingFonts.sans,
    fontSize: 11,
    color: WeddingPalette.textMuted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  meta: {
    fontFamily: WeddingFonts.sans,
    fontSize: 15,
    color: WeddingPalette.textSecondary,
    lineHeight: 22,
    marginBottom: 14,
  },
  metaStrong: {
    fontFamily: WeddingFonts.sansSemibold,
    color: WeddingPalette.text,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  tag: {
    backgroundColor: WeddingPalette.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: WeddingPalette.primaryGlow,
  },
  tagText: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 13,
    color: WeddingPalette.primaryDark,
  },
  bioLabel: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 22,
    color: WeddingPalette.text,
    marginBottom: 10,
  },
  bio: {
    fontFamily: WeddingFonts.sans,
    fontSize: 17,
    lineHeight: 27,
    color: WeddingPalette.text,
  },
  bioDesktop: {
    fontSize: 18,
    lineHeight: 29,
  },
  cta: {
    marginTop: 28,
    borderRadius: 18,
    overflow: 'hidden',
  },
  ctaPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  ctaGradient: {
    paddingVertical: 18,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 22,
    color: WeddingPalette.onAccent,
  },
  ctaSub: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 14,
    color: 'rgba(255,251,249,0.88)',
    marginTop: 6,
  },
  reviewsSection: {
    width: '100%',
    marginTop: 28,
    paddingTop: 8,
  },
  reviewsSectionDesktop: {
    marginTop: 36,
    maxWidth: 960,
    alignSelf: 'center',
  },
  reviewsHeading: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 22,
    color: WeddingPalette.text,
    marginBottom: 16,
  },
  reviewsGrid: {
    gap: 14,
  },
  reviewCard: {
    backgroundColor: WeddingPalette.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: WeddingPalette.border,
    shadowOpacity: 0.06,
  },
  reviewHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  reviewAuthor: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 15,
    color: WeddingPalette.text,
  },
  reviewStars: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 14,
    color: WeddingPalette.primaryDark,
    letterSpacing: 1,
  },
  reviewQuote: {
    fontFamily: WeddingFonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: WeddingPalette.textSecondary,
    fontStyle: 'italic',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: WeddingPalette.background,
  },
  missing: {
    fontFamily: WeddingFonts.sans,
    fontSize: 16,
    color: WeddingPalette.textSecondary,
    textAlign: 'center',
  },
  backBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backLabel: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 15,
    color: WeddingPalette.primary,
  },
});
