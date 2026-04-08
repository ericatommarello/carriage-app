import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { WeddingFonts, WeddingPalette, WeddingShadows } from '@/constants/wedding-theme';
import { priceForWeddingSize, type Officiant } from '@/data/mock-officiants';
import { useWedding } from '@/context/wedding-context';

type Props = {
  officiant: Officiant;
  variant?: 'default' | 'compact';
  /** Default true; set false on e.g. marketing landing so the ✦ Backed pill is hidden. */
  showBackedBadge?: boolean;
};

function OfficiantAvatarPhoto({
  name,
  photoUrl,
  outerSize,
  ringWidth,
  letterFontSize,
  shadowStyle,
}: {
  name: string;
  photoUrl: string;
  outerSize: number;
  ringWidth: number;
  letterFontSize: number;
  shadowStyle?: object;
}) {
  const [failed, setFailed] = React.useState(false);
  const outerR = outerSize / 2;
  const innerSize = outerSize - ringWidth * 2;
  const innerR = innerSize / 2;

  return (
    <View
      style={[
        {
          width: outerSize,
          height: outerSize,
          borderRadius: outerR,
          backgroundColor: '#FFFFFF',
          padding: ringWidth,
          alignItems: 'center',
          justifyContent: 'center',
        },
        shadowStyle,
      ]}>
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerR,
          backgroundColor: WeddingPalette.surface,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {!failed ? (
          <Image
            source={{ uri: photoUrl }}
            style={{ width: innerSize, height: innerSize }}
            onError={() => setFailed(true)}
          />
        ) : (
          <Text
            style={{
              fontFamily: WeddingFonts.displayBold,
              fontSize: letterFontSize,
              lineHeight: letterFontSize,
              width: innerSize,
              textAlign: 'center',
              color: WeddingPalette.text,
              ...Platform.select({
                android: {
                  textAlignVertical: 'center' as const,
                  includeFontPadding: false,
                },
              }),
            }}>
            {name.charAt(0)}
          </Text>
        )}
      </View>
    </View>
  );
}

