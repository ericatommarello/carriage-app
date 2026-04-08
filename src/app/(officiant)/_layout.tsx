import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ResponsiveTabBar } from '@/components/responsive-tab-bar';
import { WeddingFonts, WeddingPalette } from '@/constants/wedding-theme';
import { useResponsive } from '@/hooks/use-responsive';

export default function OfficiantTabLayout() {
  const { isTopNavLayout } = useResponsive();
  const shellStyle: StyleProp<ViewStyle> = [
    styles.shell,
    Platform.OS === 'web' ? styles.shellWeb : null,
  ];

  return (
    <View style={shellStyle}>
    <Tabs
      tabBar={(props) => <ResponsiveTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: isTopNavLayout ? 'top' : 'bottom',
        tabBarActiveTintColor: WeddingPalette.primary,
        tabBarInactiveTintColor: WeddingPalette.textMuted,
        tabBarLabelStyle: {
          fontFamily: WeddingFonts.sansSemibold,
          fontSize: 11,
          letterSpacing: 0.3,
        },
        tabBarStyle: isTopNavLayout
          ? undefined
          : {
              backgroundColor: WeddingPalette.surface,
              borderTopWidth: 0,
              height: Platform.OS === 'ios' ? 92 : 68,
              paddingTop: 10,
            },
      }}>
      <Tabs.Screen name="leads" options={{ title: 'Leads' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  shellWeb: {
    width: '100%',
    minHeight: '100%',
  },
});
