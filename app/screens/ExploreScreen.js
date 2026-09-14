import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { useTrip } from '../../src/context/TripContext';
import { CUISINE_CATEGORIES } from '../data/bengaluruData';
import { getDistanceBetween } from '../data/transitData';
import { formatDistance } from '../services/locationService';

const PRICE_TIER_LABELS = { 1: '₹', 2: '₹₹', 3: '₹₹₹' };

const DIET_FILTERS = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'veg', label: 'Veg', emoji: '🌿' },
  { id: 'nonveg', label: 'Non-veg', emoji: '🍖' },
  { id: 'halal', label: 'Halal', emoji: '☪️' },
  { id: 'jain', label: 'Jain', emoji: '🪷' },
];

function getMealContext() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return { label: 'Good morning', sub: 'Best breakfast spots near you', emoji: '☀️' };
  if (hour >= 11 && hour < 15) return { label: 'Lunch time', sub: 'Hearty meals, honest prices', emoji: '🌤️' };
  if (hour >= 15 && hour < 18) return { label: 'Afternoon snack', sub: 'Tea, coffee & light bites', emoji: '☕' };
  if (hour >= 18 && hour < 22) return { label: 'Dinner time', sub: 'Evening meals & street food', emoji: '🌆' };
  return { label: 'Late night eats', sub: 'Places still open for you', emoji: '🌙' };
}

function isOpenNow(openTime, closeTime) {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const parse = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
  return cur >= parse(openTime) && cur < parse(closeTime);
}

function MiniStars({ rating }) {
  const STAR_POINTS = '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Svg key={i} width={10} height={10} viewBox="0 0 24 24">
          <Polygon
            points={STAR_POINTS}
            fill={i <= Math.round(rating) ? '#f59e0b' : '#d1d5db'}
            stroke="none"
          />
        </Svg>
      ))}
      <Text style={{ fontSize: 11, fontFamily: fontFamily.bodyBold, color: colors.neutral[600], marginLeft: 3 }}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

