import { inferCuisine, inferDietaryTags, CUISINE_AUTHENTIC_IMAGES } from './osmRestaurantService.js';
import { nearestStationText } from './restaurantAudit';
import { FEATURES, log, loggedFetch, reportIssue } from '../../src/logging';

/**
 * Optional commercial restaurant providers (Google Places, Foursquare Places).
 * Both need an API key (EXPO_PUBLIC_GOOGLE_PLACES_KEY / EXPO_PUBLIC_FOURSQUARE_API_KEY);
 * without one the app falls back to OpenStreetMap.
 *
 * Only values returned by the provider are used. Missing ratings, review counts,
 * prices or photos stay null — they are never filled with defaults.
 */

export const API_KEYS = {
  google: process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY || '',
  foursquare: process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY || '',
};

function clampTier(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(3, Math.max(1, Math.round(n)));
}

/** Google Places (legacy Nearby Search) result → app restaurant. */
export function transformGooglePlace(place, apiKey = '', cityId) {
  const lat = place.location?.latitude ?? place.geometry?.location?.lat ?? null;
  const lng = place.location?.longitude ?? place.geometry?.location?.lng ?? null;
  const name = place.displayName?.text || place.name || null;
  const cuisine = inferCuisine({ name, amenity: 'restaurant', cuisine: (place.types || []).join(' ') });

  const photoRef = place.photos?.[0]?.photo_reference;
  const image =
    photoRef && apiKey
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${apiKey}`
      : CUISINE_AUTHENTIC_IMAGES[cuisine] || CUISINE_AUTHENTIC_IMAGES.other;

  const hasRating = Number.isFinite(place.rating);
  return {
    id: `gplace_${place.place_id || place.id}`,
    name,
    area: place.vicinity || place.formatted_address?.split(',')[0] || null,
    cuisine,
    rating: hasRating ? place.rating : null,
    userRatingCount: Number.isFinite(place.user_ratings_total) ? place.user_ratings_total : null,
    ratingSource: hasRating ? 'Google' : null,
    priceTier: clampTier(place.price_level ?? place.priceLevel),
    latitude: lat,
    longitude: lng,
    schedule: null,
    isOpenFromProvider: typeof place.opening_hours?.open_now === 'boolean' ? place.opening_hours.open_now : null,
    hoursSource: typeof place.opening_hours?.open_now === 'boolean' ? 'Google (open now)' : null,
    tags: inferDietaryTags({ name }),
    dietSource: 'Not provided by Google',
    nearestMetro: lat !== null ? nearestStationText(lat, lng, cityId) : null,
    image,
    imageIsRepresentative: !photoRef,
    mustTry: null,
    topDishes: [],
    insiderNote: null,
    established: null,
    source: 'google',
    isLive: true,
    isGoogleLive: true,
    verification: {
      status: 'live_google',
      source: 'Google Places (live)',
      checkedAt: new Date().toISOString().slice(0, 10),
    },
  };
}

/** Foursquare Places API (2025-06-17 version) result → app restaurant. */
export function transformFoursquarePlace(place, cityId) {
  const lat = place.latitude ?? place.geocodes?.main?.latitude ?? null;
  const lng = place.longitude ?? place.geocodes?.main?.longitude ?? null;
  const categoryNames = (place.categories || []).map((c) => c.name).join(' ');
  const cuisine = inferCuisine({ name: place.name, amenity: 'restaurant', cuisine: categoryNames });

  let image = CUISINE_AUTHENTIC_IMAGES[cuisine] || CUISINE_AUTHENTIC_IMAGES.other;
  const photo = place.photos && place.photos[0];
  if (photo && photo.prefix && photo.suffix) image = `${photo.prefix}800x600${photo.suffix}`;

  // Foursquare ratings are 0–10; convert to a 5-star scale only when present.
  const hasRating = Number.isFinite(place.rating);
  const id = place.fsq_place_id || place.fsq_id;
  return {
    id: `fsq_${id}`,
    name: place.name || null,
    area: place.location?.locality || place.location?.neighborhood?.[0] || place.location?.formatted_address?.split(',')[0] || null,
    cuisine,
    cuisineRaw: categoryNames || null,
    rating: hasRating ? Math.round((place.rating / 2) * 10) / 10 : null,
    userRatingCount: Number.isFinite(place.stats?.total_ratings) ? place.stats.total_ratings : null,
    ratingSource: hasRating ? 'Foursquare' : null,
    priceTier: clampTier(place.price),
    latitude: lat,
    longitude: lng,
    schedule: null,
    tags: inferDietaryTags({ name: place.name }),
    dietSource: 'Not provided by Foursquare',
    nearestMetro: lat !== null ? nearestStationText(lat, lng, cityId) : null,
    image,
    imageIsRepresentative: !photo,
    mustTry: null,
    topDishes: [],
    insiderNote: null,
    established: null,
    address: place.location?.formatted_address || place.location?.address || null,
    source: 'foursquare',
    isLive: true,
    isFsqLive: true,
    verification: {
      status: 'live_foursquare',
      source: 'Foursquare Places (live)',
      checkedAt: new Date().toISOString().slice(0, 10),
    },
  };
}

/** Google Places legacy Nearby Search. Logs Google's `status` + `error_message` on failure. */
export async function fetchGooglePlacesRestaurants({ latitude, longitude, radiusMeters = 2500, apiKey = API_KEYS.google, cityId }) {
  if (!apiKey) {
    reportIssue('FOOD_PROVIDER_NOT_CONFIGURED', { key: 'google' });
    return [];
  }
  if (!latitude || !longitude) return [];

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusMeters}&type=restaurant&key=${apiKey}`;
  const res = await loggedFetch(url, { name: 'google.nearby', feature: FEATURES.FOOD, timeoutMs: 8000 });
  if (!res.ok || !res.json) return [];

  const { status, error_message: errorMessage, results } = res.json;
  if (status !== 'OK' && status !== 'ZERO_RESULTS') {
    // e.g. REQUEST_DENIED (key invalid / legacy API not enabled), OVER_QUERY_LIMIT.
    reportIssue('FOOD_PROVIDER_ERROR', { key: `google:${status}`, message: errorMessage || status, data: { status } });
    return [];
  }
  const list = (results || []).slice(0, 20).map((p) => transformGooglePlace(p, apiKey, cityId));
  log.info(FEATURES.FOOD, 'google.results', { status, count: list.length });
  return list;
}

