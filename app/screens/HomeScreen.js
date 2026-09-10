import { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

import { colors, space, type } from '../theme/tokens';
import { family } from '../theme/fonts';
import { Card, Kicker, SectionTitle } from '../components/primitives';
import AnimatedTrail from '../components/AnimatedTrail';
import BudgetRing from '../components/BudgetRing';
import CachedMapCard from '../components/CachedMapCard';
import HomeHeader from '../components/HomeHeader';
import JournalCard from '../components/JournalCard';
import NextUpCard from '../components/NextUpCard';
import PackingQuest from '../components/PackingQuest';
import TodayList from '../components/TodayList';
import XpToast, { useXpToast } from '../components/XpToast';
import {
  nextActivity,
  packingItems as seedPacking,
  todayActivities,
  trailDays,
  trip,
  weather,
} from '../data/sampleTrip';

/**
 * The clock the fixture runs against — 12:18, which puts the 13:30 stop about an
 * hour out. The real build reads the device clock; this keeps the demo screen
 * showing a live countdown that matches the design.
 */
const FIXTURE_START_MINUTES = 12 * 60 + 18;

const statusBarInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

/**
 * Home — the first page.
 *
 * Everything here renders from local data with no network call, which is the
 * offline-first rule from PRD 9.7 expressed in the very first screen: nothing on
 * this page can be blocked by connectivity.
 */
export default function HomeScreen({ onOpenTab }) {
  const [minutes, setMinutes] = useState(FIXTURE_START_MINUTES);
  const [packing, setPacking] = useState(seedPacking);
  const [xp, setXp] = useState(340);
  const [snoozed, setSnoozed] = useState(false);
  const { message, anim, fire } = useXpToast();

  useEffect(() => {
    const tick = setInterval(() => setMinutes((m) => m + 1 / 60), 1000);
    return () => clearInterval(tick);
  }, []);

  const togglePacking = useCallback(
    (target) => {
      setPacking((current) => {
        const updated = current.map((item) =>
          item.id === target.id ? { ...item, done: !item.done } : item,
        );
        const nowDone = updated.filter((item) => item.done).length;
        const wasDone = current.filter((item) => item.done).length;

        if (nowDone > wasDone) {
          const complete = nowDone === updated.length;
          setXp((value) => value + (complete ? 40 : 10));
          fire(complete ? 'Bag packed · +40 XP' : '+10 XP');
        }
        return updated;
      });
    },
    [fire],
  );

  const snooze = useCallback(() => {
    setSnoozed(true);
    fire('Snoozed 15 min');
  }, [fire]);

  const walked = trailDays.filter((day) => day.state === 'done').length;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader trip={trip} weather={weather} walked={walked} />

        <NextUpCard
          activity={nextActivity}
          minutesNow={minutes}
          snoozed={snoozed}
          onOpenTrail={() => onOpenTab?.('map')}
          onSnooze={snooze}
        />

        <View style={styles.split}>
          <Card style={styles.budgetCard}>
            <BudgetRing budget={trip.budget} spent={trip.spent} />
          </Card>

          <CachedMapCard destination={trip.destination} onPress={() => onOpenTab?.('map')} />
        </View>

        <View style={styles.block}>
          <SectionTitle>Today</SectionTitle>
          <TodayList activities={todayActivities} onSelect={() => onOpenTab?.('trips')} />
        </View>

        <View style={styles.block}>
          <View style={styles.blockHead}>
            <View>
              <Kicker>The trail</Kicker>
              <SectionTitle>{`${walked} of ${trip.dayCount} walked`}</SectionTitle>
            </View>
            <Feather name="chevron-right" size={22} color={colors.neutral[500]} />
          </View>

          <AnimatedTrail days={trailDays} onSelectDay={() => onOpenTab?.('trips')} />
        </View>

        <PackingQuest
          items={packing}
          xp={xp}
          questTitle="Pack for the rain"
          advice={weather.advice}
          onToggle={togglePacking}
        />

        <JournalCard entryCount={14} onCapture={() => onOpenTab?.('journal')} />

        <Text style={[styles.footnote, { fontFamily: family('body') }]}>
          No account · PIN locked · INR home currency
        </Text>
      </ScrollView>

      <XpToast message={message} anim={anim} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: statusBarInset + space[3],
    paddingHorizontal: space[4],
    paddingBottom: space[8],
    gap: space[4],
  },
  split: {
    flexDirection: 'row',
    gap: space[3],
  },
  budgetCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space[4],
  },
  block: {
    gap: space[3],
  },
  blockHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footnote: {
    ...type.meta,
    color: colors.neutral[600],
    textAlign: 'center',
  },
});
