import { Pressable, StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

import { colors, radius, shadow, space } from '../theme/tokens';
import { family } from '../theme/fonts';

/**
 * The five tabs from PRD 8.1. Feather is the closest available stand-in for the
 * Lucide set the design specifies — same geometric family, and it ships with
 * Expo so the shell needs no extra native dependency.
 */
export const TABS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'trips', label: 'Trips', icon: 'briefcase' },
  { key: 'map', label: 'Map', icon: 'map' },
  { key: 'journal', label: 'Journal', icon: 'book-open' },
  { key: 'profile', label: 'You', icon: 'user' },
];

export default function BottomTabBar({ active, onChange, bottomInset = 0 }) {
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(space[2], bottomInset) }]}>
      {TABS.map((tab) => {
        const selected = tab.key === active;
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
            <Feather
              name={tab.icon}
              size={21}
              color={selected ? colors.accentRamp[700] : colors.neutral[600]}
            />
            <Text
              style={[
                styles.label,
                {
                  fontFamily: family(selected ? 'bodyExtraBold' : 'bodyMedium'),
                  color: selected ? colors.accentRamp[700] : colors.neutral[600],
                },
              ]}
            >
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
    alignItems: 'stretch',
    backgroundColor: colors.neutral[100],
    paddingTop: space[2],
    paddingHorizontal: space[2],
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    ...shadow.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    minHeight: 48,
    borderRadius: 18,
  },
  tabSelected: {
    backgroundColor: colors.accentRamp[100],
  },
  tabPressed: {
    backgroundColor: colors.neutral[200],
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.2,
  },
});
