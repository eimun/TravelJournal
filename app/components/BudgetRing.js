import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { colors, type } from '../theme/tokens';
import { family } from '../theme/fonts';
import { formatInr } from '../../src/domain/format';
import { Kicker } from './primitives';

const SIZE = 108;
const DOT = 7;
const DOT_COUNT = 36;

/**
 * Remaining budget as a ring of dots.
 *
 * The dots are deliberate: the trail's connectors are dotted too, so progress
 * reads the same way everywhere in the app — a number of steps taken, not a bar
 * that filled. Over budget flips the ring to the deep terracotta step rather
 * than blocking anything (PRD 8.4).
 */
export default function BudgetRing({ budget, spent }) {
  const remaining = budget - spent;
  const ratio = budget > 0 ? remaining / budget : 0;
  const overBudget = remaining < 0;
  const lit = Math.max(0, Math.min(DOT_COUNT, Math.round(ratio * DOT_COUNT)));

  const [sweep] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.timing(sweep, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [sweep]);

  const dots = useMemo(() => {
    const radius = (SIZE - DOT) / 2;
    return Array.from({ length: DOT_COUNT }, (_, i) => {
      // Start at 12 o'clock and run clockwise, the way a spend gauge is read.
      const angle = (i / DOT_COUNT) * Math.PI * 2 - Math.PI / 2;
      return {
        key: i,
        x: SIZE / 2 + radius * Math.cos(angle) - DOT / 2,
        y: SIZE / 2 + radius * Math.sin(angle) - DOT / 2,
      };
    });
  }, []);

  const litTint = overBudget ? colors.accentRamp[700] : colors.accent2Ramp[500];

  return (
    <View style={styles.wrap}>
      <View
        style={styles.ring}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`Budget left ${formatInr(remaining)} of ${formatInr(budget)}`}
      >
        {dots.map((dot, i) => {
          const isLit = i < lit;
          const threshold = i / DOT_COUNT;
          const opacity = isLit
            ? sweep.interpolate({
                inputRange: [Math.max(0, threshold - 0.05), Math.min(1, threshold + 0.001)],
                outputRange: [0.25, 1],
                extrapolate: 'clamp',
              })
            : 1;

          return (
            <Animated.View
              key={dot.key}
              style={[
                styles.dot,
                {
                  left: dot.x,
                  top: dot.y,
                  backgroundColor: isLit ? litTint : colors.neutral[300],
                  opacity,
                },
              ]}
            />
          );
        })}

        <View style={styles.center}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.amount, { fontFamily: family('heading') }]}
          >
            {formatInr(Math.abs(remaining))}
          </Text>
          <Text style={[styles.of, { fontFamily: family('body') }]}>
            {overBudget ? 'over' : `of ${formatInr(budget)}`}
          </Text>
        </View>
      </View>

      <Kicker tone={overBudget ? 'accent' : 'accent2'} style={styles.caption}>
        {overBudget ? 'Over budget' : 'Budget left'}
      </Kicker>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 8,
  },
  ring: {
    width: SIZE,
    height: SIZE,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
  center: {
    position: 'absolute',
    left: DOT + 4,
    right: DOT + 4,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 19,
    color: colors.text,
    includeFontPadding: false,
    textAlign: 'center',
  },
  of: {
    ...type.meta,
    fontSize: 11,
    color: colors.neutral[600],
    marginTop: 2,
    textAlign: 'center',
  },
  caption: {
    textAlign: 'center',
  },
});
