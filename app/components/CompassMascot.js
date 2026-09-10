import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors } from '../theme/tokens';

const SIZE = 66;

/**
 * The compass mascot from the design canvas: a soft blob that bobs while its
 * needle sweeps. It carries the "warm and a little playful" half of the Organic
 * system that the rest of the Home screen keeps fairly restrained.
 *
 * Decorative only — hidden from screen readers.
 */
export default function CompassMascot({ animate = true }) {
  const [bob] = useState(() => new Animated.Value(0));
  const [needle] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!animate) return undefined;

    const swing = (value, duration) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );

    const bobLoop = swing(bob, 1700);
    const needleLoop = swing(needle, 1300);
    bobLoop.start();
    needleLoop.start();
    return () => {
      bobLoop.stop();
      needleLoop.stop();
    };
  }, [animate, bob, needle]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const rotate = bob.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] });
  const needleRotate = needle.interpolate({
    inputRange: [0, 1],
    outputRange: ['-18deg', '24deg'],
  });

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.wrap, { transform: [{ translateY }, { rotate }] }]}
    >
      <View style={styles.body}>
        <View style={[styles.eye, styles.eyeLeft]} />
        <View style={[styles.eye, styles.eyeRight]} />
        <View style={[styles.blush, styles.blushLeft]} />
        <View style={[styles.blush, styles.blushRight]} />
        <Animated.View style={[styles.needleWrap, { transform: [{ rotate: needleRotate }] }]}>
          <View style={styles.needle} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
  },
  body: {
    width: SIZE,
    height: SIZE,
    // Slightly uneven radii keep it a blob rather than a plain circle.
    borderTopLeftRadius: SIZE / 2,
    borderTopRightRadius: SIZE / 2,
    borderBottomLeftRadius: SIZE * 0.46,
    borderBottomRightRadius: SIZE * 0.54,
    backgroundColor: colors.accent2Ramp[400],
    borderBottomWidth: 6,
    borderBottomColor: colors.accent2Ramp[500],
  },
  eye: {
    position: 'absolute',
    top: 26,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.neutral[900],
  },
  eyeLeft: { left: 16 },
  eyeRight: { right: 16 },
  blush: {
    position: 'absolute',
    bottom: 12,
    width: 12,
    height: 6,
    borderRadius: 6,
    backgroundColor: colors.accentRamp[300],
    opacity: 0.8,
  },
  blushLeft: { left: 14 },
  blushRight: { right: 14 },
  needleWrap: {
    position: 'absolute',
    left: SIZE / 2 - 7,
    top: 8,
    width: 14,
    height: 22,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  needle: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.accentRamp[500],
    // Point the triangle up from its base, which sits at the blob's centre.
    transform: [{ rotate: '180deg' }],
  },
});
