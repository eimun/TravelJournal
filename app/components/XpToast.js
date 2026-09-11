import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StatusBar, StyleSheet } from 'react-native';

import { colors } from '../theme/tokens';
import { family } from '../theme/fonts';

const statusBarInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

/**
 * The reward as the canvas shows it (`tj-rise`, 1.1 s): big display-face words
 * that pop up, rise and fade over the content — no pill, no panel.
 *
 * Driven by a `{ text, at }` object so the same reward fired twice in a row still
 * replays: the timestamp changes even when the words do not.
 */
export default function XpToast({ toast, onDone }) {
  const [t] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!toast) return undefined;
    t.setValue(0);
    const animation = Animated.timing(t, {
      toValue: 1,
      duration: 1100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished) onDone?.();
    });
    return () => animation.stop();
  }, [toast, t, onDone]);

  if (!toast) return null;

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.wrap,
        {
          opacity: t.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 0] }),
          transform: [
            { translateY: t.interpolate({ inputRange: [0, 0.25, 1], outputRange: [6, -10, -46] }) },
            { scale: t.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0.9, 1, 1] }) },
          ],
        },
      ]}
    >
      <Animated.Text style={[styles.text, { fontFamily: family('heading') }]}>
        {toast.text}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: statusBarInset + 132,
    alignItems: 'center',
  },
  text: {
    fontSize: 26,
    lineHeight: 34,
    color: colors.accent2Ramp[700],
    includeFontPadding: false,
    textAlign: 'center',
  },
});
