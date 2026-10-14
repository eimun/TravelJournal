import React, { useEffect, useRef, useState } from 'react';
import { Animated, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { useTrip } from '../../src/context/TripContext';
import { getDistanceBetween } from '../data/transitData';
import { formatDistance } from '../services/locationService';
import {
  AuthenticRestaurantImage,
  cuisineInfo,
  restaurantOpenStatus,
  verificationBadge,
} from '../screens/ExploreScreen';
import { FEATURES, log, reportIssue } from '../../src/logging';

const PRICE_TIER_LABELS = { 1: '₹', 2: '₹₹', 3: '₹₹₹' };
const PRICE_TIER_COLORS = {
  1: { bg: '#e8f5e9', text: '#2e7d32' },
  2: { bg: '#fff8e1', text: '#f57f17' },
  3: { bg: '#fce4ec', text: '#c62828' },
};

const REPORT_REASONS = [
  { id: 'closed', label: 'Permanently closed' },
  { id: 'location', label: 'Wrong location' },
  { id: 'hours', label: 'Wrong hours' },
  { id: 'diet', label: 'Wrong veg / non-veg' },
  { id: 'price', label: 'Prices wrong' },
  { id: 'photo', label: 'Photo misleading' },
];

function StarRating({ rating, count, source }) {
  if (rating === null || rating === undefined) return null;
  const STAR_POINTS = '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <Svg width={13} height={13} viewBox="0 0 24 24">
        <Polygon points={STAR_POINTS} fill="#f59e0b" stroke="none" />
      </Svg>
      <Text style={{ fontSize: 12, fontFamily: fontFamily.bodyBold, color: colors.neutral[700] }}>
        {rating.toFixed(1)}
        {count ? ` (${count})` : ''} · {source}
      </Text>
    </View>
  );
}

function TagPill({ tag }) {
  const tagMap = {
    veg: { label: '🌿 Pure veg', bg: '#e8f5e9', text: '#2e7d32' },
    veg_options: { label: '🥗 Veg options', bg: '#f1f8e9', text: '#558b2f' },
    nonveg: { label: '🍖 Non-veg', bg: '#fdecea', text: '#c62828' },
    halal: { label: '☪️ Halal', bg: '#e3f2fd', text: '#1565c0' },
    jain: { label: '🪷 Jain', bg: '#f3e5f5', text: '#6a1b9a' },
    nog: { label: '🧅 No onion-garlic', bg: '#f3e5f5', text: '#6a1b9a' },
    cash: { label: '💵 Cash only', bg: '#fff9c4', text: '#f57f17' },
  };
  const info = tagMap[tag];
  if (!info) return null;
  return (
    <View style={[styles.tagPill, { backgroundColor: info.bg }]}>
      <Text style={[styles.tagText, { color: info.text }]}>{info.label}</Text>
    </View>
  );
}

const DIET_LABELS = {
  veg: 'Pure veg',
  veg_options: 'Veg options',
  nonveg: 'Non-veg',
  halal: 'Halal',
  jain: 'Jain',
  nog: 'No onion-garlic',
  cash: 'Cash only',
};
function dietSummary(tags = []) {
  const labels = tags.map((t) => DIET_LABELS[t]).filter(Boolean);
  return labels.length ? labels.join(', ') : 'Not available';
}

function SourceRow({ label, value, source }) {
  return (
    <View style={styles.sourceRow}>
      <Text style={styles.sourceLabel}>{label}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.sourceValue}>{value}</Text>
        {!!source && <Text style={styles.sourceFrom}>{source}</Text>}
      </View>
    </View>
  );
}

