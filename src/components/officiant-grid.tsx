import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useResponsive } from '@/hooks/use-responsive';

type Props = {
  children: React.ReactNode;
};

/** Wraps officiant cards: single column on native / narrow web; multi-column grid on desktop web. */
export function OfficiantGrid({ children }: Props) {
  const { isDesktop, gridColumns, gridGap, gridItemWidth } = useResponsive();
  const items = React.Children.toArray(children);

  if (!isDesktop || gridColumns <= 1) {
    return <View style={[styles.stack, { gap: gridGap }]}>{children}</View>;
  }

  return (
    <View style={[styles.gridRow, { gap: gridGap }]}>
      {items.map((child, index) => (
        <View
          key={React.isValidElement(child) && child.key != null ? String(child.key) : `g-${index}`}
          style={{ width: gridItemWidth }}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
});
