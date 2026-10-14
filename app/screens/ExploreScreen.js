import React, { useMemo } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';
import { colors, fontFamily, radius, shadow } from '../theme/tokens';
import { useTrip } from '../../src/context/TripContext';
import { CUISINE_CATEGORIES } from '../data/bengaluruData';
import { getDistanceBetween } from '../data/transitData';
import { formatDistance } from '../services/locationService';
import { getOpenStatus } from '../../src/domain/openingHours';
import { FEATURES, log, reportIssue } from '../../src/logging';

const PRICE_TIER_LABELS = { 1: '₹', 2: '₹₹', 3: '₹₹₹' };
const PRICE_TIER_COLORS = {
  1: { bg: '#e8f5e9', text: '#2e7d32' },
  2: { bg: '#fff8e1', text: '#b26a00' },
  3: { bg: '#fce4ec', text: '#c62828' },
};

export const AUTHENTIC_CUISINE_FALLBACKS = {
  southindian: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&q=80',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
  streetfood: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
  cafe: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
  northindian: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
  desserts: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80',
  dessert: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80',
  continental: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  fastfood: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  other: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
};

export function cuisineInfo(id) {
  if (id === 'dessert') id = 'desserts';
  if (id === 'continental') return { label: 'Continental', emoji: '🍕' };
  if (id === 'fastfood') return { label: 'Fast food', emoji: '🍔' };
  return CUISINE_CATEGORIES.find((c) => c.id === id) || { label: 'Restaurant', emoji: '🍽️' };
}

export function AuthenticRestaurantImage({ uri, cuisine, style, resizeMode = 'cover', restaurantId }) {
  const fallback = AUTHENTIC_CUISINE_FALLBACKS[cuisine] || AUTHENTIC_CUISINE_FALLBACKS.other;
  // Remember which URI failed; a new `uri` prop is tried again automatically.
  const [failedUri, setFailedUri] = React.useState(null);
  const sourceUri = uri && uri !== failedUri ? uri : fallback;

  return (
    <Image
      source={{ uri: sourceUri }}
      style={style}
      resizeMode={resizeMode}
      onError={(e) => {
        if (sourceUri !== fallback) {
          reportIssue('FOOD_IMAGE_FAILED', {
            key: restaurantId || sourceUri,
            message: e?.nativeEvent?.error || 'image load failed',
            data: { uri: sourceUri },
          });
          setFailedUri(sourceUri);
        }
      }}
    />
  );
}

function getMealContext() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return { label: 'Good morning', sub: 'Breakfast spots near you', emoji: '☀️' };
  if (hour >= 11 && hour < 15) return { label: 'Lunch time', sub: 'Hearty meals, honest prices', emoji: '🌤️' };
  if (hour >= 15 && hour < 18) return { label: 'Afternoon snack', sub: 'Tea, coffee & light bites', emoji: '☕' };
  if (hour >= 18 && hour < 22) return { label: 'Dinner time', sub: 'Evening meals & street food', emoji: '🌆' };
  return { label: 'Late night eats', sub: 'Places still open for you', emoji: '🌙' };
}

/**
 * Open status from the restaurant's schedule (or provider "open now" flag).
 * Hours that were never verified are not turned into "Open/Closed".
 */
export function restaurantOpenStatus(r, now = new Date()) {
  if (r.schedule && r.hoursVerified === false) {
    return { known: false, isOpen: null, label: 'Hours unverified' };
  }
  if (r.schedule) return getOpenStatus(r.schedule, now);
  if (typeof r.isOpenFromProvider === 'boolean') {
    return { known: true, isOpen: r.isOpenFromProvider, label: r.isOpenFromProvider ? 'Open now' : 'Closed now' };
  }
  return { known: false, isOpen: null, label: 'Hours not available' };
}

