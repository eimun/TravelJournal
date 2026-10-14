/**
 * Ola Maps (Krutrim) live restaurant search — India-focused, free tier (no card).
 *
 * Key: EXPO_PUBLIC_OLA_MAPS_API_KEY in .env.local (git-ignored). Free allowance per
 * Ola's pricing page: 100K requests/month per API (Nearby Search, Place Details).
 *
 * Flow: one Nearby Search (names, addresses, place ids — no coordinates), then Advanced
 * Place Details per place for coordinates and opening hours. Ola returns "NA", 0 or -1
 * for fields it does not have (ratings, phone, website); those stay empty — nothing is
 * filled in. Duplicate Ola records of the same place are merged.
 */

import { inferCuisine, CUISINE_AUTHENTIC_IMAGES } from './osmRestaurantService';
import { nearestStationText } from './restaurantAudit';
import { describeSchedule } from '../../src/domain/openingHours';
import { FEATURES, log, loggedFetch, reportIssue } from '../../src/logging';

export const OLA_MAPS_KEY = process.env.EXPO_PUBLIC_OLA_MAPS_API_KEY || '';
const BASE = 'https://api.olamaps.io/places/v1';
const DETAILS_CONCURRENCY = 5;

const isMissing = (v) => v === undefined || v === null || v === '' || v === 'NA';

