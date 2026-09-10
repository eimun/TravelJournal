import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadow, space } from '../theme/tokens';
import { Kicker } from './primitives';

/**
 * A stand-in for the map tile that says plainly that it is cached.
 *
 * The real map lands on `feat/F-04-map-places`; until then this holds the layout
 * and, more importantly, the honesty rule — network-backed surfaces always state
 * whether what you are looking at is live or stored (PRD 8.4).
 */
export default function CachedMapCard({ destination, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open the cached map of ${destination}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.pins}>
        <View style={[styles.pin, { left: '30%', top: '26%' }]} />
        <View style={[styles.pin, { left: '58%', top: '42%' }]} />
        <View style={[styles.pin, { left: '24%', top: '58%' }]} />
        <View style={[styles.pin, styles.pinSage, { left: '64%', top: '68%' }]} />
      </View>

      <Kicker tone="accent2" style={styles.kicker}>
        {`${destination} · cached · tap`}
      </Kicker>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.accent2Ramp[200],
    padding: space[3],
    justifyContent: 'flex-end',
    minHeight: 150,
    overflow: 'hidden',
    ...shadow.sm,
  },
  pressed: {
    backgroundColor: colors.accent2Ramp[300],
  },
  pins: {
    ...StyleSheet.absoluteFillObject,
  },
  pin: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accentRamp[500],
    borderWidth: 3,
    borderColor: colors.white,
  },
  pinSage: {
    backgroundColor: colors.accent2Ramp[600],
  },
  kicker: {
    color: colors.accent2Ramp[800],
  },
});
