import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, space, type } from '../theme/tokens';
import { family } from '../theme/fonts';

const BADGE = {
  done: { label: 'Walked', bg: colors.neutral[200], fg: colors.neutral[700] },
  next: { label: 'Next', bg: colors.accentRamp[500], fg: colors.white },
  clash: { label: 'Clash', bg: colors.accentRamp[200], fg: colors.accentRamp[800] },
};

const DOT_TINT = {
  done: colors.neutral[400],
  next: colors.accentRamp[500],
  clash: colors.accentRamp[700],
};

function Row({ activity, onPress }) {
  const { state } = activity;
  const badge = BADGE[state] ?? BADGE.done;
  const [swell] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (state !== 'next') return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(swell, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(swell, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [state, swell]);

  const scale = swell.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${activity.name}. ${activity.meta}. ${badge.label}.`}
      onPress={() => onPress?.(activity)}
      style={({ pressed }) => [
        styles.row,
        state === 'next' && styles.rowNext,
        state === 'done' && styles.rowDone,
        pressed && styles.rowPressed,
      ]}
    >
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: DOT_TINT[state] ?? colors.neutral[400] },
          state === 'next' && { transform: [{ scale }] },
        ]}
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
        <Text style={[styles.badgeText, { color: badge.fg, fontFamily: family('bodyExtraBold') }]}>
          {badge.label}
        </Text>
      </View>
    </Pressable>
  );
}

/**
 * Today's timeline — US-006. Activities that have already passed are dimmed
 * rather than hidden, and the state is carried by the badge text as well as the
 * colour so nothing depends on colour alone (PRD 8.6).
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
    gap: space[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
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
  },
  rowDone: {
    opacity: 0.55,
  },
  rowPressed: {
    backgroundColor: colors.neutral[200],
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
    ...type.body,
    color: colors.text,
  },
  meta: {
    ...type.meta,
    color: colors.neutral[600],
    marginTop: 1,
  },
  badge: {
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
