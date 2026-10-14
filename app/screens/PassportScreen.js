import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, type } from '../theme/tokens';
import { family } from '../theme/fonts';
import { Card, Kicker, Pill, SectionTitle } from '../components/primitives';
import { useTrip } from '../../src/context/TripContext';
import { getAllStamps } from '../../src/repositories/passportRepo';
import { getWallet } from '../services/savingsService';
import { foodEquivalents } from '../../src/domain/savings';
import { FOOD_MENUS } from '../data/bengaluruTrails';

/**
 * The Explorer Passport (F-2) + Savings Wallet (F-3).
 * Stamps unlock from GPS check-ins at trail stops and heritage eateries; the
 * wallet folds persisted per-ride savings. Both read from SQLite — fully offline.
 */
export default function PassportScreen({ contentPadding }) {
  const { cityId } = useTrip();
  const [stamps, setStamps] = useState([]);
  const [wallet, setWallet] = useState({ totalInr: 0, events: 0, days: [] });

  const load = useCallback(async () => {
    try {
      const [s, w] = await Promise.all([getAllStamps(), getWallet()]);
      setStamps(s);
      setWallet(w);
    } catch {
      // db unavailable (web/preview) — show empty states gracefully
    }
  }, []);

  // Load is async (repo-backed); the setState happens inside a promise,
  // not in the synchronous effect body, so no cascading render.
  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  const cityStamps = useMemo(() => stamps.filter((s) => s.cityId === cityId), [stamps, cityId]);

  // A quick live preview: what the current route decision would be worth.
  const preview = useMemo(() => {
    if (wallet.totalInr > 0) return foodEquivalents(wallet.totalInr, FOOD_MENUS);
    return [];
  }, [wallet.totalInr]);

  return (
    <ScrollView
      contentContainerStyle={[styles.content, contentPadding]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Kicker tone="accent">EXPLORER PASSPORT</Kicker>
        <SectionTitle>Your stamps & savings</SectionTitle>
        <Text style={[styles.sub, { fontFamily: family('body') }]}>
          Arrive at trail stops and heritage eateries to collect stamps. Every rupee you save riding
          transit piles up here.
        </Text>
      </View>

      {/* Savings wallet */}
      <Card style={styles.walletCard}>
        <View style={styles.walletRow}>
          <View style={styles.walletCopy}>
            <Kicker tone="accent2">SAVINGS WALLET</Kicker>
            <Text style={[styles.walletTotal, { fontFamily: family('heading') }]}>
              ₹{wallet.totalInr.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.walletNote, { fontFamily: family('body') }]}>
              {wallet.events === 0
                ? 'Pick the metro once — this number starts growing.'
                : `${wallet.events} ride${wallet.events === 1 ? '' : 's'} outsmarted the cab`}
            </Text>
          </View>
        </View>

        {preview.length > 0 ? (
          <View style={styles.foodRow}>
            {preview.slice(0, 3).map((f) => (
              <View key={f.id} style={styles.foodChip}>
                <Text style={[styles.foodEmoji, { fontFamily: family('bodyBold') }]}>
                  {f.count}×
                </Text>
                <Text style={[styles.foodName, { fontFamily: family('body') }]}>{f.name}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {wallet.days.length > 0 ? (
          <View style={styles.dayRows}>
            {wallet.days.slice(-3).map((day) => (
              <View key={day.day} style={styles.dayRow}>
                <Text style={[styles.dayLabel, { fontFamily: family('body') }]}>{day.day}</Text>
                <Text style={[styles.dayAmount, { fontFamily: family('bodyBold') }]}>
                  ₹{day.amountInr.toLocaleString('en-IN')}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>

      {/* Stamp grid */}
      <View style={styles.stampsSection}>
        <View style={styles.stampsHeader}>
          <SectionTitle>Passport</SectionTitle>
          <Pill tone="accent">{cityStamps.length} collected</Pill>
        </View>

        {cityStamps.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyEmoji, { fontFamily: family('heading') }]}>🛂</Text>
            <Text style={[styles.emptyText, { fontFamily: family('body') }]}>
              Your passport is blank — for now. Take a trail or wander past a heritage eatery and
              the first stamp walks in on its own.
            </Text>
          </Card>
        ) : (
          <View style={styles.grid}>
            {cityStamps.map((stamp) => (
              <Card key={stamp.id} style={styles.stampCard}>
                <Text style={[styles.stampYear, { fontFamily: family('bodyExtraBold') }]}>
                  {stamp.year
                    ? `EST. ${stamp.year}`
                    : stamp.sourceType === 'trail_stop'
                      ? 'TRAIL'
                      : 'LEGEND'}
                </Text>
                <Text
                  style={[styles.stampTitle, { fontFamily: family('heading') }]}
                  numberOfLines={2}
                >
                  {stamp.title}
                </Text>
                <Text style={[styles.stampDate, { fontFamily: family('body') }]}>
                  {stamp.unlockedAt?.slice(0, 10)}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 6,
    gap: space[1],
    marginBottom: space[3],
  },
  sub: {
    color: colors.neutral[700],
    fontSize: type.body.fontSize,
  },
  walletCard: {
    backgroundColor: colors.accentRamp[100],
  },
  walletRow: {
    gap: space[1],
  },
  walletTotal: {
    fontSize: 36,
    color: colors.accentRamp[700],
  },
  walletNote: {
    color: colors.neutral[700],
    fontSize: 12.5,
  },
  foodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
    marginTop: space[2],
  },
  foodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  foodEmoji: {
    color: colors.accentRamp[600],
    fontSize: 12.5,
  },
  foodName: {
    color: colors.neutral[800],
    fontSize: 12.5,
  },
  dayRows: {
    marginTop: space[2],
    gap: 4,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayLabel: {
    color: colors.neutral[600],
    fontSize: 12.5,
  },
  dayAmount: {
    color: colors.accent2Ramp[700],
    fontSize: 12.5,
  },
  stampsSection: {
    marginTop: space[4],
  },
  stampsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[2],
  },
  emptyCard: {
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[5] ?? 22,
  },
  emptyEmoji: {
    fontSize: 34,
  },
  emptyText: {
    color: colors.neutral[600],
    textAlign: 'center',
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  stampCard: {
    width: '31%',
    minWidth: 104,
    gap: 4,
    backgroundColor: colors.accentRamp[200],
    padding: space[2],
  },
  stampYear: {
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.accentRamp[700],
  },
  stampTitle: {
    fontSize: 13.5,
    color: colors.text,
  },
  stampDate: {
    fontSize: 11,
    color: colors.accentRamp[800],
  },
});
