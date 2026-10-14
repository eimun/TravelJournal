import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fontFamily, radius, shadow, space } from '../theme/tokens';
import { openDiagnostics } from '../../src/logging/diagnosticsBus';

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
            onLongPress={tab.key === 'guide' ? () => openDiagnostics('tab_long_press') : undefined}
            delayLongPress={600}
            style={({ pressed }) => [
              styles.item,
              isSelected && styles.itemSelected,
              pressed && styles.itemPressed,
            ]}
          >
            {/* Active indicator bar */}
            {isSelected && <View style={styles.activeIndicator} />}
            <Svg
              width={22}
              height={22}
              viewBox="0 0 24 24"
              fill="none"
              stroke={isSelected ? '#16a34a' : '#64748b'}
              strokeWidth={isSelected ? 2.5 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Path d={tab.d} />
            </Svg>
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? '#16a34a' : '#64748b',
                  fontFamily: isSelected ? fontFamily.bodyBold : fontFamily.bodyMedium,
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
    backgroundColor: '#ffffff',
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    zIndex: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    gap: 3,
    position: 'relative',
  },
  itemSelected: {
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
  },
  itemPressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.85,
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#16a34a',
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.2,
  },
});
