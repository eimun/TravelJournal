import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import BmtcBusScheduleModal from './BmtcBusScheduleModal';
import { findBusesForLocation, calculateUpcomingBusDepartures } from '../data/bmtcBusData';
import { formatDistance, estimateWalkMinutes } from '../services/locationService';

function fareLabel(m) {
  if (m.fare === null || m.fare === undefined) return m.key === 'walk' ? 'Free' : 'App price';
  if (m.fare === 0) return 'Free';
  const approx = m.fareOfficial && m.fareOfficial.distanceSource === 'estimated' ? '~' : '';
  return approx + '₹' + m.fare;
}

export default function ConnectingLegSelector({
  step,
  selectedModeKey,
  onSelectMode,
}) {
  const [showBusModal, setShowBusModal] = useState(false);

  if (!step?.modes) return null;

  const modes = step.modes;
  const currentKey = selectedModeKey || step.selectedMode || step.defaultMode || 'auto';
  const currentMode = modes[currentKey] || modes.auto;
  const isLong = step.isLongDistance;
  const dynamicFare = step.dynamicFare || modes.auto?.dynamicFare;
  const surge = dynamicFare?.surge;
  const providers = dynamicFare?.providers || {};
  const autoTariff = dynamicFare?.official?.auto?.tariff;

  const matchedBus =
    step.matchedBus ||
    modes.bus?.matchedBus ||
    (step.fromStation || step.toStation ? findBusesForLocation(step.fromStation || step.toStation)[0] : null);

  const busSchedule =
    step.busSchedule ||
    modes.bus?.busSchedule ||
    (matchedBus ? calculateUpcomingBusDepartures(matchedBus, new Date()) : null);

  const modeKeys = ['auto', 'bike', 'cab', 'bus', 'walk'];
  const legDistance = formatDistance(step.distanceMeters || 0);
  const legWalkMin = estimateWalkMinutes(step.distanceMeters || 0);

  const getModeMeta = (key, m) => {
    switch (key) {
      case 'auto':
        return {
          displayFare: providers.rtoMeter?.fareText || fareLabel(m),
          subtitle: providers.appAuto?.fareText
            ? `Meter ${providers.rtoMeter?.fareText || '~₹37'} · Apps ${providers.appAuto.fareText}`
            : 'Official meter fare',
          badge: 'Popular',
        };
      case 'bike':
        return {
          displayFare: providers.bike?.fareText || (m.fare ? `~₹${m.fare}` : '~₹60 – ₹75'),
          subtitle: 'Rapido, Uber Moto',
          badge: 'Fastest',
        };
      case 'cab':
        return {
          displayFare: providers.cab?.fareText || (m.fare ? `~₹${m.fare}` : 'Official tariff'),
          subtitle: 'Uber, Ola & local cabs',
          badge: null,
        };
      case 'bus':
        return {
          displayFare: fareLabel(m),
          subtitle: matchedBus
            ? `Route ${matchedBus.routeNumber} feeder`
            : 'BMTC Feeder bus · Direct stop',
          badge: 'Cheapest',
        };
      case 'walk':
      default:
        return {
          displayFare: 'Free',
          subtitle: isLong ? `${legDistance} · long walk` : 'Direct pedestrian footpath',
          badge: isLong ? 'Long Walk' : null,
        };
    }
  };

  return (
    <View style={styles.container}>
      {/* Long Walk Warning Banner (Only when walking a long distance) */}
      {isLong && currentKey === 'walk' && (
        <View style={[styles.warningBanner, styles.warningBannerSevere]}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningTextCol}>
            <Text style={styles.warningTitle}>LONG WALK NOTICE ({legDistance} · ~{legWalkMin} min)</Text>
            <Text style={styles.warningDesc}>
              Walking {legDistance} in heat and traffic is tiring. Auto or bike taxi recommended.
            </Text>
          </View>
        </View>
      )}

      {/* Unified Commute Options Card - shown once cleanly */}
      <View style={styles.mainCard}>
        {/* Card Header */}
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardHeaderTitle}>SELECT TRAVEL MODE</Text>
            <Text style={styles.cardHeaderSub}>
              {legDistance} by road · Tap option to choose
            </Text>
          </View>
          <View style={styles.selectedPillBadge}>
            <Text style={styles.selectedPillText}>
              {modes[currentKey]?.emoji || '🛺'} {modes[currentKey]?.label} Active
            </Text>
          </View>
        </View>

        {/* Live Surge Banner (if active) */}
        {surge && (
          <View style={[styles.surgeBanner, { borderColor: surge.color || '#2563eb', backgroundColor: `${surge.color || '#2563eb'}12` }]}>
            <Text style={styles.surgeEmoji}>{surge.emoji || '⚡'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.surgeLabel, { color: surge.color || '#2563eb' }]}>{surge.label}</Text>
              <Text style={styles.surgeAdvice} numberOfLines={1}>{surge.advice}</Text>
            </View>
          </View>
        )}

        {/* Unified Mode List */}
        <View style={styles.modesList}>
          {modeKeys.map((key) => {
            const m = modes[key];
            if (!m) return null;
            const isSelected = currentKey === key;
            const meta = getModeMeta(key, m);

            return (
              <Pressable
                key={key}
                onPress={(e) => {
                  e.stopPropagation();
                  onSelectMode(key);
                }}
                style={({ pressed }) => [
                  styles.modeRow,
                  isSelected && styles.modeRowSelected,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={styles.modeRowLeft}>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioInnerDot} />}
                  </View>
                  <Text style={styles.modeEmoji}>{m.emoji || '🚗'}</Text>
                  <View style={styles.modeTextCol}>
                    <View style={styles.modeTitleRow}>
                      <Text style={[styles.modeName, isSelected && styles.modeNameSelected]}>
                        {m.label}
                      </Text>
                      {meta.badge && (
                        <View
                          style={[
                            styles.badgePill,
                            meta.badge === 'Cheapest' && styles.badgeCheapest,
                            meta.badge === 'Fastest' && styles.badgeFastest,
                            meta.badge === 'Popular' && styles.badgePopular,
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              meta.badge === 'Cheapest' && styles.badgeTextCheapest,
                              meta.badge === 'Fastest' && styles.badgeTextFastest,
                              meta.badge === 'Popular' && styles.badgeTextPopular,
                            ]}
                          >
                            {meta.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.modeSubText} numberOfLines={1}>
                      {meta.subtitle}
                    </Text>
                  </View>
                </View>

                <View style={styles.modeRowRight}>
                  <Text style={[styles.modeFare, isSelected && styles.modeFareSelected]}>
                    {meta.displayFare}
                  </Text>
                  <Text style={styles.modeDuration}>{m.durationMinutes} min</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Bus Details & Live Timings (shown when Bus is selected) */}
        {currentKey === 'bus' && (
          <View style={styles.busInfoCard}>
            <View style={styles.busHeaderRow}>
              <View style={styles.busHeaderLeft}>
                <View style={styles.busBadge}>
                  <Text style={styles.busBadgeText}>BMTC PUBLIC TRANSIT</Text>
                </View>
                <Text style={styles.busTitle}>
                  {matchedBus ? `Route ${matchedBus.routeNumber} Feeder` : 'Metro Feeder & City Bus Routes'}
                </Text>
                <Text style={styles.busSubtitle}>
                  {matchedBus ? matchedBus.name : 'Direct bus stand outside station · Flat ₹10–₹15'}
                </Text>
              </View>
              <Text style={styles.busEmoji}>🚌</Text>
            </View>

            {busSchedule && busSchedule.departures && busSchedule.departures.length > 0 && (
              <View style={styles.todayBusScheduleBox}>
                <View style={styles.todayBusHeader}>
                  <View style={styles.liveGreenRow}>
                    <View style={styles.liveGreenDot} />
                    <Text style={styles.todayBusHeading}>LIVE BUS TIMINGS</Text>
                  </View>
                  <View style={styles.busFreqBadge}>
                    <Text style={styles.todayBusFreqText}>{busSchedule.frequencyText}</Text>
                  </View>
                </View>

                <View style={styles.nextBusHeroRow}>
                  <View style={styles.nextBusHeroLeft}>
                    <Text style={styles.nextBusHeroLabel}>NEXT BUS DEPARTURE</Text>
                    <Text style={styles.nextBusHeroTime}>{busSchedule.departures[0]?.timeFormatted}</Text>
                  </View>
                  <View style={styles.nextBusCountdownPill}>
                    <Text style={styles.nextBusCountdownText}>
                      In {busSchedule.nextBusInMinutes} mins
                    </Text>
                  </View>
                </View>

                <View style={styles.todayUpcomingSection}>
                  <Text style={styles.todayDepPillsLabel}>Upcoming:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.todayDepPillsScroll}>
                    {busSchedule.departures.slice(1, 4).map((dep, di) => (
                      <View key={di} style={styles.todayDepPill}>
                        <Text style={styles.todayDepPillTime}>{dep.timeFormatted}</Text>
                        <View style={styles.busPillSubBadge}>
                          <Text style={styles.todayDepPillSub}>+{dep.inMinutes}m</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            <Pressable
              onPress={() => setShowBusModal(true)}
              style={({ pressed }) => [
                styles.busScheduleButton,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={styles.busScheduleButtonText}>🚌 View Full BMTC Timetable</Text>
            </Pressable>
          </View>
        )}

        {/* Selected Mode Insider Tip */}
        {currentMode.tip && (
          <View style={styles.selectedTipBox}>
            <Text style={styles.selectedTipText}>💡 {currentMode.tip}</Text>
          </View>
        )}

        {/* Single Subtle Source Footnote */}
        <Text style={styles.sourceFootnote} numberOfLines={1}>
          Source: {autoTariff?.authority || 'Transport Authority'} & verified market ride estimates.
        </Text>
      </View>

      {/* BMTC Bus Modal */}
      <BmtcBusScheduleModal
        visible={showBusModal}
        onClose={() => setShowBusModal(false)}
        initialQuery={step.fromStation || step.toStation || ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 6,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
  },
  warningBannerSevere: {
    backgroundColor: '#fee2e2',
    borderWidth: 1.2,
    borderColor: '#fca5a5',
  },
  warningIcon: {
    fontSize: 18,
  },
  warningTextCol: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.5,
    color: '#991b1b',
    marginBottom: 2,
  },
  warningDesc: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: '#7f1d1d',
    lineHeight: 16,
  },
  mainCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: 14,
    ...shadow.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.8,
    color: colors.neutral[800],
  },
  cardHeaderSub: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    marginTop: 1,
  },
  selectedPillBadge: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  selectedPillText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: '#15803d',
  },
  surgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  surgeEmoji: {
    fontSize: 16,
  },
  surgeLabel: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
  },
  surgeAdvice: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
  },
  modesList: {
    gap: 7,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: radius.md,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderWidth: 1.2,
    borderColor: colors.neutral[200],
  },
  modeRowSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
    ...shadow.sm,
  },
  modeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
    paddingRight: 6,
  },
  radioCircle: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  radioCircleSelected: {
    borderColor: '#16a34a',
  },
  radioInnerDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#16a34a',
  },
  modeEmoji: {
    fontSize: 18,
  },
  modeTextCol: {
    flex: 1,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeName: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  modeNameSelected: {
    color: '#14532d',
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral[200],
  },
  badgeCheapest: {
    backgroundColor: '#dcfce7',
  },
  badgeFastest: {
    backgroundColor: '#e0e7ff',
  },
  badgePopular: {
    backgroundColor: '#fef3c7',
  },
  badgeText: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  badgeTextCheapest: {
    color: '#15803d',
  },
  badgeTextFastest: {
    color: '#3730a3',
  },
  badgeTextPopular: {
    color: '#92400e',
  },
  modeSubText: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    marginTop: 2,
  },
  modeRowRight: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  modeFare: {
    fontSize: 13,
    fontFamily: fontFamily.heading,
    color: colors.neutral[700],
  },
  modeFareSelected: {
    color: '#15803d',
    fontFamily: fontFamily.heading,
  },
  modeDuration: {
    fontSize: 10,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    marginTop: 1,
  },
  sourceFootnote: {
    fontSize: 10,
    fontFamily: fontFamily.body,
    color: colors.neutral[400],
    marginTop: 10,
    textAlign: 'center',
  },
  selectedTipBox: {
    backgroundColor: colors.accentRamp[100],
    borderRadius: radius.sm,
    padding: 9,
    marginTop: 8,
  },
  selectedTipText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyMedium,
    color: colors.accentRamp[800],
    lineHeight: 16,
  },
  busInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 14,
    marginTop: 12,
    ...shadow.sm,
  },
  busHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  busHeaderLeft: {
    flex: 1,
    paddingRight: 10,
  },
  busBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginBottom: 4,
  },
  busBadgeText: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    color: '#15803d',
    letterSpacing: 0.6,
  },
  busTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: '#14532d',
  },
  busSubtitle: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: '#16a34a',
    marginTop: 2,
  },
  busEmoji: {
    fontSize: 24,
  },
  busDesc: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    lineHeight: 16,
    marginBottom: 12,
  },
  busScheduleButton: {
    backgroundColor: '#15803d',
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busScheduleButtonText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
  },
  todayBusScheduleBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 12,
    marginBottom: 10,
    ...shadow.sm,
  },
  todayBusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  liveGreenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  todayBusHeading: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.5,
    color: '#14532d',
  },
  busFreqBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  todayBusFreqText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyMedium,
    color: '#15803d',
  },
  nextBusHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  nextBusHeroLeft: {
    gap: 2,
  },
  nextBusHeroLabel: {
    fontSize: 9.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.8,
    color: '#16a34a',
  },
  nextBusHeroTime: {
    fontSize: 16,
    fontFamily: fontFamily.bodyBold,
    color: '#14532d',
  },
  nextBusCountdownPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  nextBusCountdownText: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: '#15803d',
  },
  todayUpcomingSection: {
    marginBottom: 4,
  },
  todayDepPillsLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bodyMedium,
    color: '#166534',
    marginBottom: 6,
  },
  todayDepPillsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 10,
  },
  todayDepPill: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    ...shadow.sm,
  },
  todayDepPillTime: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: '#14532d',
  },
  busPillSubBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  todayDepPillSub: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: '#15803d',
  },
});
