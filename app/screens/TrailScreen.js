import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';
import { family } from '../theme/fonts';
import AnimatedTrail from '../components/AnimatedTrail';
import PackingQuest from '../components/PackingQuest';
import { FadeIn } from '../components/motion';
import { useTrip } from '../../src/context/TripContext';
import { FLAGGED_DAY_INDEX, trailDays } from '../data/sampleTrip';

/**
 * The Trail — the whole trip as a path you walk, then the packing side quest.
 *
 * Day sheets from PRD 7.1 become stones on a winding path. Progress is a place,
 * not a percentage.
 */
export default function TrailScreen({ contentPadding }) {
  const { trip, reading, packing, togglePacking, setOpenDay } = useTrip();
  const walked = trailDays.filter((day) => day.state === 'done').length;
  const progress = trip.dayCount ? walked / trip.dayCount : 0;

  return (
    <FadeIn>
      <ScrollView
        contentContainerStyle={[styles.content, contentPadding]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <View style={styles.headCopy}>
            <Text style={[styles.kicker, { fontFamily: family('bodyBold') }]}>THE TRAIL</Text>
            <Text style={[styles.title, { fontFamily: family('heading') }]}>{trip.title}</Text>
          </View>

          <View style={styles.progressWrap}>
            <Text style={[styles.progressLabel, { fontFamily: family('body') }]}>
              {`${walked} of ${trip.dayCount} walked`}
            </Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.trail}>
          <AnimatedTrail
            days={trailDays}
            flaggedIndex={FLAGGED_DAY_INDEX}
            flagText={reading.trailFlag}
            flagKind={reading.kind}
            onSelectDay={(stone) => setOpenDay(stone.index)}
          />
        </View>

        <View style={styles.quest}>
          <PackingQuest items={packing} questTitle={reading.quest} onToggle={togglePacking} />
        </View>
      </ScrollView>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 6,
  },
  headCopy: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    fontSize: 11.5,
    letterSpacing: 1.38,
    color: colors.accentRamp[700],
  },
  title: {
    fontSize: 25,
    lineHeight: 32,
    marginTop: 4,
    color: colors.text,
    includeFontPadding: false,
  },
  progressWrap: {
    alignItems: 'flex-end',
  },
  progressLabel: {
    fontSize: 11.5,
    color: colors.neutral[600],
  },
  track: {
    width: 78,
    height: 9,
    marginTop: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral[300],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accentRamp[500],
  },
  trail: {
    marginTop: 14,
    paddingBottom: 10,
  },
  quest: {
    marginTop: 8,
  },
});