/** Foursquare Places search (places-api.foursquare.com, version 2025-06-17). */
export async function fetchFoursquarePlacesRestaurants({
  latitude,
  longitude,
  radiusMeters = 3000,
  query = 'restaurant',
  limit = 20,
  apiKey = API_KEYS.foursquare,
  cityId,
}) {
  if (!apiKey) {
    reportIssue('FOOD_PROVIDER_NOT_CONFIGURED', { key: 'foursquare' });
    return [];
  }
  if (!latitude || !longitude) return [];

  const fields = 'fsq_place_id,name,latitude,longitude,location,categories,rating,stats,price,photos';
  const url = `https://places-api.foursquare.com/places/search?ll=${latitude},${longitude}&radius=${radiusMeters}&query=${encodeURIComponent(query)}&limit=${limit}&fields=${fields}`;
  const authHeader = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;

  const res = await loggedFetch(url, {
    name: 'foursquare.search',
    feature: FEATURES.FOOD,
    timeoutMs: 8000,
    headers: { Accept: 'application/json', Authorization: authHeader, 'X-Places-Api-Version': '2025-06-17' },
  });
  if (!res.ok) {
    if (res.status >= 400 && res.status < 500) {
      reportIssue('FOOD_PROVIDER_ERROR', {
        key: `foursquare:${res.status}`,
        message: (res.json && (res.json.message || res.json.error)) || `HTTP ${res.status}`,
      });
    }
    return [];
  }
  const list = Array.isArray(res.json?.results) ? res.json.results.map((p) => transformFoursquarePlace(p, cityId)) : [];
  log.info(FEATURES.FOOD, 'foursquare.results', { count: list.length });
  return list;
}
