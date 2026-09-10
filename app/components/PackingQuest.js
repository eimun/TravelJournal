import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, space, type } from '../theme/tokens';
import { family } from '../theme/fonts';

function CheckRow({ item, onToggle }) {
  const [pop] = useState(() => new Animated.Value(item.done ? 1 : 0));

  useEffect(() => {
    Animated.spring(pop, {
      toValue: item.done ? 1 : 0,
      useNativeDriver: true,
      friction: 5,
      tension: 140,
    }).start();
  }, [item.done, pop]);

  const scale = pop.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1.18, 1] });

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
      <Animated.View
        style={[
          styles.box,
          {
            backgroundColor: item.done ? colors.accentRamp[300] : 'rgba(255,255,255,0.28)',
            transform: [{ scale }],
          },
        ]}
      >
        {item.done ? (
          <Text style={[styles.tick, { fontFamily: family('bodyExtraBold') }]}>✓</Text>
        ) : null}
      </Animated.View>

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
 * The packing checklist as a side quest — US-011.
 *
 * Framing it as a quest with visible progress is the whole point of the concept:
 * the list is the same data a plain checklist would hold, but ticking an item
 * pays out and the bag reads as something you finish, not a chore you abandon.
 */
export default function PackingQuest({ items, xp, questTitle, advice, onToggle }) {
  const done = items.filter((item) => item.done).length;
  const complete = done === items.length && items.length > 0;
  const [fill] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fill, {
      toValue: items.length ? done / items.length : 0,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [done, items.length, fill]);

  const width = fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headCopy}>
          <Text style={[styles.kicker, { fontFamily: family('bodyExtraBold') }]}>Side quest</Text>
          <Text style={[styles.title, { fontFamily: family('heading') }]}>{questTitle}</Text>
          <Text style={[styles.advice, { fontFamily: family('body') }]}>{advice}</Text>
        </View>

        <View style={styles.xpChip}>
          <Text style={[styles.xpValue, { fontFamily: family('heading') }]}>{xp}</Text>
          <Text style={[styles.xpLabel, { fontFamily: family('bodyExtraBold') }]}>XP</Text>
        </View>
      </View>

      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]} />
      </View>
      <Text style={[styles.progress, { fontFamily: family('bodyBold') }]}>
        {complete ? 'Bag packed · +40 XP' : `${done} of ${items.length} packed`}
      </Text>

      <View style={styles.rows}>
        {items.map((item) => (
          <CheckRow key={item.id} item={item} onToggle={onToggle} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accent2Ramp[600],
    borderRadius: radius.lg,
    padding: space[4],
    gap: space[2],
    ...shadow.md,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
  },
  headCopy: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    ...type.kicker,
    textTransform: 'uppercase',
    color: colors.accent2Ramp[200],
  },
  title: {
    ...type.title,
    color: colors.white,
    marginTop: 2,
    includeFontPadding: false,
  },
  advice: {
    ...type.meta,
    color: colors.accent2Ramp[100],
    marginTop: 3,
  },
  xpChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  xpValue: {
    fontSize: 20,
    color: colors.white,
    includeFontPadding: false,
  },
  xpLabel: {
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.accent2Ramp[100],
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    marginTop: space[1],
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accentRamp[300],
  },
  progress: {
    ...type.meta,
    color: colors.accent2Ramp[100],
  },
  rows: {
    gap: 7,
    marginTop: space[1],
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
    backgroundColor: 'rgba(255,255,255,0.3)',
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
    ...type.body,
    color: colors.white,
  },
  labelDone: {
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
});
