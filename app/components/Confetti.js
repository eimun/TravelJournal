import { useEffect, useMemo, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

import { colors } from '../theme/tokens';

const { height: SCREEN_H } = Dimensions.get('window');
const COLOURS = [
  colors.accentRamp[500],
  colors.accent2Ramp[500],
  colors.accentRamp[300],
  colors.neutral[800],
];

function Piece({ left, tint, duration, delay }) {
  const [fall] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(fall, {
        toValue: 1,
        duration,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [fall, duration, delay]);

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left,
          backgroundColor: tint,
          opacity: fall.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 1, 0] }),
          transform: [
            {
              translateY: fall.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, SCREEN_H],
              }),
            },
            {
              rotate: fall.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '540deg'],
              }),
            },
          ],
        },
      ]}
    />
  );
}

/** The payout for finishing the packing quest. Decorative and non-interactive. */
export default function Confetti({ active }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        key: `c${i}`,
        left: `${4 + i * 5.3}%`,
        tint: COLOURS[i % COLOURS.length],
        duration: 1600 + (i % 5) * 280,
        delay: (i % 7) * 80,
      })),
    [],
  );

  if (!active) return null;

  return (
    <View style={styles.layer} pointerEvents="none" accessibilityElementsHidden>
      {pieces.map(({ key, ...piece }) => (
        <Piece key={key} {...piece} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  piece: {
    position: 'absolute',
    top: 0,
    width: 9,
    height: 14,
    borderRadius: 3,
  },
});
