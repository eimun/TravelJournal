import { useMemo } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

import { colors } from '../theme/tokens';
import { paletteFor } from '../theme/weatherPalette';
import { useLoop, useSwing } from './motion';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/**
 * One falling streak (`tj-rain`): starts 40 px above the screen, fades in over
 * the first 10 % and out as it falls. The stagger is a one-off start delay, as
 * CSS `animation-delay` is.
 */
function Drop({ left, width, height, tint, duration, delay, restAt, still }) {
  const fall = useLoop(duration, { enabled: !still, delay });

  if (still) {
    return (
      <View
        style={[
          styles.drop,
          { left, width, height, backgroundColor: tint, top: restAt, opacity: 0.45 },
        ]}
      />
    );
  }

  return (
    <Animated.View
      style={[
        styles.drop,
        {
          left,
          width,
          height,
          backgroundColor: tint,
          opacity: fall.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.55, 0] }),
          transform: [
            { translateY: fall.interpolate({ inputRange: [0, 1], outputRange: [-40, SCREEN_H] }) },
          ],
        },
      ]}
    />
  );
}

/** A soft shape that swells (`tj-swell`, 1 → 1.06) or drifts (`tj-drift`, 10, -14). */
function Drifter({ style, half, swell, still }) {
  const value = useSwing(half, !still);
  if (still) return <View style={style} />;

  const transform = swell
    ? [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }]
    : [
        { translateX: value.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) },
        { translateY: value.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) },
      ];
  return <Animated.View style={[style, { transform }]} />;
}

/** The canvas's `repeating-conic-gradient(accent-300 0 6deg, transparent 6deg 26deg)`. */
const RAY_SIZE = 360;
const RAY_PATHS = (() => {
  const r = RAY_SIZE / 2;
  const at = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return `${(r + r * Math.sin(rad)).toFixed(2)} ${(r - r * Math.cos(rad)).toFixed(2)}`;
  };
  const paths = [];
  for (let start = 0; start < 360; start += 26) {
    const end = Math.min(360, start + 6);
    paths.push(`M${r} ${r} L${at(start)} A${r} ${r} 0 0 1 ${at(end)} Z`);
  }
  return paths;
})();

function SunRays({ still }) {
  // tj-rays: one full turn every 46 s.
  const turn = useLoop(46000, { enabled: !still });
  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={[styles.rays, { transform: [{ rotate }] }]}>
      <Svg width={RAY_SIZE} height={RAY_SIZE}>
        {RAY_PATHS.map((d) => (
          <Path key={d} d={d} fill={colors.accentRamp[300]} />
        ))}
      </Svg>
    </Animated.View>
  );
}

/** `tj-flash` over 7 s: dark for 92 %, then two quick white flickers. */
function Lightning({ still }) {
  const t = useLoop(7000, { enabled: !still });
  if (still) return null;
  return (
    <Animated.View
      style={[
        styles.flash,
        {
          opacity: t.interpolate({
            inputRange: [0, 0.92, 0.94, 0.96, 0.98, 1],
            outputRange: [0, 0, 0.5, 0, 0.35, 0],
          }),
        },
      ]}
    />
  );
}

/**
 * The weather you can feel behind the content, built from the canvas's ambient
 * layer: a sky band bleeding off the top; falling rain; a storm with lightning;
 * the sun's halo and slowly turning rays; or drifting mist banks.
 *
 * Purely decorative, so it never takes touches and is hidden from screen
 * readers. Reduce-motion quiets it; it never deletes it.
 */
export default function AmbientLayer({ kind, reduceMotion }) {
  const palette = paletteFor(kind);

  const drops = useMemo(() => {
    if (kind !== 'rain' && kind !== 'storm') return [];
    const storm = kind === 'storm';
    return Array.from({ length: storm ? 22 : 14 }, (_, i) => ({
      key: `d${i}`,
      left: `${(i * 7.3) % 100}%`,
      width: 2,
      height: storm ? 34 : 24,
      tint: storm ? colors.neutral[100] : colors.accent2Ramp[400],
      duration: 900 + (i % 5) * 160,
      delay: (i % 9) * 170,
      restAt: ((i * 137) % 100) * (SCREEN_H / 100),
    }));
  }, [kind]);

  return (
    <View style={styles.layer} pointerEvents="none" accessibilityElementsHidden>
      {/* The sky band: an ellipse 80 px wider than the screen, centred on its top edge. */}
      <Svg width={SCREEN_W} height={150} style={styles.band}>
        <Ellipse
          cx={SCREEN_W / 2}
          cy={0}
          rx={(SCREEN_W + 80) / 2}
          ry={150}
          fill={palette.band}
          opacity={0.55}
        />
      </Svg>

      {kind === 'sun' ? (
        <>
          <Drifter
            swell
            still={reduceMotion}
            half={3000}
            style={[styles.sunHalo, { backgroundColor: colors.accentRamp[300] }]}
          />
          <Drifter
            swell
            still={reduceMotion}
            half={2200}
            style={[styles.sunCore, { backgroundColor: colors.accentRamp[400] }]}
          />
          <SunRays still={reduceMotion} />
        </>
      ) : null}

      {kind === 'mist' ? (
        <>
          <Drifter still={reduceMotion} half={6500} style={[styles.mist, styles.mistOne]} />
          <Drifter still={reduceMotion} half={8500} style={[styles.mist, styles.mistTwo]} />
          <Drifter still={reduceMotion} half={10500} style={[styles.mist, styles.mistThree]} />
        </>
      ) : null}

      {drops.map(({ key, ...drop }) => (
        <Drop key={key} {...drop} still={reduceMotion} />
      ))}

      {kind === 'storm' ? <Lightning still={reduceMotion} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Explicit dimensions: `absoluteFillObject` resolved to zero height inside the
  // app root, which silently drew the whole weather layer as nothing.
  layer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: SCREEN_W,
    height: SCREEN_H,
    overflow: 'hidden',
  },
  band: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  drop: {
    position: 'absolute',
    top: 0,
    borderRadius: 999,
  },
  sunHalo: {
    position: 'absolute',
    top: -120,
    right: -110,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.5,
  },
  sunCore: {
    position: 'absolute',
    top: -64,
    right: -52,
    width: 186,
    height: 186,
    borderRadius: 93,
    opacity: 0.45,
  },
  rays: {
    position: 'absolute',
    top: -150,
    right: -140,
    width: RAY_SIZE,
    height: RAY_SIZE,
    opacity: 0.28,
  },
  mist: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.neutral[100],
  },
  mistOne: { top: 90, left: -70, width: 240, height: 110, opacity: 0.55 },
  mistTwo: { top: 300, right: -90, width: 270, height: 120, opacity: 0.45 },
  mistThree: { bottom: 120, left: -50, width: 200, height: 96, opacity: 0.4 },
  flash: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: SCREEN_W,
    height: SCREEN_H,
    backgroundColor: colors.white,
  },
});
