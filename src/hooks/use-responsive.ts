import { Platform, useWindowDimensions } from 'react-native';

/** Web: top tab bar replaces bottom bar (Carriage logo + links). */
export const TOP_NAV_BREAKPOINT = 768;
/** Viewport width at which web layout switches to desktop (full-width + grid). */
export const DESKTOP_BREAKPOINT = 960;
/** Extra-wide: three-column officiant grid. */
export const WIDE_BREAKPOINT = 1320;

export const LAYOUT = {
  gutterMobile: 20,
  gutterDesktop: 40,
  gutterWide: 56,
  gridGap: 24,
} as const;

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isTopNavLayout = isWeb && width >= TOP_NAV_BREAKPOINT;
  const isDesktop = isWeb && width >= DESKTOP_BREAKPOINT;
  const isWide = isWeb && width >= WIDE_BREAKPOINT;

  const horizontalGutter = !isDesktop
    ? LAYOUT.gutterMobile
    : isWide
      ? LAYOUT.gutterWide
      : LAYOUT.gutterDesktop;

  const gridColumns = !isDesktop ? 1 : isWide ? 3 : 2;
  const usableWidth = Math.max(0, width - horizontalGutter * 2);
  const gridItemWidth =
    isDesktop && gridColumns > 1
      ? (usableWidth - LAYOUT.gridGap * (gridColumns - 1)) / gridColumns
      : usableWidth;

  return {
    width,
    height,
    isWeb,
    isTopNavLayout,
    isDesktop,
    isWide,
    horizontalGutter,
    gridColumns,
    gridGap: LAYOUT.gridGap,
    gridItemWidth,
  };
}
