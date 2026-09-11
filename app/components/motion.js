import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

/**
 * Shared motion helpers, so every loop in the app is built the same safe way.
 *
 * One rule learned the hard way: never put `Animated.delay` inside a
 * native-driven sequence wrapped in `Animated.loop` — that loop silently never
 * runs. Delays here happen once, with a timer, before the loop starts.
 */

/** 0 → 1 → 0 forever, ease-in-out each way. For two-keyframe CSS loops (bob, swell). */
export function useSwing(halfDuration, enabled = true) {
  const [value] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!enabled) {
      value.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1,
          duration: halfDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: halfDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [value, halfDuration, enabled]);

  return value;
}

/**
 * 0 → 1 linearly, restarting forever. Interpolate it against the CSS keyframe
 * stops to reproduce multi-step animations (hop, ring, flash, rain).
 */
export function useLoop(duration, { enabled = true, delay = 0 } = {}) {
  const [value] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!enabled) {
      value.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const timer = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [value, duration, delay, enabled]);

  return value;
}

/** The OS reduce-motion setting, kept live. */
export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((on) => {
      if (alive) setReduce(on);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);

  return reduce;
}

/** The canvas fades every panel in over 250 ms (`tj-fadein`). */
export function FadeIn({ children, style }) {
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return <Animated.View style={[{ flex: 1, opacity }, style]}>{children}</Animated.View>;
}
