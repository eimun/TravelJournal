import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/tokens';
import { family } from '../theme/fonts';
import Icon from './Icon';

/** The five tabs the design canvas defines, with its own icon paths. */
export const TABS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'trail', label: 'Trail', icon: 'trail' },
  { key: 'map', label: 'Map', icon: 'map' },
  { key: 'journal', label: 'Journal', icon: 'journal' },
  { key: 'profile', label: 'You', icon: 'profile' },
];

/**
 * The tab bar as the canvas draws it: a flat light bar under a hairline, the
 * selected tab sitting in a soft terracotta pill.
 */
export default function BottomTabBar({ active, onChange }) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const selected = tab.key === active;
        const tint = selected ? colors.accentRamp[800] : colors.neutral[600];
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
            onPress={() => onChange?.(tab.key)}
            style={({ pressed }) => [
              styles.tab,
              selected && styles.tabSelected,
              pressed && styles.tabPressed,
            ]}
          >
            <Icon name={tab.icon} size={22} color={tint} />
            <Text style={[styles.label, { color: tint, fontFamily: family('bodyBold') }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 9,
    paddingHorizontal: 12,
    paddingBottom: 16,
    backgroundColor: colors.neutral[100],
    borderTopWidth: 1,
    borderTopColor: 'rgba(32,30,29,0.16)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingTop: 9,
    paddingBottom: 7,
    borderRadius: 18,
    minHeight: 48,
  },
  tabSelected: {
    backgroundColor: colors.accentRamp[200],
  },
  tabPressed: {
    transform: [{ translateY: 2 }],
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.21,
  },
});
