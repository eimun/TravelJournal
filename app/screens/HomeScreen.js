import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../theme/tokens';
import { family } from '../theme/fonts';
import { paletteFor } from '../theme/weatherPalette';
import BudgetRing from '../components/BudgetRing';
import CompassMascot from '../components/CompassMascot';
import Icon from '../components/Icon';
import NextUpCard from '../components/NextUpCard';
import TodayList from '../components/TodayList';
import WeatherCard from '../components/WeatherCard';
import { FadeIn, useSwing } from '../components/motion';
import { useTrip } from '../../src/context/TripContext';
import { nextActivity, todayActivities } from '../data/sampleTrip';

function Chip({ bg, fg, lead, children }) {
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      {lead}
      <Text style={[styles.chipText, { color: fg, fontFamily: family('bodyBold') }]}>
        {children}
      </Text>
    </View>
  );
}

/** The offline dot breathes (`tj-swell`, 2 s) — being offline is normal here. */
function OfflineDot() {
  const swell = useSwing(1000);
  const scale = swell.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  return <Animated.View style={[styles.offlineDot, { transform: [{ scale }] }]} />;
}

/**
 * Home — the first page, laid out as the design canvas draws it.
 *
 * Everything renders from local state with no network call: the offline-first
 * rule from PRD 9.7, expressed in the very first screen.
 */
export default function HomeScreen({ contentPadding }) {
  const { trip, reading, cycleWeather, minutes, snoozed, snooze, xp, memories, setTab } = useTrip();
  const palette = paletteFor(reading.kind);

  return (
    <FadeIn>
      <ScrollView
        contentContainerStyle={[styles.content, contentPadding]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.kicker, { fontFamily: family('bodyBold') }]}>
              {`DAY ${trip.dayIndex} OF ${trip.dayCount} · ${trip.destination.toUpperCase()}`}
            </Text>
            <Text numberOfLines={1} style={[styles.greeting, { fontFamily: family('heading') }]}>
              {`Chào, ${trip.travellerName}`}
            </Text>
          </View>
          <CompassMascot kind={reading.kind} />
        </View>

        <View style={styles.chips}>
          <Chip
            bg={colors.accentRamp[200]}
            fg={colors.accentRamp[800]}
            lead={<Icon name="flame" size={14} color={colors.accentRamp[800]} />}
          >
            {`${xp} trip XP`}
          </Chip>
          <Chip
            bg={colors.accent2Ramp[200]}
            fg={colors.accent2Ramp[800]}
            lead={<Icon name="trophy" size={14} color={colors.accent2Ramp[800]} />}
          >
            {`${memories} memories`}
          </Chip>
          <Chip bg={colors.neutral[200]} fg={colors.neutral[800]} lead={<OfflineDot />}>
            {`Offline · ${trip.cachedAgo}`}
          </Chip>
        </View>

        <View style={styles.nextUp}>
          <NextUpCard
            activity={nextActivity}
            minutesNow={minutes}
            snoozed={snoozed}
            advice={reading.advice}
            adviceDot={palette.dot}
            onOpenTrail={() => setTab('trail')}
            onSnooze={snooze}
          />
        </View>

        <View style={styles.grid}>
          <BudgetRing budget={trip.budget} spent={trip.spent} />
          <WeatherCard destination={trip.destination} reading={reading} onCycle={cycleWeather} />
        </View>

        <Text style={[styles.section, { fontFamily: family('heading') }]}>Today</Text>
        <TodayList activities={todayActivities} onSelect={() => setTab('trail')} />
      </ScrollView>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 6,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.accentRamp[700],
  },
  greeting: {
    fontSize: 25,
    lineHeight: 32,
    marginTop: 4,
    color: colors.text,
    includeFontPadding: false,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  chipText: {
    fontSize: 12.5,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[500],
  },
  nextUp: {
    marginTop: 16,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  section: {
    fontSize: 19,
    lineHeight: 25,
    marginTop: 22,
    marginBottom: 10,
    color: colors.text,
    includeFontPadding: false,
  },
});
