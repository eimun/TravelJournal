import { StyleSheet, Text, View } from 'react-native';

import { colors, space, type } from '../theme/tokens';
import { family } from '../theme/fonts';
import { Kicker, Pill } from './primitives';
import CompassMascot from './CompassMascot';

/**
 * The greeting block: where you are in the trip, who you are, and how fresh the
 * cached data is.
 *
 * The offline marker is a sage dot rather than a red warning — being offline is
 * the expected state for this app, not an error (PRD 8.4).
 */
export default function HomeHeader({ trip, weather, walked }) {
  return (
    <>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Kicker tone="accent">
            {`Day ${trip.dayIndex} of ${trip.dayCount} · ${trip.destination}`}
          </Kicker>

          <Text style={[styles.greeting, { fontFamily: family('heading') }]}>
            {`Chào, ${trip.travellerName}`}
          </Text>

          <View style={styles.offlineRow}>
            <View style={styles.offlineDot} />
            <Text style={[styles.offlineText, { fontFamily: family('bodyBold') }]}>
              {`Offline · ${weather.fetchedAgo}`}
            </Text>
          </View>
        </View>

        <CompassMascot />
      </View>

      <View style={styles.chipRow}>
        <Pill tone="accent">{`${weather.temp} · ${weather.description}`}</Pill>
        <Pill tone="accent2">{`${walked} of ${trip.dayCount} walked`}</Pill>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space[3],
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    ...type.display,
    color: colors.text,
    marginTop: 3,
    includeFontPadding: false,
  },
  offlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent2Ramp[500],
  },
  offlineText: {
    ...type.meta,
    color: colors.neutral[600],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
});
