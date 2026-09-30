import React, { useState, useMemo } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import {
  BMTC_ROUTES,
  BMTC_DAILY_PASSES,
  calculateUpcomingBusDepartures,
  findBusesForLocation,
} from '../data/bmtcBusData';

export default function BmtcBusScheduleModal({ visible, onClose, initialQuery = '' }) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'metro_feeder' | 'trunk' | 'airport'
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [showPasses, setShowPasses] = useState(false);

  const filteredRoutes = useMemo(() => {
    let list = BMTC_ROUTES;
    if (categoryFilter !== 'all') {
      list = list.filter((r) => r.type === categoryFilter);
    }
    if (searchQuery.trim().length > 0) {
      list = findBusesForLocation(searchQuery);
      if (categoryFilter !== 'all') {
        list = list.filter((r) => r.type === categoryFilter);
      }
    }
    return list;
  }, [categoryFilter, searchQuery]);

  if (!visible) return null;

  const Container = Platform.OS === 'web' ? View : Modal;
  const containerProps =
    Platform.OS === 'web'
      ? { style: [StyleSheet.absoluteFill, { zIndex: 1200 }] }
      : { transparent: true, visible: true, animationType: 'slide', onRequestClose: onClose };

  return (
    <Container {...containerProps}>
      {/* Dimmed backdrop */}
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </View>

      {/* Main Bus Sheet */}
      <View style={styles.modalCard}>
        {/* Top Handle */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={styles.headerBadgeRow}>
              <View style={styles.bmtcBadge}>
                <Text style={styles.bmtcBadgeText}>BMTC BENGALURU TRANSIT</Text>
              </View>
              <View style={styles.liveClockBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.liveClockBadgeText}>LIVE FREQUENCY TIMETABLE</Text>
              </View>
            </View>
            <Text style={styles.title}>BMTC Bus Routes & Timings</Text>
            <Text style={styles.subtitle}>
              Metro Feeders (MF-Series), Ring Road Trunks & Airport Vayu Vajra
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            hitSlop={12}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[700]} strokeWidth={2.5}>
              <Path d="M18 6L6 18M6 6l12 12" />
            </Svg>
          </Pressable>
        </View>

        {/* Search Bar Input */}
        <View style={styles.searchBoxContainer}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[400]} strokeWidth={2.5}>
            <Circle cx="11" cy="11" r="8" />
            <Path d="M21 21l-4.35-4.35" />
          </Svg>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by route (500D, MF-18) or stop (Majestic, ITPL)..."
            placeholderTextColor={colors.neutral[400]}
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Text style={{ fontSize: 13, color: colors.neutral[500] }}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Category Filter Pills */}
        <View style={styles.filterStripContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterStrip}>
            {[
              { id: 'all', label: `All Routes (${BMTC_ROUTES.length})` },
              { id: 'metro_feeder', label: '🚇 Metro Feeders (MF)' },
              { id: 'trunk', label: '⚡ Trunks (500D, 335E)' },
              { id: 'airport', label: '✈️ Airport Vayu Vajra' },
            ].map((f) => {
              const active = categoryFilter === f.id;
              return (
                <Pressable
                  key={f.id}
                  onPress={() => setCategoryFilter(f.id)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Scrollable Bus List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
          {/* BMTC Daily Pass & Fare Saver Banner */}
          <Pressable
            onPress={() => setShowPasses((prev) => !prev)}
            style={({ pressed }) => [styles.passBanner, pressed && { opacity: 0.9 }]}
          >
            <View style={styles.passBannerHeader}>
              <View style={styles.passIconBadge}>
                <Text style={{ fontSize: 16 }}>🎫</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.passTitleRow}>
                  <Text style={styles.passBannerTitle}>BMTC Daily Pass (Unlimited Rides)</Text>
                  <Text style={styles.passPricePill}>₹70 / ₹140</Text>
                </View>
                <Text style={styles.passBannerSub}>
                  {showPasses ? 'Tap to collapse pass guide' : 'Tap to see how to save 60% vs autos & cabs'}
                </Text>
              </View>
              <Text style={styles.passChevron}>{showPasses ? '▲' : '▼'}</Text>
            </View>

            {showPasses && (
              <View style={styles.passListExpanded}>
                {BMTC_DAILY_PASSES.map((pass) => (
                  <View key={pass.id} style={styles.passItemCard}>
                    <View style={styles.passItemHeader}>
                      <Text style={styles.passItemName}>{pass.name}</Text>
                      <View style={styles.passItemBadge}>
                        <Text style={styles.passItemBadgeText}>{pass.badge}</Text>
                      </View>
                    </View>
                    <Text style={styles.passItemPrice}>₹{pass.price} · {pass.validity}</Text>
                    <Text style={styles.passItemCoverage}>🚌 {pass.coverage}</Text>
                    <Text style={styles.passItemBuy}>📲 {pass.howToBuy}</Text>
                    <Text style={styles.passItemTip}>💡 {pass.savingsTip}</Text>
                  </View>
                ))}
              </View>
            )}
          </Pressable>

          {filteredRoutes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={{ fontSize: 28, marginBottom: 8 }}>🚌</Text>
              <Text style={styles.emptyTitle}>No matching BMTC bus found</Text>
              <Text style={styles.emptyDesc}>Try searching for "Majestic", "500D", "Whitefield", or "Silk Board".</Text>
            </View>
          ) : (
            filteredRoutes.map((route) => {
              const schedule = calculateUpcomingBusDepartures(route);
              const isExpanded = selectedRouteId === route.id;

              return (
                <View key={route.id} style={styles.routeCard}>
                  {/* Route Card Top Row */}
                  <View style={styles.routeCardHeader}>
                    <View style={[styles.routeNumberBadge, { backgroundColor: route.color }]}>
                      <Text style={styles.routeNumberText}>{route.routeNumber}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.routeName}>{route.name}</Text>
                      <Text style={styles.routeCategory}>{route.category}</Text>
                    </View>
                    <View style={styles.fareTagCol}>
                      <Text style={styles.ordinaryFareText}>₹{route.ordinaryFare}</Text>
                      <Text style={styles.ordinaryFareSub}>Base ticket</Text>
                    </View>
                  </View>

                  {/* Real-time Upcoming Departures Bar */}
                  <View style={styles.departuresBar}>
                    <View style={styles.nextDepBadge}>
                      <View style={styles.greenPulseDot} />
                      <Text style={styles.nextDepText}>
                        Next in {schedule.nextBusInMinutes}m ({schedule.departures[0]?.timeFormatted})
                      </Text>
                    </View>
                    <Text style={styles.freqText}>{schedule.frequencyText}</Text>
                  </View>

                  {/* Upcoming Next 3 Timings */}
                  <View style={styles.timingsRow}>
                    <Text style={styles.upcomingLabel}>Upcoming:</Text>
                    {schedule.departures.slice(1, 4).map((d, di) => (
                      <View key={di} style={styles.timingPill}>
                        <Text style={styles.timingPillText}>{d.timeFormatted}</Text>
                      </View>
                    ))}
                    <Text style={styles.firstLastText}>
                      ({route.firstBus.split(' ')[0]} – {route.lastBus.split(' ')[0]})
                    </Text>
                  </View>

                  {/* Route Highlight Note */}
                  <Text style={styles.highlightText}>💡 {route.highlight}</Text>

                  {/* Expand Stops Toggle */}
                  <Pressable
                    onPress={() => setSelectedRouteId(isExpanded ? null : route.id)}
                    style={({ pressed }) => [styles.expandStopsBtn, pressed && { opacity: 0.8 }]}
                  >
                    <Text style={styles.expandStopsBtnText}>
                      {isExpanded ? '▲ Hide Stops' : `▼ View ${route.stops.length} Stops on Route`}
                    </Text>
                  </Pressable>

                  {/* Stops Sequence */}
                  {isExpanded && (
                    <View style={styles.stopsContainer}>
                      {route.stops.map((stop, sIdx) => {
                        const isFirst = sIdx === 0;
                        const isEnd = sIdx === route.stops.length - 1;
                        return (
                          <View key={sIdx} style={styles.stopItem}>
                            <View style={styles.stopDotCol}>
                              <View
                                style={[
                                  styles.stopDot,
                                  isFirst && { backgroundColor: '#10b981' },
                                  isEnd && { backgroundColor: '#ef4444' },
                                ]}
                              />
                              {!isEnd && <View style={styles.stopLine} />}
                            </View>
                            <Text style={[styles.stopName, (isFirst || isEnd) && styles.stopNameBold]}>
                              {stop} {isFirst ? '(Origin)' : isEnd ? '(Terminal)' : ''}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  modalCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '92%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow.lg,
    overflow: 'hidden',
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.neutral[300],
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bmtcBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  bmtcBadgeText: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    color: '#1d4ed8',
    letterSpacing: 0.5,
  },
  liveClockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  liveClockBadgeText: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    color: '#15803d',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    marginLeft: 10,
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface[100],
    borderRadius: radius.md,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[800],
    padding: 0,
  },
  filterStripContainer: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  filterStrip: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  filterChipActive: {
    backgroundColor: colors.neutral[900],
    borderColor: colors.neutral[900],
  },
  filterChipText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  scrollList: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
  },
  emptyDesc: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    marginTop: 4,
  },
  routeCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: 14,
    ...shadow.sm,
  },
  routeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeNumberBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    minWidth: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeNumberText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  routeName: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  routeCategory: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    marginTop: 1,
  },
  fareTagCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  ordinaryFareText: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: '#16a34a',
  },
  ordinaryFareSub: {
    fontSize: 9,
    fontFamily: fontFamily.body,
    color: colors.neutral[400],
  },
  departuresBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
    marginBottom: 8,
  },
  nextDepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  nextDepText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#15803d',
  },
  freqText: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: '#166534',
  },
  timingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  upcomingLabel: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[500],
  },
  timingPill: {
    backgroundColor: colors.surface[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  timingPillText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  firstLastText: {
    fontSize: 10,
    fontFamily: fontFamily.body,
    color: colors.neutral[400],
    marginLeft: 2,
  },
  highlightText: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    lineHeight: 15,
    marginBottom: 8,
  },
  expandStopsBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  expandStopsBtnText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[700],
  },
  stopsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    minHeight: 28,
  },
  stopDotCol: {
    alignItems: 'center',
    width: 14,
  },
  stopDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[400],
    marginTop: 4,
  },
  stopLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.neutral[200],
  },
  stopName: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[700],
    flex: 1,
  },
  stopNameBold: {
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  passBanner: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
  },
  passBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  passIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  passBannerTitle: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: '#065f46',
  },
  passPricePill: {
    backgroundColor: '#059669',
    color: '#ffffff',
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radius.xs,
  },
  passBannerSub: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: '#047857',
    marginTop: 2,
  },
  passChevron: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: '#059669',
  },
  passListExpanded: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#a7f3d0',
    gap: 10,
  },
  passItemCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  passItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  passItemName: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: '#0f172a',
  },
  passItemBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  passItemBadgeText: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    color: '#b45309',
  },
  passItemPrice: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: '#059669',
    marginBottom: 4,
  },
  passItemCoverage: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[700],
    lineHeight: 14,
    marginBottom: 2,
  },
  passItemBuy: {
    fontSize: 10,
    fontFamily: fontFamily.bodyMedium,
    color: '#2563eb',
    lineHeight: 14,
    marginBottom: 2,
  },
  passItemTip: {
    fontSize: 10,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    lineHeight: 14,
  },
});
