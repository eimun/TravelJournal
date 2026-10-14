import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors, radius, shadow } from '../theme/tokens';
import { useReduceMotion } from './motion';

/**
 * The Duolingo-style payoff when a trail stop checks in: the dot pops (scale
 * 0.6 → 1.18 → 1 with a spring) and a sage ring expands and fades around it.
 * Runs once per newly visited stop — the parent remounts this via `key` when
 * the visited set changes.
 *
 * Respect reduce-motion: renders the finished state immediately.
 */
export default function CheckInBurst({ children, reduceMotionOverride }) {
  // All hooks flat and unconditional; `reduceMotionOverride` only selects the
  // finished-state branch after hooking up.
  const systemReduceMotion = useReduceMotion();
  const reduceMotion = reduceMotionOverride ?? systemReduceMotion;

  const [pop] = useState(() => new Animated.Value(reduceMotion ? 1 : 0.6));
  const [ring] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));
  const [done, setDone] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion || done) return undefined;
    const seq = Animated.sequence([
      // squash a touch, then spring over the top, then settle
      Animated.timing(pop, {
        toValue: 1.18,
        duration: 140,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(pop, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
    ]);
    const ripple = Animated.timing(ring, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    seq.start(() => setDone(true));
    ripple.start();
    return () => {
      seq.stop();
      ripple.stop();
    };
  }, [reduceMotion, done, pop, ring]);

  if (reduceMotion) {
    return <View style={styles.wrap}>{children}</View>;
  }

  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.8, 2.1] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.65, 0.25, 0] });

  return (
    <View style={styles.wrap}>
      <Animated.View
        pointerEvents="none"
        style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]}
      />
      <Animated.View style={{ transform: [{ scale: pop }] }}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: colors.accent2Ramp[400],
    backgroundColor: 'transparent',
  },
});

export const burstShadow = shadow.sm;
