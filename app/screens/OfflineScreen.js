import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { useTrip } from '../../src/context/TripContext';
import { PACK_ITEMS, EXTRA_PACKS } from '../data/bengaluruData';
import CircularProgress from '../components/CircularProgress';

export default function OfflineScreen({ contentPadding }) {
  const { packStatus, packPct, startPackDownload, fireToast } = useTrip();

  const isDone = packStatus === 'done';
  const isBusy = packStatus === 'busy';

  const getStatusTitle = () => {
    if (isDone) return 'Bengaluru pack installed';
    if (isBusy) return 'Downloading…';
    return 'Bengaluru pack · 63 MB';
  };

  const getStatusMeta = () => {
    if (isDone) return 'Works in airplane mode · verified 12 Aug';
    if (isBusy) return 'Keep the app open · about 20 seconds';
    return 'Do this on wifi before you fly';
  };

  const getButtonLabel = () => {
    if (isDone) return 'Installed · check for updates';
    if (isBusy) return 'Downloading…';
    return 'Download the city';
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.container, contentPadding]}
    >
      {/* Header */}
      <Text style={styles.kicker}>OFFLINE PACK</Text>
      <Text style={styles.heading}>Bengaluru, in your pocket</Text>
      <Text style={styles.subheading}>
        Download once on wifi. Fares, routes, opening times and every place
        sheet then work with the SIM out — no roaming, no dead map.
      </Text>

      {/* Main Download Card */}
      <View style={styles.mainCard}>
        <View style={styles.progressRow}>
          <CircularProgress
            size={64}
            strokeWidth={6}
            pct={packPct}
            done={isDone}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>{getStatusTitle()}</Text>
            <Text style={styles.statusMeta}>{getStatusMeta()}</Text>
          </View>
        </View>

        <Pressable
          onPress={startPackDownload}
          style={({ pressed }) => [
            styles.downloadBtn,
            isDone && styles.downloadBtnDone,
            pressed && { transform: [{ translateY: 2 }] },
          ]}
        >
          <Text style={styles.downloadBtnText}>{getButtonLabel()}</Text>
        </Pressable>
      </View>

      {/* Included Items Checklist */}
      <View style={styles.itemsList}>
        {PACK_ITEMS.map((item) => {
          const marked = isDone || (packPct > 40 && item.defaultIncluded);
          return (
            <View key={item.id} style={styles.itemRow}>
              <View
                style={[
                  styles.itemTickBox,
                  marked && styles.itemTickBoxMarked,
                ]}
              >
                <Text style={styles.tickText}>{marked ? '✓' : ''}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemMeta}>{item.meta}</Text>
              </View>

              <Text style={styles.itemSize}>{item.size}</Text>
            </View>
          );
        })}
      </View>

      {/* Day Trips & Extra Packs */}
      <View style={styles.extrasCard}>
        <Text style={styles.extrasKicker}>DAY TRIPS · EXTRA PACKS</Text>
        <View style={styles.extrasList}>
          {EXTRA_PACKS.map((extra) => (
            <Pressable
              key={extra.id}
              onPress={() => fireToast('Queued for the next wifi')}
              style={({ pressed }) => [
                styles.extraRow,
                pressed && { transform: [{ translateY: 1 }] },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.extraName}>{extra.name}</Text>
                <Text style={styles.extraMeta}>{extra.meta}</Text>
              </View>

              <View style={styles.getBadge}>
                <Text style={styles.getBadgeText}>{extra.action}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Footer verification note */}
      <Text style={styles.footerNote}>
        Fares and timings last verified 12 Aug 2026 · flag anything wrong from a
        place sheet
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 90,
  },
  kicker: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1.2,
    color: colors.accentRamp[700],
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 26,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    marginTop: 4,
    lineHeight: 30,
  },
  subheading: {
    fontSize: 13.5,
    fontFamily: fontFamily.body,
    lineHeight: 20,
    color: colors.neutral[700],
    marginTop: 9,
  },
  mainCard: {
    marginTop: 16,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: 17,
    ...shadow.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statusTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  statusMeta: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 3,
  },
  downloadBtn: {
    marginTop: 15,
    backgroundColor: colors.accentRamp[500],
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
  downloadBtnDone: {
    backgroundColor: colors.accent2Ramp[600],
  },
  downloadBtnText: {
    fontSize: 14.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
  itemsList: {
    gap: 9,
    marginTop: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: 13,
    ...shadow.sm,
  },
  itemTickBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTickBoxMarked: {
    backgroundColor: colors.accent2Ramp[500],
  },
  tickText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
  itemLabel: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  itemMeta: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
  },
  itemSize: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[600],
  },
  extrasCard: {
    marginTop: 16,
    backgroundColor: colors.accent2Ramp[200],
    borderRadius: radius.lg,
    padding: 16,
  },
  extrasKicker: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1,
    color: colors.accent2Ramp[800],
  },
  extrasList: {
    gap: 8,
    marginTop: 11,
  },
  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: radius.md,
    padding: 12,
  },
  extraName: {
    fontSize: 13.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.accent2Ramp[900],
  },
  extraMeta: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.accent2Ramp[800],
    marginTop: 2,
  },
  getBadge: {
    backgroundColor: colors.accent2Ramp[600],
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 13,
    ...shadow.sm,
  },
  getBadgeText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
  footerNote: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 16,
    lineHeight: 16,
    textAlign: 'center',
  },
});
