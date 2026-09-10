import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, space, type } from '../theme/tokens';
import { family } from '../theme/fonts';
import { formatCountdown } from '../../src/domain/format';
import { Kicker } from './primitives';

/**
 * The next timed activity with a live countdown — US-006.
 *
 * The dot beside the countdown swells on a loop so the card reads as counting
 * down even when the number itself has not ticked over yet.
 */
export default function NextUpCard({ activity, minutesNow, onOpenTrail, onSnooze, snoozed }) {
  const [swell] = useState(() => new Animated.Value(0));

  useEffect(() => {
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
  }, [swell]);

  const scale = swell.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const countdown = formatCountdown(activity.startMinutes - minutesNow);

  return (
    <View style={styles.card}>
      <View style={styles.kickerRow}>
        <Animated.View style={[styles.pulse, { transform: [{ scale }] }]} />
        <Kicker tone="accent">{`Next up · in ${countdown}`}</Kicker>
      </View>

      <Text style={[styles.name, { fontFamily: family('heading') }]}>{activity.name}</Text>
      <Text style={[styles.meta, { fontFamily: family('body') }]}>{activity.meta}</Text>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open the trail at ${activity.name}`}
          onPress={onOpenTrail}
          style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
        >
          <Text style={[styles.primaryText, { fontFamily: family('bodyBold') }]}>
            Open the trail
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: snoozed }}
          accessibilityLabel={snoozed ? 'Snoozed' : 'Snooze this reminder'}
          onPress={onSnooze}
          style={({ pressed }) => [styles.ghost, pressed && styles.ghostPressed]}
        >
          <Text style={[styles.ghostText, { fontFamily: family('bodyBold') }]}>
            {snoozed ? 'Snoozed' : 'Snooze'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accentRamp[100],
    borderRadius: radius.lg,
    padding: space[4],
    borderWidth: 2,
    borderColor: colors.accentRamp[300],
    ...shadow.sm,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  pulse: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.accentRamp[500],
  },
  name: {
    ...type.title,
    color: colors.text,
    marginTop: space[2],
    includeFontPadding: false,
  },
  meta: {
    ...type.body,
    color: colors.neutral[700],
    marginTop: space[1],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    marginTop: space[3],
  },
  primary: {
    backgroundColor: colors.accentRamp[500],
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: 20,
    minHeight: 48,
    justifyContent: 'center',
  },
  primaryPressed: {
    backgroundColor: colors.accentRamp[600],
  },
  primaryText: {
    color: colors.white,
    fontSize: 14,
  },
  ghost: {
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: 18,
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: colors.accentRamp[200],
  },
  ghostPressed: {
    backgroundColor: colors.accentRamp[300],
  },
  ghostText: {
    color: colors.accentRamp[800],
    fontSize: 14,
  },
});
