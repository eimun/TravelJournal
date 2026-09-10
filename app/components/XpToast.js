import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';

import { colors, radius, space } from '../theme/tokens';
import { family } from '../theme/fonts';

/**
 * A short reward acknowledgement — the payout half of the side quest.
 *
 * Returns the toast element plus the `fire` function that shows it, so a screen
 * can reward an action without owning any animation state itself.
 */
export function useXpToast() {
  const [message, setMessage] = useState(null);
  const [anim] = useState(() => new Animated.Value(0));
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const fire = useCallback(
    (text) => {
      setMessage(text);
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(900),
        Animated.timing(anim, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(null), 1400);
    },
    [anim],
  );

  return { message, anim, fire };
}

export default function XpToast({ message, anim }) {
  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.wrap,
        {
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
          ],
        },
      ]}
    >
      <Text style={[styles.text, { fontFamily: family('bodyExtraBold') }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: space[8],
    alignItems: 'center',
  },
  text: {
    backgroundColor: colors.neutral[900],
    color: colors.white,
    fontSize: 13,
    letterSpacing: 0.3,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
});