/** Badge describing where the restaurant record comes from and whether it was checked. */
export function verificationBadge(r) {
  const status = r.verification?.status;
  if (status === 'verified') return { label: '✓ Verified', bg: '#e8f5e9', fg: '#1b5e20' };
  if (status === 'location_corrected') return { label: '✓ Location fixed', bg: '#e3f2fd', fg: '#0d47a1' };
  if (status === 'live_ola') return { label: 'Live · Ola Maps', bg: '#ecfdf5', fg: '#047857' };
  if (status === 'live_osm') return { label: 'Live · OSM', bg: '#e0f2fe', fg: '#0369a1' };
  if (status === 'live_google') return { label: 'Live · Google', bg: '#eff6ff', fg: '#1d4ed8' };
  if (status === 'live_foursquare') return { label: 'Live · Foursquare', bg: '#f3e8ff', fg: '#7e22ce' };
  return { label: 'Unverified', bg: '#f5f5f5', fg: '#6b6b6b' };
}

function StarRating({ rating, count, source }) {
  if (rating === null || rating === undefined) return null;
  const STAR = '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26';
  return (
    <View style={styles.ratingRow}>
      <Svg width={11} height={11} viewBox="0 0 24 24">
        <Polygon points={STAR} fill="#f59e0b" />
      </Svg>
      <Text style={styles.ratingText}>
        {rating.toFixed(1)}
        {count ? ` (${count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count})` : ''}
        {source ? ` · ${source}` : ''}
      </Text>
    </View>
  );
}

function OpenPill({ status }) {
  const color = status.isOpen === true ? '#2e7d32' : status.isOpen === false ? '#b3261e' : '#757575';
  const bg = status.isOpen === true ? '#e8f5e9' : status.isOpen === false ? '#fdecea' : '#f3f3f3';
  return (
    <View style={[styles.openPill, { backgroundColor: bg }]}>
      <View style={[styles.openDot, { backgroundColor: color }]} />
      <Text style={[styles.openText, { color }]} numberOfLines={1}>
        {status.label}
      </Text>
    </View>
  );
}

