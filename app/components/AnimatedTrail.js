import { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, space, type } from '../theme/tokens';
import { family } from '../theme/fonts';
import { DOT_SIZE, STONE_DEPTH, buildTrailGeometry, nodeDepth, nodeFill } from './trailGeometry';

/**
 * The trail draws itself once on mount: dots light up from the first stone
 * onward, so progress reads as a place you have walked to rather than a bar that
 * filled up. Honours the OS "reduce motion" setting.
 */
export default function AnimatedTrail({ days, onSelectDay }) {
  const { stones, dots, height } = useMemo(() => buildTrailGeometry(days), [days]);
  const [reduceMotion, setReduceMotion] = useState(false);

  const [draw] = useState(() => new Animated.Value(0));
  const [hop] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((on) => {
      if (alive) setReduceMotion(on);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      draw.setValue(1);
      return undefined;
    }
    const animation = Animated.timing(draw, {
      toValue: 1,
      duration: 1600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [draw, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      hop.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hop, {
          toValue: 1,
          duration: 720,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(hop, {
          toValue: 0,
          duration: 900,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.delay(780),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [hop, reduceMotion]);

  // Each element claims a slice of the 0..1 draw progress based on how far along
  // the trail it sits, which is what staggers the reveal.
  const revealAt = (fraction) =>
    draw.interpolate({
      inputRange: [Math.max(0, fraction - 0.12), Math.min(1, fraction + 0.001)],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

  const hopOffset = hop.interpolate({ inputRange: [0, 1], outputRange: [0, -9] });

  return (
    <View style={[styles.canvas, { height }]}>
      {dots.map((dot) => {
        const progress = revealAt(dot.segment / Math.max(1, stones.length - 1));
        return (
          <Animated.View
            key={dot.key}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.dot,
              {
                left: dot.x,
                top: dot.y,
                backgroundColor: dot.tint,
                opacity: progress,
                transform: [{ scale: progress }],
              },
            ]}
          />
        );
      })}

      {stones.map((stone) => {
        const progress = revealAt(stone.index / Math.max(1, stones.length - 1));
        const isNow = stone.state === 'now';
        const glyph = stone.state === 'done' ? '✓' : String(stone.index + 1);
        const stateWord = stone.state === 'done' ? 'walked' : isNow ? 'today' : 'still ahead';

        return (
          <Animated.View
            key={stone.date}
            style={[
              styles.row,
              {
                top: stone.top,
                left: stone.left,
                opacity: progress,
                transform: [{ scale: progress }, ...(isNow ? [{ translateY: hopOffset }] : [])],
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${stone.date}, ${stone.title}, ${stateWord}. ${stone.meta}`}
              onPress={() => onSelectDay?.(stone)}
              style={({ pressed }) => [
                styles.stoneHit,
                { width: stone.size, height: stone.size + STONE_DEPTH },
                pressed && styles.stonePressed,
              ]}
            >
              {/* The solid fill sitting 6dp lower is what gives the stone its weight. */}
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
                    styles.stoneGlyph,
                    {
                      fontFamily: family('heading'),
                      fontSize: isNow ? 27 : 21,
                      color: stone.state === 'todo' ? colors.neutral[600] : colors.white,
                    },
                  ]}
                >
                  {glyph}
                </Text>
              </View>
            </Pressable>

            <View
              style={[styles.label, { opacity: stone.state === 'todo' ? 0.72 : 1 }]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Text style={[styles.labelDate, { fontFamily: family('bodyBold') }]}>
                {stone.date}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.labelTitle, { fontFamily: family('bodyBold') }]}
              >
                {stone.title}
              </Text>
              <Text numberOfLines={1} style={[styles.labelMeta, { fontFamily: family('body') }]}>
                {stone.meta}
              </Text>
            </View>
          </Animated.View>
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
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  row: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stoneHit: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  stonePressed: {
    transform: [{ translateY: 3 }],
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
  stoneGlyph: {
    includeFontPadding: false,
    textAlign: 'center',
  },
  label: {
    flexShrink: 1,
    paddingRight: space[3],
  },
  labelDate: {
    ...type.kicker,
    textTransform: 'uppercase',
    color: colors.neutral[600],
  },
  labelTitle: {
    ...type.section,
    color: colors.text,
    marginTop: 1,
  },
  labelMeta: {
    ...type.meta,
    color: colors.neutral[600],
    marginTop: 1,
  },
});
