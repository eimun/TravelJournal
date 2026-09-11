import { Animated, StyleSheet, View } from 'react-native';

import { colors } from '../theme/tokens';
import { gearFor } from '../theme/weatherPalette';
import { useSwing } from './motion';

const SIZE = 66;
/** The canvas's `box-shadow: inset 0 -6px 0` — the darker crescent under the head. */
const SHADE = 6;
/** The compass needle: a slim diamond on the forehead, pivoting about its middle. */
const NEEDLE = { w: 10, half: 11, top: 5 };

/**
 * The compass mascot, drawn from the design canvas.
 *
 * Head: a round blob whose bottom 6 px is a darker sage crescent that follows the
 * curve — the face circle sitting 6 px up inside a darker circle that clips it.
 *
 * Needle: a real compass needle — orange north half, cream south half, a pivot
 * dot — on the forehead, above the eyes, swinging about its centre. The canvas
 * draws a single triangle whose base sits between the eyes; with no hood on
 * (cool and clear weather) that reads as a nose, not a needle. On the forehead
 * it stays a needle, and under the rain and storm hoods it is fully covered
 * instead of poking out below the brim.
 *
 * Blush: true ellipses (a circle squashed vertically), not rounded bars.
 *
 * Decorative only — hidden from screen readers.
 */
export default function CompassMascot({ kind = 'rain', animate = true }) {
  // tj-bob 3.4s and tj-needle 2.6s, both ease-in-out.
  const bob = useSwing(1700, animate);
  const needle = useSwing(1300, animate);
  const gear = gearFor(kind);

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

      <Animated.View style={[styles.needleWrap, { transform: [{ rotate: needleRotate }] }]}>
        <View style={styles.needleNorth} />
        <View style={styles.needleSouth} />
        <View style={styles.pivot} />
      </Animated.View>

      <View style={[styles.eye, styles.eyeLeft]} />
      <View style={[styles.eye, styles.eyeRight]} />

      <View style={[styles.blush, styles.blushLeft]} />
      <View style={[styles.blush, styles.blushRight]} />
      {gear ? <View style={[styles.gear, gear]} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    // Hoods overhang the head.
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
  needleWrap: {
    position: 'absolute',
    left: SIZE / 2 - NEEDLE.w / 2,
    top: NEEDLE.top,
    width: NEEDLE.w,
    height: NEEDLE.half * 2,
    alignItems: 'center',
    // A compass needle turns about its middle.
    transformOrigin: '50% 50%',
  },
  // Both halves are border triangles: bottom border points up, top border down.
  needleNorth: {
    width: 0,
    height: 0,
    borderLeftWidth: NEEDLE.w / 2,
    borderRightWidth: NEEDLE.w / 2,
    borderBottomWidth: NEEDLE.half,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.accentRamp[500],
  },
  needleSouth: {
    width: 0,
    height: 0,
    borderLeftWidth: NEEDLE.w / 2,
    borderRightWidth: NEEDLE.w / 2,
    borderTopWidth: NEEDLE.half,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.neutral[100],
  },
  pivot: {
    position: 'absolute',
    top: NEEDLE.half - 2,
    left: NEEDLE.w / 2 - 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accentRamp[800],
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
