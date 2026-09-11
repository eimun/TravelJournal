import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow } from '../theme/tokens';
import { family } from '../theme/fonts';
import { useSwing } from './motion';

/** Badge per state, as the canvas styles `row.badge`. The word is the state itself. */
const BADGE = {
  done: { bg: colors.neutral[200], fg: colors.neutral[700] },
  next: { bg: colors.accentRamp[500], fg: colors.white },
  clash: { bg: colors.accentRamp[200], fg: colors.accentRamp[800] },
};

const DOT = {
  done: colors.neutral[400],
  next: colors.accentRamp[500],
  clash: colors.accentRamp[700],
};

function Row({ activity, onPress }) {
  const { state } = activity;
  const badge = BADGE[state] ?? BADGE.done;
  // tj-swell 1.6s on the next stop's dot.
  const swell = useSwing(800, state === 'next');
  const scale = swell.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${activity.name}. ${activity.meta}. ${state}.`}
      onPress={() => onPress?.(activity)}
      style={({ pressed }) => [
        styles.row,
        state === 'next' && styles.rowNext,
        state === 'done' && styles.rowDone,
        pressed && styles.rowPressed,
      ]}
    >
      <Animated.View
        style={[styles.dot, { backgroundColor: DOT[state] ?? DOT.done, transform: [{ scale }] }]}
      />

      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.name, { fontFamily: family('bodyBold') }]}>
          {activity.name}
        </Text>
        <Text numberOfLines={1} style={[styles.meta, { fontFamily: family('body') }]}>
          {activity.meta}
        </Text>
      </View>

      <View style={[styles.badge, { backgroundColor: badge.bg }]}>
        <Text style={[styles.badgeText, { color: badge.fg, fontFamily: family('bodyBold') }]}>
          {state.toUpperCase()}
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * Today's timeline — US-006. Passed stops are dimmed rather than hidden, and the
 * state is spelled out in the badge as well as tinted, so nothing depends on
 * colour alone (PRD 8.6).
 */
export default function TodayList({ activities, onSelect }) {
  return (
    <View style={styles.list}>
      {activities.map((activity) => (
        <Row key={activity.id} activity={activity} onPress={onSelect} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 14,
    minHeight: 48,
    ...shadow.sm,
  },
  rowNext: {
    backgroundColor: colors.accentRamp[100],
    borderWidth: 2,
    borderColor: colors.accentRamp[400],
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  rowDone: {
    opacity: 0.55,
  },
  rowPressed: {
    transform: [{ scale: 0.99 }],
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14.5,
    lineHeight: 18,
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.neutral[600],
    marginTop: 3,
  },
  badge: {
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  badgeText: {
    fontSize: 10.5,
    letterSpacing: 0.84,
  },
});