function FilterChip({ label, emoji, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && { opacity: 0.8 }]}
    >
      {!!emoji && <Text style={styles.chipEmoji}>{emoji}</Text>}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function RestaurantCard({ r, distMeters, isVisited, onPress, now }) {
  const status = restaurantOpenStatus(r, now);
  const badge = verificationBadge(r);
  const cuisine = cuisineInfo(r.cuisine);
  const tier = r.priceTier ? PRICE_TIER_COLORS[r.priceTier] : null;
  const subtitle = [cuisine.label, r.area].filter(Boolean).join(' · ');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, isVisited && styles.cardVisited, pressed && styles.cardPressed]}
    >
      <View>
        <AuthenticRestaurantImage uri={r.image} cuisine={r.cuisine} style={styles.cardThumb} restaurantId={r.id} />
        {isVisited && (
          <View style={styles.visitedDot}>
            <Text style={styles.visitedDotText}>✓</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardName} numberOfLines={1}>
            {r.name}
          </Text>
          {tier && (
            <View style={[styles.tierPill, { backgroundColor: tier.bg }]}>
              <Text style={[styles.tierText, { color: tier.text }]}>{PRICE_TIER_LABELS[r.priceTier]}</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardSub} numberOfLines={1}>
          {cuisine.emoji} {subtitle}
        </Text>

        <View style={styles.metaRow}>
          <OpenPill status={status} />
          {distMeters !== null && <Text style={styles.distText}>{formatDistance(distMeters)}</Text>}
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.fg }]}>{badge.label}</Text>
          </View>
          <StarRating rating={r.rating} count={r.userRatingCount} source={r.ratingSource} />
        </View>

        {r.mustTry?.dish ? (
          <Text style={styles.mustTry} numberOfLines={1}>
            Known for: {r.mustTry.dish}
          </Text>
        ) : null}
      </View>

      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.neutral[400]} strokeWidth={2.5} strokeLinecap="round">
        <Path d="M9 18l6-6-6-6" />
      </Svg>
    </Pressable>
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
    routeEateries,
    destination,
    isFetchingOsm,
    fetchNearbyLive,
    liveFetchStatus,
    onlyOpenNow,
    setOnlyOpenNow,
    allRestaurants,
    currentCity,
    openCitySwitcher,
  } = useTrip();

  const mealCtx = getMealContext();
  const now = new Date();

  const counts = useMemo(() => {
    const c = { verified: 0, corrected: 0, unverified: 0, live: 0, hoursOk: 0 };
    for (const r of allRestaurants || []) {
      if (restaurantOpenStatus(r).known) c.hoursOk += 1;
      const s = r.verification?.status;
      if (s === 'verified') c.verified += 1;
      else if (s === 'location_corrected') c.corrected += 1;
      else if (s && s.startsWith('live_')) c.live += 1;
      else c.unverified += 1;
    }
    return c;
  }, [allRestaurants]);

  const distanceTo = (r) =>
    userLocation ? getDistanceBetween(userLocation.latitude, userLocation.longitude, r.latitude, r.longitude) : null;

  // Open now, nearest first (the list is already sorted by distance). Places already
  // shown in "Near your route" are skipped so the two strips don't repeat each other.
  const openNearby = useMemo(() => {
    const shownOnRoute = new Set(dietFilter !== 'route' ? (routeEateries || []).slice(0, 10).map((r) => r.id) : []);
    return filteredRestaurants
      .filter((r) => !shownOnRoute.has(r.id) && restaurantOpenStatus(r).isOpen === true)
      .slice(0, 6);
  }, [filteredRestaurants, routeEateries, dietFilter]);

  const setDiet = (id) => {
    log.info(FEATURES.FOOD, 'filter.diet', { id });
    setDietFilter(dietFilter === id ? 'all' : id);
    setCuisineFilter('all');
  };
  const setCuisine = (id) => {
    log.info(FEATURES.FOOD, 'filter.cuisine', { id });
    setCuisineFilter(cuisineFilter === id ? 'all' : id);
    setDietFilter('all');
  };
  const refreshLive = () => {
    log.info(FEATURES.FOOD, 'live_fetch.manual');
    fetchNearbyLive(userLocation?.latitude, userLocation?.longitude, userLocation?.name, 'auto', currentCity?.id);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.container, contentPadding]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>{(currentCity?.name || 'Bengaluru').toUpperCase()} · FOOD GUIDE</Text>
          <Text style={styles.heading}>
            {mealCtx.emoji} {mealCtx.label}
          </Text>
          <Text style={styles.subHeading}>{mealCtx.sub}</Text>
        </View>
        <Pressable onPress={openCitySwitcher} style={({ pressed }) => [styles.cityPill, pressed && { opacity: 0.8 }]}>
          <Text style={styles.cityPillText}>📍 {currentCity?.shortName || 'BLR'} ▾</Text>
        </Pressable>
      </View>

      {/* Data status */}
      <View style={styles.dataCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dataTitle}>{(allRestaurants || []).length} places</Text>
          <Text style={styles.dataLine}>
            ✓ {counts.verified + counts.corrected} location-checked · {counts.unverified} unverified
          </Text>
          <Text style={styles.dataLine}>
            🕒 Verified hours for {counts.hoursOk} of {(allRestaurants || []).length}
          </Text>
          <Text style={styles.dataLine}>
            {isFetchingOsm
              ? 'Searching live places nearby…'
              : liveFetchStatus?.state === 'ok'
                ? `🌐 ${liveFetchStatus.count} live from ${liveFetchStatus.source}`
                : liveFetchStatus?.state === 'failed'
                  ? '⚠️ Live search failed — showing saved places'
                  : 'Live search not run yet'}
          </Text>
        </View>
        <Pressable
          onPress={refreshLive}
          disabled={isFetchingOsm}
          style={({ pressed }) => [styles.refreshBtn, pressed && { opacity: 0.8 }, isFetchingOsm && { opacity: 0.6 }]}
        >
          {isFetchingOsm ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.refreshText}>↻ Live</Text>}
        </Pressable>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipStrip}>
        <FilterChip
          label="Open now"
          emoji="🟢"
          active={onlyOpenNow}
          onPress={() => {
            log.info(FEATURES.FOOD, 'filter.open_now', { on: !onlyOpenNow });
            setOnlyOpenNow(!onlyOpenNow);
          }}
        />
        {routeEateries && routeEateries.length > 0 && (
          <FilterChip label={`Along route (${routeEateries.length})`} emoji="🚇" active={dietFilter === 'route'} onPress={() => setDiet('route')} />
        )}
        <FilterChip
          label="All"
          active={dietFilter === 'all' && cuisineFilter === 'all'}
          onPress={() => {
            setDietFilter('all');
            setCuisineFilter('all');
          }}
        />
        <FilterChip label="Pure veg" emoji="🌿" active={dietFilter === 'veg'} onPress={() => setDiet('veg')} />
        <FilterChip label="Non-veg" emoji="🍗" active={dietFilter === 'nonveg'} onPress={() => setDiet('nonveg')} />
        {CUISINE_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
          <FilterChip key={cat.id} label={cat.label} emoji={cat.emoji} active={cuisineFilter === cat.id} onPress={() => setCuisine(cat.id)} />
        ))}
      </ScrollView>

      {/* Along route */}
      {routeEateries && routeEateries.length > 0 && dietFilter !== 'route' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚇 Near your route</Text>
          <Text style={styles.sectionSub}>Close to stops between you and {destination?.name?.split(',')[0] || 'your destination'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {routeEateries.slice(0, 10).map((r) => (
              <Pressable
                key={`route_${r.id}`}
                onPress={() => openRestaurant(r.id)}
                style={({ pressed }) => [styles.miniCard, pressed && styles.cardPressed]}
              >
                <AuthenticRestaurantImage uri={r.image} cuisine={r.cuisine} style={styles.miniImage} restaurantId={r.id} />
                <Text style={styles.miniName} numberOfLines={1}>
                  {r.name}
                </Text>
                <Text style={styles.miniSub} numberOfLines={1}>
                  {r.routeDistanceMeters} m from {r.nearStationName}
                </Text>
                <OpenPill status={restaurantOpenStatus(r, now)} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Open now near you */}
      {!onlyOpenNow && openNearby.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Open now, nearest first</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {openNearby.map((r) => {
              const d = distanceTo(r);
              return (
                <Pressable
                  key={`open_${r.id}`}
                  onPress={() => openRestaurant(r.id)}
                  style={({ pressed }) => [styles.miniCard, pressed && styles.cardPressed]}
                >
                  <AuthenticRestaurantImage uri={r.image} cuisine={r.cuisine} style={styles.miniImage} restaurantId={r.id} />
                  <Text style={styles.miniName} numberOfLines={1}>
                    {r.name}
                  </Text>
                  <Text style={styles.miniSub} numberOfLines={1}>
                    {cuisineInfo(r.cuisine).label}
                    {d !== null ? ` · ${formatDistance(d)}` : ''}
                  </Text>
                  <OpenPill status={restaurantOpenStatus(r, now)} />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Price tip */}
      <View style={styles.tipBanner}>
        <Text style={styles.tipLabel}>💡 LOCAL PRICE GUIDE · {currentCity?.shortName || 'BLR'}</Text>
        <Text style={styles.tipText}>
          {currentCity?.id === 'delhi'
            ? 'Chole bhature or parathas typically ₹60–₹90; street dahi bhalle ₹50–₹70. Inner galis of Chandni Chowk are cheaper than the main road.'
            : currentCity?.id === 'mumbai'
              ? 'Vada pav typically ₹20–₹35, cutting chai ₹12–₹20, pav bhaji ₹90–₹150. Commuter stalls near stations are cheaper than tourist strips.'
              : 'Darshini breakfasts typically ₹30–₹90; filter coffee ₹15–₹40. Many old tiffin rooms are cash-only and close by noon.'}
        </Text>
        <Text style={styles.tipFoot}>Typical ranges from the curated guide — not live menu prices.</Text>
      </View>

      {/* List */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>
          {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'place' : 'places'}
          {onlyOpenNow ? ' open now' : ''}
        </Text>
        {userLocation && <Text style={styles.sortedBy}>Nearest first</Text>}
      </View>

      <View style={styles.list}>
        {filteredRestaurants.map((r) => (
          <RestaurantCard
            key={r.id}
            r={r}
            now={now}
            distMeters={distanceTo(r)}
            isVisited={visitedRestaurants.includes(r.id)}
            onPress={() => openRestaurant(r.id)}
          />
        ))}
      </View>

      {filteredRestaurants.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>No matches</Text>
          <Text style={styles.emptyText}>
            {onlyOpenNow ? 'Nothing with known hours is open right now. Turn off "Open now".' : 'Try a different cuisine or diet filter.'}
          </Text>
        </View>
      )}

      <Text style={styles.attribution}>
        Place data © OpenStreetMap contributors (ODbL). Photos are representative, not of the actual restaurant.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 90,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  kicker: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1.3,
    color: colors.accentRamp[700],
  },
  heading: {
    fontSize: 26,
    fontFamily: fontFamily.heading,
    color: colors.neutral[900],
    marginTop: 3,
    lineHeight: 34,
  },
  subHeading: {
    fontSize: 13,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
  },
  cityPill: {
    backgroundColor: colors.accentRamp[100],
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  cityPillText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyBold,
    color: colors.accentRamp[800],
  },
  dataCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: 14,
    marginTop: 14,
    ...shadow.sm,
  },
  dataTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bodyExtraBold,
    color: colors.neutral[900],
  },
  dataLine: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
  },
  refreshBtn: {
    backgroundColor: colors.accentRamp[600],
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 72,
    alignItems: 'center',
  },
  refreshText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fontFamily.bodyBold,
  },
  chipStrip: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    paddingVertical: 8,
    paddingHorizontal: 13,
  },
  chipActive: {
    backgroundColor: colors.accentRamp[600],
    borderColor: colors.accentRamp[600],
  },
  chipEmoji: {
    fontSize: 12,
  },
  chipText: {
    fontSize: 12.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  chipTextActive: {
    color: '#fff',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: fontFamily.bodyExtraBold,
    color: colors.neutral[900],
  },
  sectionSub: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 2,
  },
  hScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    paddingRight: 6,
  },
  miniCard: {
    width: 156,
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: 10,
    gap: 4,
    ...shadow.sm,
  },
  miniImage: {
    width: '100%',
    height: 86,
    borderRadius: 10,
    backgroundColor: colors.neutral[100],
    marginBottom: 4,
  },
  miniName: {
    fontSize: 13.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  miniSub: {
    fontSize: 11.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
  },
  tipBanner: {
    backgroundColor: colors.accentRamp[700],
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 18,
  },
  tipLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
    letterSpacing: 1,
    color: colors.accentRamp[200],
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    fontFamily: fontFamily.bodyMedium,
    color: '#fff',
    lineHeight: 20,
  },
  tipFoot: {
    fontSize: 11,
    fontFamily: fontFamily.body,
    color: colors.accentRamp[200],
    marginTop: 6,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sortedBy: {
    fontSize: 12,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
  },
  list: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: 12,
    ...shadow.sm,
  },
  cardVisited: {
    borderWidth: 1.5,
    borderColor: colors.accentRamp[300],
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  cardThumb: {
    width: 78,
    height: 78,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
  },
  visitedDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accentRamp[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitedDotText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardName: {
    flex: 1,
    fontSize: 15.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[900],
  },
  tierPill: {
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tierText: {
    fontSize: 11,
    fontFamily: fontFamily.bodyBold,
  },
  cardSub: {
    fontSize: 12.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  openPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  openText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    flexShrink: 1,
  },
  distText: {
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[600],
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bodyBold,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[700],
  },
  mustTry: {
    fontSize: 12,
    fontFamily: fontFamily.bodyMedium,
    color: colors.neutral[700],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bodyBold,
    color: colors.neutral[800],
    marginTop: 8,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: fontFamily.body,
    color: colors.neutral[600],
    marginTop: 4,
    textAlign: 'center',
  },
  attribution: {
    fontSize: 10.5,
    fontFamily: fontFamily.body,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 18,
  },
});