export default function ExploreScreen({ contentPadding }) {
  const {
    filteredRestaurants,
    cuisineFilter,
    setCuisineFilter,
    dietFilter,
    setDietFilter,
    openRestaurant,
    visitedRestaurants,
    userLocation,
  } = useTrip();

  const mealCtx = getMealContext();

  // Get time-aware "hot right now" suggestions (top 3 open restaurants by rating)
  const hotNow = useMemo(() => {
    const open = filteredRestaurants.filter((r) => isOpenNow(r.openTime, r.closeTime));
    return [...open].sort((a, b) => b.rating - a.rating).slice(0, 3);
  }, [filteredRestaurants]);

  const allRestaurants = filteredRestaurants;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.container, contentPadding]}
    >
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>BENGALURU · FOOD GUIDE</Text>
          <Text style={styles.heading}>{mealCtx.emoji} {mealCtx.label}</Text>
          <Text style={styles.subHeading}>{mealCtx.sub}</Text>
        </View>
        <View style={styles.locationChip}>
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.accentRamp[700]} strokeWidth={2.5} strokeLinecap="round">
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <Circle cx="12" cy="10" r="3" />
          </Svg>
          <Text style={styles.locationChipText}>Near you</Text>
        </View>
      </View>

      {/* ── Diet Quick Filter ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterStrip}
      >
        {DIET_FILTERS.map((f) => {
          const active = dietFilter === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => setDietFilter(f.id)}
              style={({ pressed }) => [
                styles.dietChip,
                active && styles.dietChipActive,
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <Text style={styles.dietChipEmoji}>{f.emoji}</Text>
              <Text style={[styles.dietChipText, active && styles.dietChipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Cuisine Category Scroll ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cuisineStrip}
      >
        {CUISINE_CATEGORIES.map((cat) => {
          const active = cuisineFilter === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setCuisineFilter(cat.id)}
              style={({ pressed }) => [
                styles.cuisineChip,
                active && styles.cuisineChipActive,
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
            >
              <Text style={styles.cuisineEmoji}>{cat.emoji}</Text>
              <Text style={[styles.cuisineLabel, active && styles.cuisineLabelActive]}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Hot Right Now Banner ── */}
      {hotNow.length > 0 && (
        <View style={styles.hotSection}>
          <Text style={styles.sectionTitle}>🔥 Open right now · Top picks</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hotScroll}
          >
            {hotNow.map((r) => {
              const distMeters =
                userLocation
                  ? getDistanceBetween(userLocation.latitude, userLocation.longitude, r.latitude, r.longitude)
                  : null;
              const isVisited = visitedRestaurants.includes(r.id);
              return (
                <Pressable
                  key={r.id}
                  onPress={() => openRestaurant(r.id)}
                  style={({ pressed }) => [
                    styles.hotCard,
                    pressed && { transform: [{ scale: 0.97 }] },
                  ]}
                >
                  {isVisited && (
                    <View style={styles.visitedBadge}>
                      <Text style={styles.visitedBadgeText}>✓ Been here</Text>
                    </View>
                  )}
                  <View style={styles.hotCardCuisineTag}>
                    <Text style={styles.hotCardCuisineText}>
                      {CUISINE_CATEGORIES.find((c) => c.id === r.cuisine)?.emoji} {CUISINE_CATEGORIES.find((c) => c.id === r.cuisine)?.label}
                    </Text>
                  </View>
                  <Text style={styles.hotCardName} numberOfLines={2}>{r.name}</Text>
                  <Text style={styles.hotCardMustTry} numberOfLines={1}>⭐ {r.mustTry.dish}</Text>
                  <View style={styles.hotCardFooter}>
                    <MiniStars rating={r.rating} />
                    <Text style={styles.hotCardPrice}>₹{r.mustTry.price}</Text>
                  </View>
                  {distMeters && (
                    <Text style={styles.hotCardDist}>{formatDistance(distMeters)} away</Text>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── Insider Tip Banner ── */}
      <View style={styles.tipBanner}>
        <View style={styles.tipDecorCircle} />
        <Text style={styles.tipBannerLabel}>💡 LOCAL PRICE GUIDE</Text>
        <Text style={styles.tipBannerText}>
          A darshini breakfast is ₹30–₹90. Filter coffee is ₹15–₹40. Near tourist spots, walk 2 streets inland — same dish, local price. Most of the best ones are cash only and shut before noon.
        </Text>
      </View>

      {/* ── All Restaurants List ── */}
      <View style={styles.listSection}>
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>
            {allRestaurants.length} places found
          </Text>
          {userLocation && (
            <Text style={styles.sortedByText}>Sorted by distance</Text>
          )}
        </View>

        <View style={styles.cardsList}>
          {allRestaurants.map((r) => {
            const open = isOpenNow(r.openTime, r.closeTime);
            const isVisited = visitedRestaurants.includes(r.id);
            const distMeters =
              userLocation
                ? getDistanceBetween(userLocation.latitude, userLocation.longitude, r.latitude, r.longitude)
                : null;
            const tierColors = {
              1: { bg: '#e8f5e9', text: '#2e7d32' },
              2: { bg: '#fff8e1', text: '#f57f17' },
              3: { bg: '#fce4ec', text: '#c62828' },
            }[r.priceTier];

            return (
              <Pressable
                key={r.id}
                onPress={() => openRestaurant(r.id)}
                style={({ pressed }) => [
                  styles.restaurantCard,
                  isVisited && styles.restaurantCardVisited,
                  pressed && { transform: [{ translateY: 2 }], opacity: 0.95 },
                ]}
              >
                {/* Left accent bar */}
                <View style={[
                  styles.cardAccentBar,
                  { backgroundColor: open ? '#4caf50' : colors.neutral[300] }
                ]} />

                <View style={styles.cardBody}>
                  {/* Top row */}
                  <View style={styles.cardTopRow}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.cardNameRow}>
                        <Text style={styles.cardName} numberOfLines={1}>{r.name}</Text>
                        {isVisited && (
                          <View style={styles.visitedPill}>
                            <Text style={styles.visitedPillText}>✓</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.cardArea} numberOfLines={1}>{r.area}</Text>
                    </View>
                    <View style={styles.cardRightCol}>
                      <View style={[styles.priceTierBadge, { backgroundColor: tierColors.bg }]}>
                        <Text style={[styles.priceTierText, { color: tierColors.text }]}>
                          {PRICE_TIER_LABELS[r.priceTier]}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Must try + rating row */}
                  <View style={styles.cardMidRow}>
                    <Text style={styles.cardMustTry} numberOfLines={1}>
                      ⭐ {r.mustTry.dish} · <Text style={styles.cardMustTryPrice}>₹{r.mustTry.price}</Text>
                    </Text>
                  </View>

                  {/* Bottom row: cuisine tag, distance, open status, arrow */}
                  <View style={styles.cardBottomRow}>
                    <View style={styles.cuisineTag}>
                      <Text style={styles.cuisineTagText}>
                        {CUISINE_CATEGORIES.find((c) => c.id === r.cuisine)?.emoji} {CUISINE_CATEGORIES.find((c) => c.id === r.cuisine)?.label}
                      </Text>
                    </View>
                    {distMeters && (
                      <Text style={styles.cardDist}>{formatDistance(distMeters)}</Text>
                    )}
                    <View style={[
                      styles.openPill,
                      { backgroundColor: open ? '#e8f5e9' : '#f5f5f5' }
                    ]}>
                      <View style={[
                        styles.openDot,
                        { backgroundColor: open ? '#4caf50' : '#9e9e9e' }
                      ]} />
                      <Text style={[
                        styles.openText,
                        { color: open ? '#2e7d32' : '#757575' }
                      ]}>
                        {open ? 'Open' : r.openTime}
                      </Text>
                    </View>
                    <MiniStars rating={r.rating} />
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[400]} strokeWidth={2.5} strokeLinecap="round">
                      <Path d="M9 18l6-6-6-6" />
                    </Svg>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {allRestaurants.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>No matches</Text>
          <Text style={styles.emptyText}>Try changing the cuisine or diet filter.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 90,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  kicker: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1.3,
    color: colors.accentRamp[700],
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: 26,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    marginTop: 3,
    lineHeight: 31,
  },
  subHeading: {
    fontSize: 13,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 3,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accentRamp[100],
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 11,
    marginTop: 4,
  },
  locationChipText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[700],
  },
  // Diet filter strip
  filterStrip: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
    paddingBottom: 4,
  },
  dietChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 13,
    ...shadow.sm,
  },
  dietChipActive: {
    backgroundColor: colors.accentRamp[500],
  },
  dietChipEmoji: {
    fontSize: 13,
  },
  dietChipText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  dietChipTextActive: {
    color: '#fff',
  },
  // Cuisine strip
  cuisineStrip: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
    paddingBottom: 12,
  },
  cuisineChip: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
    ...shadow.sm,
    minWidth: 70,
  },
  cuisineChipActive: {
    backgroundColor: colors.neutral[900],
  },
  cuisineEmoji: {
    fontSize: 20,
  },
  cuisineLabel: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  cuisineLabelActive: {
    color: '#fff',
  },
  // Hot section
  hotSection: {
    marginBottom: 8,
  },
  hotScroll: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    paddingRight: 6,
  },
  hotCard: {
    width: 168,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    padding: 14,
    ...shadow.md,
    position: 'relative',
  },
  visitedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.accent2Ramp[200],
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  visitedBadgeText: {
    fontSize: 9,
    fontFamily: fontFamily.bodyBold,
    color: colors.accent2Ramp[800],
  },
  hotCardCuisineTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentRamp[100],
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  hotCardCuisineText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[800],
  },
  hotCardName: {
    fontSize: 15,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    lineHeight: 19,
    marginBottom: 4,
  },
  hotCardMustTry: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginBottom: 8,
  },
  hotCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotCardPrice: {
    fontSize: 14,
    fontFamily: fontFamily.heading,
    color: colors.accentRamp[700],
  },
  hotCardDist: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[500],
    marginTop: 4,
  },
  // Tip banner
  tipBanner: {
    marginTop: 4,
    marginBottom: 20,
    backgroundColor: colors.accentRamp[600],
    borderRadius: radius.lg,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
    ...shadow.md,
  },
  tipDecorCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -50,
    right: -30,
  },
  tipBannerLabel: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1.1,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 7,
  },
  tipBannerText: {
    fontSize: 13,
    fontFamily: fontFamily.body,
    color: '#fff',
    lineHeight: 19,
  },
  // List section
  listSection: {
    gap: 0,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
  },
  sortedByText: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
  },
  cardsList: {
    gap: 10,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.sm,
  },
  restaurantCardVisited: {
    backgroundColor: colors.accent2Ramp[50] || '#f0fdf4',
    borderWidth: 1,
    borderColor: colors.accent2Ramp[200],
  },
  cardAccentBar: {
    width: 4,
    borderRadius: 2,
  },
  cardBody: {
    flex: 1,
    padding: 13,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
    flex: 1,
  },
  visitedPill: {
    backgroundColor: colors.accent2Ramp[200],
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  visitedPillText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: colors.accent2Ramp[800],
  },
  cardArea: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
  },
  cardRightCol: {
    alignItems: 'flex-end',
  },
  priceTierBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priceTierText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
  },
  cardMidRow: {
    marginTop: 2,
  },
  cardMustTry: {
    fontSize: 12.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[700],
  },
  cardMustTryPrice: {
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[700],
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 5,
    flexWrap: 'wrap',
  },
  cuisineTag: {
    backgroundColor: colors.neutral[200],
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  cuisineTagText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  cardDist: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[500],
  },
  openPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  openDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  openText: {
    fontSize: 10,
    fontFamily: fontFamily.bodyBold,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fontFamily.heading,
    color: colors.neutral[800],
  },
  emptyText: {
    fontSize: 13,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    textAlign: 'center',
  },
});
