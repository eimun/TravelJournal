import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { colors, radius } from '../theme/tokens';
import { family } from '../theme/fonts';
import { paletteFor } from '../theme/weatherPalette';
import { useLoop, useSwing } from './motion';

/**
 * The 44×32 weather glyph from the canvas (wxGlyphA/B/C). Sun: a disc inside a
 * slowly turning dotted corona. Otherwise a cloud — grey in a storm — plus a
 * bolt, a swelling raindrop, or a mist bar.
 */
function Glyph({ kind }) {
  const spin = useLoop(24000, { enabled: kind === 'sun' });
  const drip = useSwing(700, kind === 'rain');

  if (kind === 'sun') {
    const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    return (
      <View style={styles.glyph}>
        <Animated.View style={[styles.corona, { transform: [{ rotate }] }]} />
        <View style={styles.sunDisc} />
      </View>
    );
  }

  const storm = kind === 'storm';
  return (
    <View style={styles.glyph}>
      <View
        style={[styles.cloudBase, { backgroundColor: storm ? colors.neutral[300] : colors.white }]}
      />
      <View
        style={[styles.cloudPuff, { backgroundColor: storm ? colors.neutral[200] : colors.white }]}
      />

      {storm ? (
        <Svg width={10} height={18} style={styles.bolt}>
          <Polygon
            points="6,0 0,10.8 4.5,10.8 2.5,18 10,7.2 5.5,7.2"
            fill={colors.accentRamp[400]}
          />
        </Svg>
      ) : null}
      {kind === 'rain' ? (
        <Animated.View
          style={[
            styles.raindrop,
            {
              transform: [
                { scale: drip.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) },
              ],
            },
          ]}
        />
      ) : null}
      {kind === 'mist' ? <View style={styles.mistBar} /> : null}
    </View>
  );
}

/**
 * The cached weather reading — and the app's mood switch.
 *
 * Tapping cycles clear → rain → storm → cool. It is deliberately the same
 * control that says CACHED: the reading is stored, so changing it costs no
 * network, and everything downstream re-derives from it.
 */
export default function WeatherCard({ destination, reading, onCycle }) {
  const palette = paletteFor(reading.kind);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Cached weather for ${destination}: ${reading.temp}, ${reading.description}.`}
      accessibilityHint="Cycles clear, rain, storm and cool"
      onPress={onCycle}
      style={styles.hit}
    >
      {({ pressed }) => (
        <View style={[styles.depth, pressed && styles.depthPressed]}>
          <View style={[styles.card, { backgroundColor: palette.cardBg }]}>
            <Text
              numberOfLines={2}
              style={[styles.kicker, { color: palette.cardInk, fontFamily: family('bodyBold') }]}
            >
              {`${destination.toUpperCase()} · CACHED · TAP`}
            </Text>

            <View style={styles.readingRow}>
              <Glyph kind={reading.kind} />
              <View style={styles.readingCopy}>
                <Text
                  style={[styles.temp, { color: palette.cardInk, fontFamily: family('heading') }]}
                >
                  {reading.temp}
                </Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                  style={[styles.desc, { color: palette.cardInk, fontFamily: family('bodyBold') }]}
                >
                  {reading.description}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const DEPTH = 4;

const styles = StyleSheet.create({
  hit: {
    flex: 1,
  },
  // `box-shadow: 0 4px 0 rgba(46,43,37,.16)` — pressing sinks the card 3 px.
  depth: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(46,43,37,0.16)',
    paddingBottom: DEPTH,
  },
  depthPressed: {
    marginTop: 3,
    paddingBottom: DEPTH - 3,
  },
  card: {
    flex: 1,
    borderRadius: radius.md,
    padding: 13,
  },
  kicker: {
    fontSize: 11.5,
    letterSpacing: 0.8,
    opacity: 0.85,
    marginBottom: 10,
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readingCopy: {
    flex: 1,
    minWidth: 0,
  },
  glyph: {
    width: 44,
    height: 32,
  },
  corona: {
    position: 'absolute',
    left: 3,
    top: -2,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderStyle: 'dotted',
    borderColor: colors.accentRamp[400],
  },
  sunDisc: {
    position: 'absolute',
    left: 9,
    top: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentRamp[500],
  },
  cloudBase: {
    position: 'absolute',
    left: 0,
    top: 6,
    width: 34,
    height: 19,
    borderRadius: 999,
  },
  cloudPuff: {
    position: 'absolute',
    left: 8,
    top: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  bolt: {
    position: 'absolute',
    right: 6,
    bottom: -2,
  },
  raindrop: {
    position: 'absolute',
    right: 8,
    bottom: 0,
    width: 4,
    height: 14,
    borderRadius: 999,
    backgroundColor: colors.accent2Ramp[600],
  },
  mistBar: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 20,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.neutral[100],
  },
  temp: {
    fontSize: 19,
    lineHeight: 24,
    includeFontPadding: false,
  },
  desc: {
    fontSize: 11.5,
    marginTop: 2,
  },
});
