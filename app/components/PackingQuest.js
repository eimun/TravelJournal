import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';
import { family } from '../theme/fonts';
import { Chunky } from './Chunky';

/** One checklist row. Ticking pops the box (`tj-pop`: .4 → 1.18 → 1). */
function CheckRow({ item, onToggle }) {
  const [pop] = useState(() => new Animated.Value(item.done ? 1 : 0));

  useEffect(() => {
    if (!item.done) {
      pop.setValue(0);
      return;
    }
    pop.setValue(0);
    Animated.timing(pop, { toValue: 1, duration: 340, useNativeDriver: true }).start();
  }, [item.done, pop]);

  const scale = pop.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.4, 1.18, 1] });

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.done }}
      accessibilityLabel={item.label}
      onPress={() => onToggle?.(item)}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: `rgba(255,255,255,${item.done ? 0.22 : 0.12})` },
        pressed && styles.rowPressed,
      ]}
    >
      <View
        style={[
          styles.box,
          { backgroundColor: item.done ? colors.accentRamp[300] : 'rgba(255,255,255,0.28)' },
        ]}
      >
        {item.done ? (
          <Animated.Text
            style={[styles.tick, { fontFamily: family('bodyBold'), transform: [{ scale }] }]}
          >
            ✓
          </Animated.Text>
        ) : null}
      </View>

      <Text
        numberOfLines={1}
        style={[styles.label, { fontFamily: family('bodyBold') }, item.done && styles.labelDone]}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

/**
 * The packing checklist as a side quest — US-011 — as the canvas draws it: a
 * sage card on a chunky base, the count and the reward in one line, a bar that
 * springs forward as items are ticked, and the rows.
 */
export default function PackingQuest({ items, questTitle, onToggle }) {
  const done = items.filter((item) => item.done).length;
  const total = items.length;
  const [fill] = useState(() => new Animated.Value(total ? done / total : 0));

  useEffect(() => {
    // cubic-bezier(.34,1.56,.64,1) on the canvas — a spring with a little overshoot.
    Animated.spring(fill, {
      toValue: total ? done / total : 0,
      useNativeDriver: false,
      friction: 6,
      tension: 90,
    }).start();
  }, [done, total, fill]);

  const width = fill.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <Chunky
      depth={6}
      depthColor={colors.accent2Ramp[800]}
      radius={radius.lg}
      innerStyle={styles.card}
    >
      <Text style={[styles.kicker, { fontFamily: family('bodyBold') }]}>SIDE QUEST</Text>
      <Text style={[styles.title, { fontFamily: family('heading') }]}>{questTitle}</Text>
      <Text style={[styles.sub, { fontFamily: family('body') }]}>
        {`${done} of ${total} packed · +40 XP when it is done`}
      </Text>

      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]} />
      </View>

      <View style={styles.rows}>
        {items.map((item) => (
          <CheckRow key={item.id} item={item} onToggle={onToggle} />
        ))}
      </View>
    </Chunky>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accent2Ramp[600],
    padding: 17,
  },
  kicker: {
    fontSize: 11.5,
    letterSpacing: 1.38,
    color: colors.white,
    opacity: 0.85,
  },
  title: {
    fontSize: 21,
    lineHeight: 27,
    color: colors.white,
    marginTop: 7,
    marginBottom: 3,
    includeFontPadding: false,
  },
  sub: {
    fontSize: 13,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 13,
  },
  track: {
    height: 11,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.22)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accentRamp[300],
  },
  rows: {
    gap: 8,
    marginTop: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 13,
    minHeight: 48,
  },
  rowPressed: {
    transform: [{ scale: 0.985 }],
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    fontSize: 14,
    color: colors.accent2Ramp[800],
    includeFontPadding: false,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: colors.white,
  },
  labelDone: {
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
});
