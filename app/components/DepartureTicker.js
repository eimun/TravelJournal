import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';

/**
 * Citymapper-style live departure chips: one pill per metro leg of the active
 * route, counting down to the next train. The countdown is fully derived from
 * the route's `nextDeparture` data plus a single tick counter that increments
 * every minute — no stored seed. The parent keys it by route, so a route
 * change remounts the component and restarts the clock cleanly.
 */
export default function DepartureTicker({ route, onSelectStep, activeStepIndex }) {
  const metroLegs = useMemo(
    () =>
      (route?.steps || [])
        .map((step, index) => ({ step, index }))
        .filter(({ step }) => step.type === 'metro' && step.nextDeparture?.isOperating),
    [route],
  );

  // Minutes elapsed since the route's departure times were computed.
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (metroLegs.length === 0) return undefined;
    const timer = setInterval(() => setElapsed((m) => m + 1), 60_000);
    return () => clearInterval(timer);
  }, [metroLegs]);

  if (metroLegs.length === 0) return null;

  return (
    <View style={styles.row}>
      {metroLegs.map(({ step, index }) => {
        const isActive = activeStepIndex === index;
        const dep = step.nextDeparture;
        const label = dep.lineName || 'Metro';

        // First scheduled departure that hasn't already left, adjusted for the
        // minutes elapsed since the route was built.
        const upcoming = (dep.departures || []).find((d) => d.inMinutes - elapsed > 0);
        const minutes = upcoming
          ? upcoming.inMinutes - elapsed
          : dep.nextInMinutes != null
            ? Math.max(1, dep.nextInMinutes - elapsed)
            : null;
        const scheduled = upcoming?.timeFormatted ?? dep.scheduledTime;

        return (
          <Pressable
            key={index}
            onPress={() => onSelectStep?.(index)}
            accessibilityRole="button"
            accessibilityLabel={
              minutes ? `${label} next train in ${minutes} minutes` : `${label} closed`
            }
            style={({ pressed }) => [
              styles.chip,
              isActive && styles.chipActive,
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
          >
            <View style={styles.liveDot} />
            <View style={styles.chipTextCol}>
              <Text style={styles.chipLabel} numberOfLines={1}>
                {label}
              </Text>
              <Text style={styles.chipValue}>
                {minutes !== null && minutes !== undefined
                  ? minutes <= 1
                    ? 'Boarding now'
                    : `${minutes} min`
                  : 'Closed'}
              </Text>
            </View>
            {scheduled ? (
              <Text style={styles.chipSchedule} numberOfLines={1}>
                {scheduled}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    paddingVertical: 7,
    paddingLeft: 10,
    paddingRight: 12,
    ...shadow.sm,
  },
  chipActive: {
    borderColor: colors.accent2Ramp[500],
    backgroundColor: colors.accent2Ramp[100],
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent2Ramp[500],
  },
  chipTextCol: {
    gap: 1,
  },
  chipLabel: {
    fontSize: 10,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[500],
    letterSpacing: 0.3,
  },
  chipValue: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  chipSchedule: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[500],
    marginLeft: 2,
  },
});
