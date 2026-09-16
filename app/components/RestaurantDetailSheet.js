import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { useTrip } from '../../src/context/TripContext';
import { getDistanceBetween } from '../data/transitData';
import { formatDistance } from '../services/locationService';

const PRICE_TIER_LABELS = { 1: '₹', 2: '₹₹', 3: '₹₹₹' };
const PRICE_TIER_COLORS = {
  1: { bg: '#e8f5e9', text: '#2e7d32' },
  2: { bg: '#fff8e1', text: '#f57f17' },
  3: { bg: '#fce4ec', text: '#c62828' },
};

function StarRating({ rating }) {
  const STAR_POINTS = '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26';
  const full = Math.floor(rating);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Svg key={i} width={13} height={13} viewBox="0 0 24 24">
          <Polygon
            points={STAR_POINTS}
            fill={i <= full ? '#f59e0b' : i === full + 1 && rating - full >= 0.5 ? '#f59e0b' : '#d1d5db'}
            opacity={i === full + 1 && rating - full >= 0.5 ? 0.55 : 1}
            stroke="none"
          />
        </Svg>
      ))}
      <Text style={{ fontSize: 12, fontFamily: fontFamily.bodyBold, color: colors.neutral[700], marginLeft: 3 }}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

function TagPill({ tag }) {
  const tagMap = {
    veg: { label: '🌿 Veg', bg: '#e8f5e9', text: '#2e7d32' },
    nonveg: { label: '🍖 Non-veg', bg: '#fdecea', text: '#c62828' },
    halal: { label: '☪️ Halal', bg: '#e3f2fd', text: '#1565c0' },
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

function isOpenNow(openTime, closeTime) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const parseTime = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };
  const open = parseTime(openTime);
  const close = parseTime(closeTime);
  return currentMinutes >= open && currentMinutes < close;
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

  const slideAnim = useRef(new Animated.Value(800)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedRestaurant) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 800,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedRestaurant]);

  if (!selectedRestaurant) return null;

  const r = selectedRestaurant;
  const open = isOpenNow(r.openTime, r.closeTime);
  const isVisited = visitedRestaurants.includes(r.id);
  const tierColors = PRICE_TIER_COLORS[r.priceTier];

  const distanceMeters =
    userLocation
      ? getDistanceBetween(userLocation.latitude, userLocation.longitude, r.latitude, r.longitude)
      : null;

  const handleGetDirections = () => {
    selectDestination({
      id: r.id,
      name: r.name,
      area: r.area,
      category: 'Restaurant',
      latitude: r.latitude,
      longitude: r.longitude,
      nearestMetro: r.nearestMetro,
      metroLine: 'purple',
      estimatedCost: r.mustTry.price,
    });
    closeRestaurant();
    setTab('navigate');
    fireToast(`Getting directions to ${r.name.split(',')[0]}`);
  };

  if (!selectedRestaurant) return null;

  const Container = Platform.OS === 'web' ? View : Modal;
  const containerProps = Platform.OS === 'web'
    ? { style: [StyleSheet.absoluteFill, { zIndex: 1000 }] }
    : { transparent: true, visible: true, animationType: 'none', onRequestClose: closeRestaurant };

  return (
    <Container {...containerProps}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeRestaurant} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Close button */}
        <Pressable
          onPress={closeRestaurant}
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
          hitSlop={10}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[600]} strokeWidth={2.5} strokeLinecap="round">
            <Path d="M18 6L6 18M6 6l12 12" />
          </Svg>
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.restaurantName}>{r.name}</Text>
              <Text style={styles.restaurantArea}>{r.area}</Text>
              <View style={styles.metaRow}>
                <StarRating rating={r.rating} />
                <View style={[styles.priceBadge, { backgroundColor: tierColors.bg }]}>
                  <Text style={[styles.priceBadgeText, { color: tierColors.text }]}>
                    {PRICE_TIER_LABELS[r.priceTier]}
                  </Text>
                </View>
                <View style={[styles.openBadge, { backgroundColor: open ? '#e8f5e9' : '#fdecea' }]}>
                  <View style={[styles.openDot, { backgroundColor: open ? '#4caf50' : '#f44336' }]} />
                  <Text style={[styles.openBadgeText, { color: open ? '#2e7d32' : '#c62828' }]}>
                    {open ? 'Open now' : 'Closed'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Hours + Distance row */}
          <View style={styles.infoStrip}>
            <View style={styles.infoItem}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[600]} strokeWidth={2} strokeLinecap="round">
                <Circle cx="12" cy="12" r="10" />
                <Path d="M12 6v6l4 2" />
              </Svg>
              <Text style={styles.infoText}>{r.openTime} – {r.closeTime}</Text>
            </View>
            {distanceMeters && (
              <View style={styles.infoItem}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[600]} strokeWidth={2} strokeLinecap="round">
                  <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <Circle cx="12" cy="10" r="3" />
                </Svg>
                <Text style={styles.infoText}>{formatDistance(distanceMeters)} away</Text>
              </View>
            )}
            <View style={styles.infoItem}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[600]} strokeWidth={2} strokeLinecap="round">
                <Path d="M3 11l19-9-9 19-2-8-8-2z" />
              </Svg>
              <Text style={styles.infoText} numberOfLines={1}>{r.nearestMetro}</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {r.tags.map((t) => <TagPill key={t} tag={t} />)}
            <View style={styles.tagPill}>
              <Text style={[styles.tagText, { color: colors.neutral[600] }]}>📅 {r.established}</Text>
            </View>
          </View>

          {/* Must Try */}
          <View style={styles.mustTryCard}>
            <Text style={styles.mustTryLabel}>⭐ MUST TRY</Text>
            <View style={styles.mustTryRow}>
              <Text style={styles.mustTryDish}>{r.mustTry.dish}</Text>
              <Text style={styles.mustTryPrice}>₹{r.mustTry.price}</Text>
            </View>
          </View>

          {/* Menu items */}
          <Text style={styles.sectionTitle}>Fair Prices</Text>
          <View style={styles.dishList}>
            {r.topDishes.map((dish, i) => (
              <View key={i} style={styles.dishRow}>
                <Text style={styles.dishName}>{dish.name}</Text>
                <Text style={styles.dishPrice}>₹{dish.price}</Text>
              </View>
            ))}
          </View>

          {/* Insider note */}
          <View style={styles.insiderCard}>
            <View style={styles.insiderHeader}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.accentRamp[700]} strokeWidth={2.5} strokeLinecap="round">
                <Circle cx="12" cy="12" r="10" />
                <Path d="M12 8v4M12 16h.01" />
              </Svg>
              <Text style={styles.insiderTitle}>Local insider tip</Text>
            </View>
            <Text style={styles.insiderText}>{r.insiderNote}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <Pressable
              onPress={handleGetDirections}
              style={({ pressed }) => [
                styles.directionsBtn,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round">
                <Path d="M3 11l19-9-9 19-2-8-8-2z" />
              </Svg>
              <Text style={styles.directionsBtnText}>Get Directions</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                toggleVisitedRestaurant(r.id);
                fireToast(isVisited ? `Unmarked ${r.name.split(',')[0]}` : `Marked as visited! 🍽️`);
              }}
              style={({ pressed }) => [
                styles.visitedBtn,
                isVisited && styles.visitedBtnActive,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={[styles.visitedBtnText, isVisited && styles.visitedBtnTextActive]}>
                {isVisited ? '✓ Been here' : '+ Mark visited'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </Container>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
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
    zIndex: 10,
    padding: 4,
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
});
