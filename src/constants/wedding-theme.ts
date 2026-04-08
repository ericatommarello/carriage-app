import { Platform } from 'react-native';

/**
 * Warm, confident wedding marketplace — rich coral & rose with ivory bases.
 * Still appropriate for ceremonies: celebratory, not corporate or neon.
 */
export const WeddingPalette = {
  background: '#FFFAF8',
  backgroundWarm: '#FFF5F0',
  surface: '#FFFFFF',
  surfaceWarm: '#FFFCFA',

  primary: '#D94D5A',
  primaryPressed: '#C73E4B',
  primaryDark: '#A8303D',
  primaryMuted: '#FFE8E5',
  primaryGlow: '#FFCDC7',

  coral: '#E85A4A',
  coralSoft: '#FF9485',
  coralDeep: '#C4473C',

  accent: '#E1994C',
  accentBright: '#F0B04D',
  accentMuted: '#FAE8CE',

  gold: '#C9944B',

  text: '#3A2F32',
  textSecondary: '#6D5E62',
  textMuted: '#9A898D',

  border: '#F0D6D0',
  borderStrong: '#E8B4AC',

  ink: '#4A3540',

  success: '#6D9B6A',

  /** Light text on saturated buttons / hero footers */
  onAccent: '#FFFBF9',
} as const;

export const WeddingShadows = {
  card: {
    shadowColor: '#4A1520',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: Platform.select({ android: 0.18, default: 0.14 }) ?? 0.14,
    shadowRadius: 22,
    elevation: 10,
  },
  soft: {
    shadowColor: '#4A1520',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
  button: {
    shadowColor: '#C4473C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  fab: {
    shadowColor: '#4A1520',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  tabBar: {
    shadowColor: '#4A1520',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
} as const;

export const WeddingFonts = {
  display: 'CormorantGaramond_600SemiBold',
  displayBold: 'CormorantGaramond_700Bold',
  serif: 'CormorantGaramond_500Medium',
  serifItalic: 'CormorantGaramond_500Medium_Italic',
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemibold: 'DMSans_600SemiBold',
} as const;
