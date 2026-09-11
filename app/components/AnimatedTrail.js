import { Fragment, useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';
import { family } from '../theme/fonts';
import { paletteFor } from '../theme/weatherPalette';
import {
  DASH,
  DOT_SIZE,
  PITCH,
  STONE_DEPTH,
  buildTrailGeometry,
  nodeDepth,
  nodeFill,
} from './trailGeometry';
import { useLoop, useReduceMotion } from './motion';

const LABEL_GAP = 14;

/**
 * The trail — one stone per day sheet, joined by dashed paths, as the canvas
 * draws it: walked days sage with a tick, today larger and hopping inside a
 * pulsing ring, days ahead quiet.
 *
 * On mount the path draws itself from the first stone onward, so progress reads
 * as distance covered. Honours the OS reduce-motion setting.
 */
export default function AnimatedTrail({ days, onSelectDay, flaggedIndex, flagText, flagKind }) {
  const palette = paletteFor(flagKind);
  const { stones, dots, height } = useMemo(() => buildTrailGeometry(days), [days]);
  const reduceMotion = useReduceMotion();

  const [draw] = useState(() => new Animated.Value(0));
  // tj-hop 2.4 s and tj-ring 1.9 s from the canvas.
  const hop = useLoop(2400, { enabled: !reduceMotion });
  const ring = useLoop(1900, { enabled: !reduceMotion });

  useEffect(() => {
    if (reduceMotion) {
      draw.setValue(1);
      return undefined;
    }
    draw.setValue(0);
    const animation = Animated.timing(draw, {
      toValue: 1,
      duration: 1600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [draw, reduceMotion]);

  const last = Math.max(1, stones.length - 1);
  // Each element claims a slice of the draw based on how far along it sits.
  const revealAt = (fraction) =>
    draw.interpolate({
      inputRange: [Math.max(0, fraction - 0.12), Math.min(1, fraction + 0.001)],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

  // tj-hop: up 9 at 30 %, down by 55 %, a small 3 px bounce at 70 %.
  const hopY = hop.interpolate({
    inputRange: [0, 0.3, 0.55, 0.7, 1],
    outputRange: [0, -9, 0, -3, 0],
  });
  // tj-ring: grows from .85 to 1.5 while fading out, then rests.
  const ringScale = ring.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.85, 1.5, 1.5] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.65, 0, 0] });

  return (
    <View style={[styles.canvas, { height }]}>
      {dots.map((dot) => {
        const progress = revealAt(dot.segment / last);
        return (
          <Animated.View
            key={dot.key}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.dash,
              {
                left: dot.x + (DOT_SIZE - DASH.w) / 2,
                top: dot.y + (DOT_SIZE - DASH.h) / 2,
                backgroundColor: dot.tint,
                opacity: progress,
                transform: [{ rotate: `${dot.angle}deg` }, { scale: progress }],
              },
            ]}
          />
        );
      })}

      {stones.map((stone) => {
        const progress = revealAt(stone.index / last);
        const isNow = stone.state === 'now';
        const todo = stone.state === 'todo';
        const glyph = stone.state === 'done' ? '✓' : String(stone.index + 1);
        const stateWord = stone.state === 'done' ? 'walked' : isNow ? 'today' : 'still ahead';
        const flagged = stone.index === flaggedIndex && Boolean(flagText);
        const ringSize = stone.size + 12;

        return (
          <Fragment key={stone.date}>
            <Animated.View
              style={[
                styles.stone,
                {
                  left: stone.left,
                  top: stone.top,
                  width: stone.size,
                  height: stone.size + STONE_DEPTH,
                  opacity: progress,
                  transform: [{ scale: progress }, ...(isNow ? [{ translateY: hopY }] : [])],
                },
              ]}
            >
              {isNow ? (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.ring,
                    {
                      width: ringSize,
                      height: ringSize,
                      borderRadius: ringSize / 2,
                      opacity: ringOpacity,
                      transform: [{ scale: ringScale }],
                    },
                  ]}
                />
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${stone.date}, ${stone.title}, ${stateWord}. ${stone.meta}`}
                onPress={() => onSelectDay?.(stone)}
                style={({ pressed }) => [
                  { width: stone.size, height: stone.size + STONE_DEPTH },
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.stoneDepth,
                    {
                      width: stone.size,
                      height: stone.size,
                      borderRadius: stone.size / 2,
                      backgroundColor: nodeDepth(stone.state),
                    },
                  ]}
                />
                <View
                  style={[
                    styles.stoneFace,
                    {
                      width: stone.size,
                      height: stone.size,
                      borderRadius: stone.size / 2,
                      backgroundColor: nodeFill(stone.state),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.glyph,
                      {
                        fontFamily: family('heading'),
                        fontSize: isNow ? 27 : 21,
                        color: todo ? colors.neutral[600] : colors.white,
                      },
                    ]}
                  >
                    {glyph}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>

            <Animated.View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                styles.label,
                {
                  left: stone.left + stone.size + LABEL_GAP,
                  top: stone.cy - PITCH / 2,
                  height: PITCH,
                  opacity: todo ? Animated.multiply(progress, 0.72) : progress,
                },
              ]}
            >
              <Text style={[styles.date, { fontFamily: family('bodyBold') }]}>{stone.date}</Text>
              <Text numberOfLines={1} style={[styles.title, { fontFamily: family('bodyBold') }]}>
                {stone.title}
              </Text>
              <Text numberOfLines={1} style={[styles.meta, { fontFamily: family('body') }]}>
                {stone.meta}
              </Text>

              {/* The one day the current forecast puts at risk; re-derives with the weather. */}
              {flagged ? (
                <View style={[styles.flag, { backgroundColor: palette.cardBg }]}>
                  <Text
                    style={[
                      styles.flagText,
                      { color: palette.cardInk, fontFamily: family('bodyBold') },
                    ]}
                  >
                    {flagText.toUpperCase()}
                  </Text>
                </View>
              ) : null}
            </Animated.View>
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: 'relative',
    width: '100%',
  },
  dash: {
    position: 'absolute',
    width: DASH.w,
    height: DASH.h,
    borderRadius: DASH.w / 2,
  },
  stone: {
    position: 'absolute',
  },
  ring: {
    position: 'absolute',
    left: -6,
    top: -6,
    borderWidth: 3,
    borderColor: colors.accentRamp[500],
  },
  pressed: {
    transform: [{ translateY: 4 }],
  },
  stoneDepth: {
    position: 'absolute',
    top: STONE_DEPTH,
    left: 0,
  },
  stoneFace: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    includeFontPadding: false,
    textAlign: 'center',
  },
  label: {
    position: 'absolute',
    right: 0,
    justifyContent: 'center',
    paddingRight: 8,
  },
  date: {
    fontSize: 11,
    letterSpacing: 1.1,
    color: colors.neutral[600],
  },
  title: {
    fontSize: 14.5,
    lineHeight: 18,
    marginTop: 2,
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
    color: colors.neutral[600],
  },
  flag: {
    alignSelf: 'flex-start',
    marginTop: 6,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  flagText: {
    fontSize: 10.5,
    letterSpacing: 0.63,
  },
});
