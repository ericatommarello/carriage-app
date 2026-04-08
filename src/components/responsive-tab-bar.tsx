import { BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WeddingFonts, WeddingPalette, WeddingShadows } from '@/constants/wedding-theme';
import { useResponsive } from '@/hooks/use-responsive';

export function ResponsiveTabBar(props: BottomTabBarProps) {
  const { isTopNavLayout } = useResponsive();
  const current = props.state.routes[props.state.index];
  if (current?.name === 'sign-in') {
    return null;
  }
  if (isTopNavLayout) {
    return <DesktopTabBar {...props} />;
  }
  return (
    <BottomTabBar
      {...props}
      style={{
        backgroundColor: WeddingPalette.surface,
        borderTopWidth: 0,
        height: Platform.OS === 'ios' ? 92 : 68,
        paddingTop: 10,
        ...WeddingShadows.tabBar,
      }}
    />
  );
}

function DesktopTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { horizontalGutter } = useResponsive();
  const first = state.routes[0];

  return (
    <View
      style={[
        styles.bar,
        styles.barTop,
        {
          paddingTop: Math.max(insets.top, 12),
          paddingBottom: 12,
        },
      ]}>
      <View style={[styles.inner, { paddingHorizontal: horizontalGutter }]}>
        <Pressable
          onPress={() => navigation.navigate(first.name, first.params)}
          style={({ pressed }) => pressed && styles.pressedBrand}
          accessibilityRole="link"
          accessibilityLabel="Carriage home, Discover">
          <View style={styles.brandRow}>
            <Text style={styles.brandSpark}>✦</Text>
            <Text style={styles.brand}>Carriage</Text>
          </View>
        </Pressable>
        <View style={styles.spacer} />
        <View style={styles.tabs}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            if (route.name === 'sign-in') {
              return null;
            }
            const rawLabel = options.tabBarLabel ?? options.title ?? route.name;
            const label =
              typeof rawLabel === 'string'
                ? rawLabel
                : typeof options.title === 'string'
                  ? options.title
                  : route.name;
            const focused = state.index === index;
            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                onPress={() => {
                  const e = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !e.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                  }
                }}
                style={[styles.tab, focused && styles.tabFocused]}>
                <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    backgroundColor: WeddingPalette.surface,
    borderBottomWidth: 1,
    borderBottomColor: WeddingPalette.borderStrong,
  },
  /** Subtle shadow below top bar (tabBar shadow is tuned for bottom placement). */
  barTop: {
    shadowColor: '#4A1520',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandSpark: {
    fontSize: 16,
    color: WeddingPalette.accent,
  },
  brand: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 26,
    color: WeddingPalette.primaryDark,
    letterSpacing: 0.4,
  },
  pressedBrand: {
    opacity: 0.88,
  },
  spacer: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  tabFocused: {
    backgroundColor: WeddingPalette.primaryMuted,
  },
  tabLabel: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 14,
    color: WeddingPalette.textMuted,
  },
  tabLabelFocused: {
    color: WeddingPalette.primaryDark,
  },
});
