import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily, radius, shadow, space } from '../theme/tokens';

const TABS = [
  {
    key: 'navigate',
    label: 'Navigate',
    d: 'M3 11l19-9-9 19-2-8-8-2z',
  },
  {
    key: 'explore',
    label: 'Food',
    d: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7',
  },
  {
    key: 'guide',
    label: 'Guide',
    d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z',
  },
];

export default function BengaluruTabBar({ active, onChange, bottomInset = 0 }) {
  const dynamicPaddingBottom = Math.max(space[4], bottomInset + 6);

  // Map any legacy active tab key to current tab set
  const currentKey = active === 'eat' || active === 'offline' ? 'guide' : active;

  return (
    <View style={[styles.bar, { paddingBottom: dynamicPaddingBottom }]}>
      {TABS.map((tab) => {
        const isSelected = currentKey === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={({ pressed }) => [
              styles.item,
              isSelected && styles.itemSelected,
              pressed && styles.itemPressed,
            ]}
          >
            <Svg
              width={22}
              height={22}
              viewBox="0 0 24 24"
              fill="none"
              stroke={isSelected ? colors.accentRamp[800] : colors.neutral[600]}
              strokeWidth={2.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Path d={tab.d} />
            </Svg>
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? colors.accentRamp[800] : colors.neutral[600],
                  fontFamily: fontFamily.bodyBold,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.neutral[100],
    paddingTop: space[2],
    paddingHorizontal: space[3],
    borderTopWidth: 1,
    borderTopColor: 'rgba(46, 43, 37, 0.08)',
    ...shadow.md,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    gap: 4,
  },
  itemSelected: {
    backgroundColor: colors.accentRamp[200],
  },
  itemPressed: {
    transform: [{ translateY: 2 }],
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