export default function RestaurantDetailSheet() {
  const {
    selectedRestaurant,
    closeRestaurant,
    visitedRestaurants,
    toggleVisitedRestaurant,
    userLocation,
    selectDestination,
    setTab,
    fireToast,
  } = useTrip();
  // Report panel is tied to one restaurant id, so it resets when another restaurant opens.
  const [reportOpenFor, setReportOpenFor] = useState(null);

  const slideAnim = useRef(new Animated.Value(800)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedRestaurant) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 800, duration: 250, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [selectedRestaurant]);

  if (!selectedRestaurant) return null;

  const r = selectedRestaurant;
  const showReport = reportOpenFor === r.id;
  const setShowReport = (open) => setReportOpenFor(open ? r.id : null);
  const status = restaurantOpenStatus(r);
  const isVisited = visitedRestaurants.includes(r.id);
  const tierColors = r.priceTier ? PRICE_TIER_COLORS[r.priceTier] : null;
  const badge = verificationBadge(r);
  const v = r.verification || {};
  const cuisine = cuisineInfo(r.cuisine);

  const distanceMeters = userLocation
    ? getDistanceBetween(userLocation.latitude, userLocation.longitude, r.latitude, r.longitude)
    : null;

  const verificationText =
    v.status === 'verified'
      ? `Matched "${v.osmName}" on OpenStreetMap (${v.distanceM} m from the saved pin).`
      : v.status === 'location_corrected'
        ? `Saved pin was ${v.distanceM} m from "${v.osmName}" on OpenStreetMap — map location corrected.`
        : v.status && v.status.startsWith('live_')
          ? `Loaded live from ${v.source}.`
          : 'Could not be matched to OpenStreetMap. Details are from the curated guide and may be outdated.';

  const handleGetDirections = () => {
    log.info(FEATURES.FOOD, 'restaurant.directions', { id: r.id });
    selectDestination({
      id: r.id,
      name: r.name,
      area: r.area,
      category: 'Restaurant',
      latitude: r.latitude,
      longitude: r.longitude,
      nearestMetro: r.nearestMetro,
    });
    closeRestaurant();
    setTab('navigate');
    fireToast(`Getting directions to ${r.name.split(',')[0]}`);
  };

  const handleReport = (reason) => {
    reportIssue('FOOD_USER_REPORTED', {
      key: `${r.id}:${reason.id}`,
      message: `${r.name}: ${reason.label}`,
      data: {
        id: r.id,
        reason: reason.id,
        verification: v.status,
        lat: r.latitude,
        lon: r.longitude,
        hoursSource: r.hoursSource,
        dietSource: r.dietSource,
      },
    });
    setShowReport(false);
    fireToast('Thanks — saved to diagnostics logs');
  };

  const Container = Platform.OS === 'web' ? View : Modal;
  const containerProps =
    Platform.OS === 'web'
      ? { style: [StyleSheet.absoluteFill, { zIndex: 1000 }] }
      : { transparent: true, visible: true, animationType: 'none', onRequestClose: closeRestaurant };

  return (
    <Container {...containerProps}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeRestaurant} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />
        <Pressable onPress={closeRestaurant} style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={10}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[600]} strokeWidth={2.5} strokeLinecap="round">
            <Path d="M18 6L6 18M6 6l12 12" />
          </Svg>
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.heroImageContainer}>
            <AuthenticRestaurantImage uri={r.image} cuisine={r.cuisine} style={styles.heroImage} resizeMode="cover" restaurantId={r.id} />
            <View style={styles.heroOverlayGradient} />
            {r.imageIsRepresentative !== false && (
              <View style={styles.heroMustTryBadge}>
                <Text style={styles.heroMustTryBadgeText}>Representative photo</Text>
              </View>
            )}
          </View>

          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.restaurantName}>{r.name}</Text>
              <Text style={styles.restaurantArea}>
                {cuisine.emoji} {[cuisine.label, r.area].filter(Boolean).join(' · ')}
              </Text>
              <View style={styles.metaRow}>
                <View style={[styles.verifyBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.verifyBadgeText, { color: badge.fg }]}>{badge.label}</Text>
                </View>
                {tierColors && (
                  <View style={[styles.priceBadge, { backgroundColor: tierColors.bg }]}>
                    <Text style={[styles.priceBadgeText, { color: tierColors.text }]}>{PRICE_TIER_LABELS[r.priceTier]}</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.openBadge,
                    { backgroundColor: status.isOpen === true ? '#e8f5e9' : status.isOpen === false ? '#fdecea' : '#f3f3f3' },
                  ]}
                >
                  <View
                    style={[
                      styles.openDot,
                      { backgroundColor: status.isOpen === true ? '#4caf50' : status.isOpen === false ? '#f44336' : '#9e9e9e' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.openBadgeText,
                      { color: status.isOpen === true ? '#2e7d32' : status.isOpen === false ? '#c62828' : '#616161' },
                    ]}
                  >
                    {status.label}
                  </Text>
                </View>
                <StarRating rating={r.rating} count={r.userRatingCount} source={r.ratingSource} />
              </View>
            </View>
          </View>

          <View style={styles.infoStrip}>
            {distanceMeters !== null && (
              <View style={styles.infoItem}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[600]} strokeWidth={2} strokeLinecap="round">
                  <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <Circle cx="12" cy="10" r="3" />
                </Svg>
                <Text style={styles.infoText}>{formatDistance(distanceMeters)} away (straight line)</Text>
              </View>
            )}
            {!!r.nearestMetro && (
              <View style={styles.infoItem}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[600]} strokeWidth={2} strokeLinecap="round">
                  <Path d="M3 11l19-9-9 19-2-8-8-2z" />
                </Svg>
                <Text style={styles.infoText}>{r.nearestMetro}</Text>
              </View>
            )}
          </View>

          {(r.tags || []).length > 0 && (
            <View style={styles.tagsRow}>
              {r.tags.map((t) => (
                <TagPill key={t} tag={t} />
              ))}
            </View>
          )}

          {r.mustTry?.dish && (
            <View style={styles.mustTryCard}>
              <Text style={styles.mustTryLabel}>⭐ KNOWN FOR</Text>
              <View style={styles.mustTryRow}>
                <Text style={styles.mustTryDish}>{r.mustTry.dish}</Text>
                {!!r.mustTry.price && <Text style={styles.mustTryPrice}>~₹{r.mustTry.price}</Text>}
              </View>
            </View>
          )}

          {(r.topDishes || []).length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Typical prices</Text>
              <View style={styles.dishList}>
                {r.topDishes.map((dish, i) => (
                  <View key={i} style={styles.dishRow}>
                    <Text style={styles.dishName}>{dish.name}</Text>
                    <Text style={styles.dishPrice}>~₹{dish.price}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.priceNote}>Approximate, from the curated guide — not a live menu.</Text>
            </>
          )}

          {!!r.insiderNote && (
            <View style={styles.insiderCard}>
              <View style={styles.insiderHeader}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.accentRamp[700]} strokeWidth={2.5} strokeLinecap="round">
                  <Circle cx="12" cy="12" r="10" />
                  <Path d="M12 8v4M12 16h.01" />
                </Svg>
                <Text style={styles.insiderTitle}>Local tip (curated)</Text>
              </View>
              <Text style={styles.insiderText}>{r.insiderNote}</Text>
            </View>
          )}

          {/* Where this data comes from */}
          <Text style={styles.sectionTitle}>About this info</Text>
          <View style={styles.sourceCard}>
            <Text style={styles.sourceIntro}>{verificationText}</Text>
            <SourceRow label="Hours" value={r.hoursText || 'Not available'} source={r.hoursSource} />
            <SourceRow label="Diet" value={dietSummary(r.tags)} source={r.dietSource} />
            <SourceRow label="Rating" value={r.rating ? r.rating.toFixed(1) : 'Not shown — no rating source'} source={r.ratingSource} />
            {v.checkedAt && <SourceRow label="Checked" value={v.checkedAt} />}
            {!!v.osmUrl && (
              <Pressable onPress={() => Linking.openURL(v.osmUrl).catch(() => {})}>
                <Text style={styles.sourceLink}>View on OpenStreetMap ↗</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.actionsRow}>
            <Pressable onPress={handleGetDirections} style={({ pressed }) => [styles.directionsBtn, pressed && { transform: [{ scale: 0.97 }] }]}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round">
                <Path d="M3 11l19-9-9 19-2-8-8-2z" />
              </Svg>
              <Text style={styles.directionsBtnText}>Get Directions</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                toggleVisitedRestaurant(r.id);
                log.info(FEATURES.FOOD, 'restaurant.visited_toggle', { id: r.id, visited: !isVisited });
                fireToast(isVisited ? `Unmarked ${r.name.split(',')[0]}` : 'Marked as visited! 🍽️');
              }}
              style={({ pressed }) => [styles.visitedBtn, isVisited && styles.visitedBtnActive, pressed && { opacity: 0.8 }]}
            >
              <Text style={[styles.visitedBtnText, isVisited && styles.visitedBtnTextActive]}>
                {isVisited ? '✓ Been here' : '+ Mark visited'}
              </Text>
            </Pressable>
          </View>

          <Pressable onPress={() => setShowReport(!showReport)} style={styles.reportToggle}>
            <Text style={styles.reportToggleText}>{showReport ? 'Cancel' : '⚑ Report wrong info'}</Text>
          </Pressable>
          {showReport && (
            <View style={styles.reportGrid}>
              {REPORT_REASONS.map((reason) => (
                <Pressable
                  key={reason.id}
                  onPress={() => handleReport(reason)}
                  style={({ pressed }) => [styles.reportChip, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.reportChipText}>{reason.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Container>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral[50] || '#fafaf8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    ...shadow.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[300],
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 18,
    zIndex: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  heroImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 14,
    backgroundColor: colors.neutral[200],
    position: 'relative',
    ...shadow.sm,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlayGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  heroMustTryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(23, 23, 23, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    maxWidth: '90%',
  },
  heroMustTryBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  restaurantName: {
    fontSize: 22,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    lineHeight: 27,
    paddingRight: 36,
  },
  restaurantArea: {
    fontSize: 12.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  priceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  priceBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 0.5,
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  openBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
  },
  infoStrip: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: 12,
    marginTop: 14,
    gap: 7,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[700],
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tagPill: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.neutral[200],
  },
  tagText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
  },
  mustTryCard: {
    marginTop: 16,
    backgroundColor: colors.accentRamp[100],
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.accentRamp[300],
  },
  mustTryLabel: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1,
    color: colors.accentRamp[700],
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  mustTryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  mustTryDish: {
    fontSize: 16,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    flex: 1,
  },
  mustTryPrice: {
    fontSize: 18,
    fontFamily: fontFamily.heading,
    color: colors.accentRamp[700],
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 8,
  },
  dishList: {
    gap: 0,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.neutral[100],
    ...shadow.sm,
  },
  dishRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dishName: {
    fontSize: 13.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[800],
    flex: 1,
  },
  dishPrice: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  insiderCard: {
    marginTop: 16,
    backgroundColor: colors.accentRamp[200],
    borderRadius: radius.lg,
    padding: 14,
  },
  insiderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 7,
  },
  insiderTitle: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[800],
  },
  insiderText: {
    fontSize: 13,
    fontFamily: fontFamily.body,
    color: colors.accentRamp[900],
    lineHeight: 19,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  directionsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accentRamp[600],
    borderRadius: radius.pill,
    paddingVertical: 14,
  },
  directionsBtnText: {
    fontSize: 14,
    fontFamily: fontFamily.bodyBold,
    color: '#fff',
  },
  visitedBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitedBtnActive: {
    backgroundColor: colors.accent2Ramp[200],
    borderColor: colors.accent2Ramp[400],
  },
  visitedBtnText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  visitedBtnTextActive: {
    color: colors.accent2Ramp[800],
  },
  verifyBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  verifyBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
  },
  priceNote: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    marginTop: 8,
    marginBottom: 16,
  },
  sourceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  sourceIntro: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[800],
    lineHeight: 18,
  },
  sourceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sourceLabel: {
    width: 62,
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[500],
  },
  sourceValue: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[900],
  },
  sourceFrom: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    marginTop: 1,
  },
  sourceLink: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: '#1d4ed8',
  },
  reportToggle: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  reportToggleText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
    color: '#b3261e',
  },
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  reportChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#f3b4ae',
    backgroundColor: '#fdecea',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reportChipText: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: '#8c1d18',
  },
});