export function OfficiantCard({ officiant, variant = 'default', showBackedBadge = true }: Props) {
  const { favoriteIds, toggleFavorite, matchProfile } = useWedding();
  const liked = favoriteIds.has(officiant.id);
  const badgePrice = priceForWeddingSize(officiant.pricing, matchProfile?.weddingSize);

  if (variant === 'compact') {
    return (
      <View style={[styles.compactOuter, WeddingShadows.soft, styles.fullWidth]}>
        <LinearGradient
          colors={[WeddingPalette.coral, officiant.imageColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.compactStripe}
        />
        <Link href={{ pathname: '/(couple)/browse/[id]', params: { id: officiant.id } }} asChild>
          <Pressable style={({ pressed }) => [styles.compactPress, pressed && styles.pressed]}>
            <OfficiantAvatarPhoto
              name={officiant.name}
              photoUrl={officiant.photoUrl}
              outerSize={58}
              ringWidth={3}
              letterFontSize={22}
            />
            <View style={styles.compactBody}>
              <Text style={styles.compactName}>{officiant.name}</Text>
              <Text style={styles.compactTitle}>{officiant.title}</Text>
              <Text style={styles.compactMeta}>
                ★ {officiant.rating.toFixed(2)} · from ${badgePrice}
              </Text>
            </View>
          </Pressable>
        </Link>
        <Pressable onPress={() => toggleFavorite(officiant.id)} hitSlop={12} style={styles.compactHeart}>
          <Text style={styles.compactHeartIcon}>{liked ? '♥' : '♡'}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[WeddingShadows.card, styles.fullWidth]}>
      <View style={styles.premiumShell}>
        <Link href={{ pathname: '/(couple)/browse/[id]', params: { id: officiant.id } }} asChild>
          <Pressable style={({ pressed }) => [styles.premiumPress, pressed && styles.pressed]}>
            <LinearGradient
              colors={[WeddingPalette.coral, WeddingPalette.coralSoft, officiant.imageColor]}
              locations={[0, 0.45, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}>
              <View style={styles.heroTop}>
                <View style={styles.heroLeading}>
                  <Text style={styles.heroSpark}>✦</Text>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeLabel}>from</Text>
                    <Text style={styles.priceBadgeValue}>${badgePrice}</Text>
                  </View>
                </View>
              </View>
              {showBackedBadge ? (
                <View style={styles.backedBadge} pointerEvents="none">
                  <Text style={styles.backedBadgeText}>✦ Backed</Text>
                </View>
              ) : null}
            </LinearGradient>

            <View style={styles.avatarWrap} pointerEvents="none">
              <OfficiantAvatarPhoto
                name={officiant.name}
                photoUrl={officiant.photoUrl}
                outerSize={AVATAR_SHELL}
                ringWidth={AVATAR_RING}
                letterFontSize={32}
                shadowStyle={WeddingShadows.soft}
              />
            </View>

            <View style={styles.lower}>
              <Text style={styles.name}>{officiant.name}</Text>
              <Text style={styles.role}>{officiant.title}</Text>
              <Text style={styles.location}>
                {officiant.location} · {officiant.yearsExperience}+ yrs
              </Text>

              <View style={styles.ratingRow}>
                <Text style={styles.stars}>★★★★★</Text>
                <Text style={styles.ratingNum}>{officiant.rating.toFixed(2)}</Text>
                <Text style={styles.reviewCount}>({officiant.reviewCount} reviews)</Text>
              </View>

              <View style={styles.chips}>
                {officiant.tags.slice(0, 3).map((tag) => (
                  <View key={tag} style={styles.chip}>
                    <Text style={styles.chipText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
        </Link>

        <Pressable
          onPress={() => toggleFavorite(officiant.id)}
          hitSlop={14}
          style={({ pressed }) => [styles.fabHeart, pressed && styles.fabHeartPressed]}
          accessibilityLabel={liked ? 'Remove from saved' : 'Save officiant'}>
          <Text style={styles.fabHeartIcon}>{liked ? '♥' : '♡'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const R = 22;
const HERO_HEIGHT = 128;
const AVATAR_SIZE = 78;
/** Solid white ring (3px) at gradient / body seam */
const AVATAR_RING = 3;
const AVATAR_SHELL = AVATAR_SIZE + AVATAR_RING * 2;
const AVATAR_SHELL_RADIUS = AVATAR_SHELL / 2;

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  premiumShell: {
    borderRadius: R,
    backgroundColor: WeddingPalette.surface,
    overflow: 'hidden',
  },
  premiumPress: {
    borderRadius: R,
    position: 'relative',
  },
  hero: {
    height: HERO_HEIGHT,
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopLeftRadius: R,
    borderTopRightRadius: R,
    overflow: 'visible',
    position: 'relative',
  },
  backedBadge: {
    position: 'absolute',
    left: 18,
    bottom: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: WeddingPalette.backgroundWarm,
    zIndex: 1,
  },
  backedBadgeText: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 0.4,
    color: WeddingPalette.primary,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    /** Leave top-right clear for the heart FAB (absolute); badge lives in heroLeading. */
    paddingRight: 58,
  },
  heroLeading: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
    zIndex: 1,
  },
  heroSpark: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
  },
  priceBadge: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'flex-end',
    ...WeddingShadows.soft,
    shadowOpacity: 0.12,
    zIndex: 1,
  },
  priceBadgeLabel: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 9,
    letterSpacing: 1.2,
    color: WeddingPalette.coralDeep,
    textTransform: 'uppercase',
  },
  priceBadgeValue: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 22,
    color: WeddingPalette.primaryDark,
    marginTop: -2,
  },
  avatarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: HERO_HEIGHT - AVATAR_SHELL_RADIUS,
    alignItems: 'center',
    zIndex: 3,
  },
  lower: {
    paddingTop: AVATAR_SHELL_RADIUS + 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: WeddingPalette.surface,
    minWidth: 0,
  },
  name: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 24,
    lineHeight: 28,
    color: WeddingPalette.text,
    paddingRight: 52,
    flexShrink: 1,
    ...Platform.select({
      web: {
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
      } as object,
    }),
  },
  role: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 15,
    lineHeight: 21,
    color: WeddingPalette.primaryDark,
    marginTop: 6,
    flexShrink: 1,
    ...Platform.select({
      web: {
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
      } as object,
    }),
  },
  location: {
    fontFamily: WeddingFonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: WeddingPalette.textMuted,
    marginTop: 6,
    flexShrink: 1,
    ...Platform.select({
      web: {
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
      } as object,
    }),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  stars: {
    fontSize: 13,
    color: WeddingPalette.accent,
    letterSpacing: 1,
  },
  ratingNum: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 16,
    color: WeddingPalette.text,
  },
  reviewCount: {
    fontFamily: WeddingFonts.sans,
    fontSize: 14,
    color: WeddingPalette.textSecondary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    backgroundColor: WeddingPalette.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: WeddingPalette.primaryGlow,
    maxWidth: '100%',
    flexShrink: 1,
  },
  chipText: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    color: WeddingPalette.primaryDark,
    flexShrink: 1,
    ...Platform.select({
      web: {
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
      } as object,
    }),
  },
  fabHeart: {
    ...WeddingShadows.fab,
    position: 'absolute',
    top: 14,
    right: 14,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: WeddingPalette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 8,
  },
  fabHeartPressed: {
    opacity: 0.92,
  },
  fabHeartIcon: {
    fontSize: 22,
    color: WeddingPalette.primary,
  },

  compactOuter: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 18,
    backgroundColor: WeddingPalette.surface,
    overflow: 'hidden',
    minHeight: 100,
  },
  compactStripe: {
    width: 8,
  },
  compactPress: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 8,
    gap: 14,
    alignItems: 'center',
  },
  compactBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  compactName: {
    fontFamily: WeddingFonts.display,
    fontSize: 19,
    lineHeight: 24,
    color: WeddingPalette.text,
    flexShrink: 1,
    ...Platform.select({
      web: {
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
      } as object,
    }),
  },
  compactTitle: {
    fontFamily: WeddingFonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: WeddingPalette.primaryDark,
    flexShrink: 1,
    ...Platform.select({
      web: {
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
      } as object,
    }),
  },
  compactMeta: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 13,
    color: WeddingPalette.textSecondary,
    marginTop: 2,
  },
  compactHeart: {
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  compactHeartIcon: {
    fontSize: 22,
    color: WeddingPalette.primary,
  },
});
