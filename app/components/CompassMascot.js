import { Animated, StyleSheet, View } from 'react-native';

import { colors } from '../theme/tokens';
import { gearFor } from '../theme/weatherPalette';
import { useSwing } from './motion';

const SIZE = 66;
/** The canvas's `box-shadow: inset 0 -6px 0` — the darker crescent under the head. */
const SHADE = 6;

/**
 * The compass mascot, drawn element-for-element from the design canvas.
 *
 * Head: a round blob whose bottom 6 px is a darker sage crescent that follows the
 * curve. That crescent is an inset shadow on the canvas; here it is the face
 * circle sitting 6 px up inside a darker circle that clips it. (A bottom border
 * on an asymmetric radius — the earlier approach — draws a lopsided flat wedge
 * and makes the head look square.)
 *
 * Needle: `polygon(50% 0, 100% 100%, 0 100%)` — apex up, pivoting about its base.
 * A `borderBottomWidth` triangle already points up, so it is never rotated 180°.
 *
 * Blush: true ellipses (a circle squashed vertically), not rounded bars.
 *
 * Decorative only — hidden from screen readers.
 */
export default function CompassMascot({ kind = 'rain', animate = true }) {
  // tj-bob 3.4s and tj-needle 2.6s, both ease-in-out.
  const bob = useSwing(1700, animate);
  const needle = useSwing(1300, animate);

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
      <View style={styles.shade}>
        <View style={styles.face} />
      </View>

      <View style={[styles.eye, styles.eyeLeft]} />
      <View style={[styles.eye, styles.eyeRight]} />

      <Animated.View style={[styles.needleWrap, { transform: [{ rotate: needleRotate }] }]}>
        <View style={styles.needle} />
      </Animated.View>

      <View style={[styles.blush, styles.blushLeft]} />
      <View style={[styles.blush, styles.blushRight]} />

      <View style={[styles.gear, gearFor(kind)]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    // Hoods overhang the head on every side.
    overflow: 'visible',
  },
  shade: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.accent2Ramp[500],
    overflow: 'hidden',
  },
  face: {
    position: 'absolute',
    left: 0,
    top: -SHADE,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.accent2Ramp[400],
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
  needleWrap: {
    position: 'absolute',
    left: SIZE / 2 - 7,
    top: 8,
    width: 14,
    height: 22,
    alignItems: 'center',
    // Pivot about the base, the way a compass needle turns.
    transformOrigin: '50% 100%',
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
  },
  // A 12×12 circle squashed to 12×6, centred where the canvas's 12×6 ellipse
  // sits (bottom: 12).
  blush: {
    position: 'absolute',
    bottom: 9,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accentRamp[300],
    opacity: 0.8,
    transform: [{ scaleY: 0.5 }],
  },
  blushLeft: { left: 14 },
  blushRight: { right: 14 },
  gear: {
    position: 'absolute',
  },
});
