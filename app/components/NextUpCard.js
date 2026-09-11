import { Animated, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';
import { family } from '../theme/fonts';
import { formatCountdown } from '../../src/domain/format';
import { Chunky, ChunkyButton } from './Chunky';
import { useSwing } from './motion';

/**
 * The next timed activity — US-006 — as the canvas draws it: a solid terracotta
 * card with a chunky base, a soft light circle in the corner, the forecast's
 * advisory in a pill, a white primary button and a glassy Snooze.
 *
 * Snoozing pushes the reminder out, which the canvas shows as the countdown
 * jumping to "1h 30 MIN".
 */
export default function NextUpCard({
  activity,
  minutesNow,
  snoozed,
  advice,
  adviceDot,
  onOpenTrail,
  onSnooze,
}) {
  // tj-swell 1.8s on the advisory dot.
  const swell = useSwing(900);
  const scale = swell.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const countdown = snoozed ? '1h 30 MIN' : formatCountdown(activity.startMinutes - minutesNow);

  return (
    <Chunky
      depth={6}
      depthColor={colors.accentRamp[800]}
      radius={radius.lg}
      innerStyle={styles.card}
    >
      <View style={styles.glow} />

      <Text style={[styles.kicker, { fontFamily: family('bodyBold') }]}>
        {`NEXT UP · IN ${countdown}`}
      </Text>
      <Text style={[styles.name, { fontFamily: family('heading') }]}>{activity.name}</Text>
      <Text style={[styles.meta, { fontFamily: family('body') }]}>{activity.meta}</Text>

      {advice ? (
        <View style={styles.advisory}>
          <Animated.View
            style={[styles.advisoryDot, { backgroundColor: adviceDot, transform: [{ scale }] }]}
          />
          <Text style={[styles.advisoryText, { fontFamily: family('bodyBold') }]}>{advice}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <ChunkyButton
          accessibilityRole="button"
          accessibilityLabel={`Open the trail at ${activity.name}`}
          onPress={onOpenTrail}
          depth={4}
          depthColor={colors.accentRamp[300]}
          style={styles.primaryWrap}
          innerStyle={styles.primary}
        >
          <Text style={[styles.primaryText, { fontFamily: family('bodyBold') }]}>
            Open the trail
          </Text>
        </ChunkyButton>

        <ChunkyButton
          accessibilityRole="button"
          accessibilityLabel={snoozed ? 'Reminder snoozed' : 'Snooze this reminder'}
          onPress={onSnooze}
          depth={4}
          depthColor="rgba(0,0,0,0.18)"
          innerStyle={styles.ghost}
        >
          <Text style={[styles.ghostText, { fontFamily: family('bodyBold') }]}>Snooze</Text>
        </ChunkyButton>
      </View>
    </Chunky>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accentRamp[600],
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  glow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.09)',
    top: -64,
    right: -40,
  },
  kicker: {
    fontSize: 11.5,
    letterSpacing: 1.38,
    color: colors.accentRamp[100],
    opacity: 0.85,
  },
  name: {
    fontSize: 24,
    lineHeight: 31,
    marginTop: 8,
    marginBottom: 2,
    color: colors.white,
    includeFontPadding: false,
  },
  meta: {
    fontSize: 13.5,
    color: colors.accentRamp[100],
    opacity: 0.9,
  },
  advisory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 13,
  },
  advisoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  advisoryText: {
    fontSize: 12.5,
    color: colors.white,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  primaryWrap: {
    flex: 1,
  },
  primary: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    minHeight: 44,
  },
  primaryText: {
    fontSize: 14,
    color: colors.accentRamp[800],
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  ghostText: {
    fontSize: 14,
    color: colors.white,
  },
});