function requestId() {
  return `tb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function hhmmToMinutes(t) {
  if (isMissing(t) || !/^\d{4}$/.test(t)) return null;
  return Number(t.slice(0, 2)) * 60 + Number(t.slice(2));
}

/**
 * Ola opening_hours.periods → app schedule ({0..6: [[startMin, endMin]]}, 0 = Sunday).
 * Ola numbers days 1 = Monday … 7 = Sunday. Returns null when Ola has no real hours.
 */
export function scheduleFromOlaPeriods(periods) {
  if (!Array.isArray(periods) || periods.length === 0) return null;
  const schedule = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  let valid = 0;
  for (const p of periods) {
    const openDay = p && p.open ? Number(p.open.day) % 7 : NaN;
    const start = hhmmToMinutes(p && p.open && p.open.time);
    let end = hhmmToMinutes(p && p.close && p.close.time);
    if (!Number.isInteger(openDay) || start === null || end === null) continue;
    const closeDay = Number(p.close.day) % 7;
    if (closeDay !== openDay || end <= start) end += 1440; // runs past midnight
    schedule[openDay].push([start, end]);
    valid += 1;
  }
  if (valid === 0) return null;
  Object.values(schedule).forEach((ranges) => ranges.sort((a, b) => a[0] - b[0]));
  return schedule;
}

function normName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Merges duplicate Ola records (same name within ~80 m), keeping the richer one. */
export function dedupeOlaPlaces(list) {
  const out = [];
  for (const p of list) {
    const twin = out.find(
      (q) =>
        normName(q.name).split(' ').slice(0, 3).join(' ') ===
          normName(p.name).split(' ').slice(0, 3).join(' ') &&
        Math.abs(q.latitude - p.latitude) < 0.0008 &&
        Math.abs(q.longitude - p.longitude) < 0.0008,
    );
    if (!twin) out.push(p);
    else if (!twin.schedule && p.schedule) out[out.indexOf(twin)] = p;
  }
  return out;
}

const CITY_TERM = /^(bengaluru|bangalore|mumbai|new delhi|delhi)$/i;

/** Locality just before the city in Ola's address terms, e.g. "Ashok Nagar". */
export function localityFromTerms(terms) {
  const values = (terms || []).map((t) => t && t.value).filter(Boolean);
  const cityIdx = values.findIndex((v, i) => i > 0 && CITY_TERM.test(v));
  if (cityIdx < 2) return null; // index 0 is the place name itself
  return values[cityIdx - 1];
}

/** Ola Advanced Place Details result → app restaurant. */
export function transformOlaPlace(result, prediction, cityId) {
  const lat =
    result && result.geometry && result.geometry.location ? result.geometry.location.lat : null;
  const lng =
    result && result.geometry && result.geometry.location ? result.geometry.location.lng : null;
  const name =
    (result && result.name) ||
    (prediction && prediction.structured_formatting && prediction.structured_formatting.main_text);
  const types = (result && result.types) || (prediction && prediction.types) || [];
  const inferred = inferCuisine({
    name,
    amenity: types.includes('cafe') && !types.includes('restaurant') ? 'cafe' : 'restaurant',
    cuisine: types.includes('night_club') || types.includes('bar') ? 'pub' : '',
  });
  // "Hard Rock Cafe" etc.: a name containing "cafe" is not a cafe when Ola says restaurant.
  const cuisine = inferred === 'cafe' && !types.includes('cafe') ? 'other' : inferred;
  const barLike =
    types.includes('night_club') || types.includes('bar') || /brew|pub\b|bar\b/i.test(name || '');
  const schedule = scheduleFromOlaPeriods(
    result && result.opening_hours && result.opening_hours.periods,
  );
  const address = !isMissing(result && result.formatted_address)
    ? result.formatted_address
    : prediction && prediction.description;
  const area = localityFromTerms(prediction && prediction.terms);
  const rating = result && Number(result.rating) > 0 ? Number(result.rating) : null;
  const ratingCount =
    result && Number(result.user_ratings_total) > 0 ? Number(result.user_ratings_total) : null;
  const placeId = (result && result.place_id) || (prediction && prediction.place_id);
  const finalCuisine = barLike ? 'bar' : cuisine;

  return {
    id: `ola_${String(placeId).replace(/[^A-Za-z0-9]/g, '')}`,
    name,
    area,
    address,
    cuisine: finalCuisine,
    cuisineRaw: types.join(', '),
    rating,
    userRatingCount: rating ? ratingCount : null,
    ratingSource: rating ? 'Ola Maps' : null,
    priceTier: null,
    latitude: lat,
    longitude: lng,
    schedule,
    hoursVerified: Boolean(schedule),
    hoursSource: schedule ? 'Ola Maps' : null,
    hoursText: describeSchedule(schedule),
    tags: [],
    dietSource: 'Not provided by Ola Maps',
    nearestMetro: lat !== null ? nearestStationText(lat, lng, cityId) : null,
    image: CUISINE_AUTHENTIC_IMAGES[finalCuisine] || CUISINE_AUTHENTIC_IMAGES.other,
    imageIsRepresentative: true,
    mustTry: null,
    topDishes: [],
    insiderNote: null,
    established: null,
    phone:
      result && !isMissing(result.formatted_phone_number) ? result.formatted_phone_number : null,
    website: result && !isMissing(result.website) ? result.website : null,
    source: 'ola',
    isLive: true,
    isOlaLive: true,
    distanceFromSearchM: prediction ? prediction.distance_meters : null,
    verification: {
      status: 'live_ola',
      source: 'Ola Maps (live)',
      checkedAt: new Date().toISOString().slice(0, 10),
      osmUrl: null,
    },
  };
}

async function olaGet(path, params, name) {
  const qs = new URLSearchParams({ ...params, api_key: OLA_MAPS_KEY }).toString();
  const res = await loggedFetch(`${BASE}/${path}?${qs}`, {
    name,
    feature: FEATURES.FOOD,
    timeoutMs: 10000,
    headers: { 'X-Request-Id': requestId(), Accept: 'application/json' },
  });
  if (!res.ok || !res.json) {
    if (res.status === 401 || res.status === 403 || res.status === 429) {
      reportIssue('FOOD_PROVIDER_ERROR', {
        key: `ola:${res.status}`,
        message:
          res.status === 429
            ? 'Ola Maps rate/free limit reached'
            : 'Ola Maps rejected the API key (check EXPO_PUBLIC_OLA_MAPS_API_KEY)',
        data: { status: res.status },
      });
    }
    return null;
  }
  if (res.json.status && res.json.status !== 'ok') {
    reportIssue('FOOD_PROVIDER_ERROR', {
      key: `ola:${res.json.status}`,
      message: res.json.error_message || res.json.status,
    });
    return null;
  }
  return res.json;
}

/**
 * @returns {Promise<Array>} restaurants (empty when no key, no results or Ola failed)
 */
export async function fetchOlaNearbyRestaurants({
  latitude,
  longitude,
  radiusMeters = 2000,
  limit = 25,
  cityId,
}) {
  if (!OLA_MAPS_KEY) {
    reportIssue('FOOD_PROVIDER_NOT_CONFIGURED', { key: 'ola' });
    return [];
  }
  if (!latitude || !longitude) return [];

  const nearby = await olaGet(
    'nearbysearch',
    {
      layers: 'venue',
      types: 'restaurant,cafe',
      location: `${latitude},${longitude}`,
      radius: String(Math.round(radiusMeters)),
      limit: String(limit),
    },
    'ola.nearby',
  );
  const predictions = (nearby && nearby.predictions) || [];
  if (predictions.length === 0) return [];

  // Advanced details for coordinates + hours, a few at a time.
  const places = [];
  for (let i = 0; i < predictions.length; i += DETAILS_CONCURRENCY) {
    const batch = predictions.slice(i, i + DETAILS_CONCURRENCY);
    const details = await Promise.all(
      batch.map((p) => olaGet('details/advanced', { place_id: p.place_id }, 'ola.details')),
    );
    details.forEach((d, j) => {
      if (d && d.result) places.push(transformOlaPlace(d.result, batch[j], cityId));
    });
  }

  const usable = dedupeOlaPlaces(
    places.filter((p) => p.name && Number.isFinite(p.latitude) && Number.isFinite(p.longitude)),
  );
  log.info(FEATURES.FOOD, 'ola.results', {
    nearby: predictions.length,
    detailed: places.length,
    usable: usable.length,
    withHours: usable.filter((p) => p.schedule).length,
    withRating: usable.filter((p) => p.rating).length,
  });
  return usable;
}
