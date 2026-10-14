/**
 * Restaurant data quality layer.
 *
 * - withVerification(): merges app/data/restaurantVerification.json (produced by
 *   `npm run verify:restaurants`) into a curated record: verification status,
 *   corrected coordinates, opening hours and diet tags from OpenStreetMap.
 * - auditRestaurants(): runtime checks that report MAJOR / MINOR issues to the logs.
 *
 * Rule: nothing is shown as fact unless it has a source. Fields without a source are
 * labelled (e.g. "curated, unverified") or hidden (ratings).
 */

import verification from '../data/restaurantVerification.json';
import { CORRECTIONS_CHECKED_ON, RESTAURANT_CORRECTIONS } from '../data/restaurantCorrections';
import { findNearestMetroStation, getLineDisplayName } from '../data/transitData';
import { CITY_BOUNDS } from './searchService';
import {
  describeSchedule,
  parseOsmOpeningHours,
  scheduleFromOpenClose,
} from '../../src/domain/openingHours';
import { FEATURES, log, reportIssue } from '../../src/logging';

const VERIFICATION = (verification && verification.restaurants) || {};
export const VERIFICATION_META = {
  generatedAt: verification?.generatedAt || null,
  method: verification?.method || null,
  attribution: verification?.attribution || null,
  summary: verification?.summary || {},
};

/**
 * Combines curated diet tags with explicit OSM diet:* tags.
 * OSM only adds/overrides when it is explicit; conflicts are returned for logging.
 */
function mergeDiet(curated = [], tags = {}) {
  const out = new Set(curated);
  let usedOsm = false;
  let conflict = null;
  const pureVeg =
    tags['diet:vegetarian'] === 'only' || /(^|;)vegetarian($|;)/.test(tags.cuisine || '');
  if (pureVeg) {
    usedOsm = true;
    if (out.has('nonveg')) conflict = 'curated non-veg, OSM pure vegetarian';
    out.delete('nonveg');
    out.add('veg');
  }
  if (tags['diet:halal'] === 'yes' || tags['diet:halal'] === 'only') {
    usedOsm = true;
    out.add('halal');
  }
  if (tags['diet:jain'] === 'yes' || tags['diet:jain'] === 'only') {
    usedOsm = true;
    out.add('jain');
  }
  return { tags: [...out], usedOsm, conflict };
}

export function nearestStationText(lat, lon, cityId) {
  const st = findNearestMetroStation(lat, lon, cityId);
  if (!st) return null;
  const walkMin = Math.max(1, Math.round(st.distanceMeters / 80));
  const dist =
    st.distanceMeters >= 1000
      ? `${(st.distanceMeters / 1000).toFixed(1)} km`
      : `${st.distanceMeters} m`;
  return st.distanceMeters <= 1500
    ? `${st.name} (${getLineDisplayName(st.line)}) · ${dist}, ~${walkMin} min walk`
    : `${st.name} (${getLineDisplayName(st.line)}) · ${dist} — take an auto`;
}

/**
 * Merges verification + researched corrections into a curated restaurant record.
 *
 * Hours priority: researched correction > OpenStreetMap > curated guess. Only the
 * first two count as verified (hoursVerified) and may be shown as "Open/Closed";
 * a curated guess is shown as "Hours unverified".
 */
export function withVerification(r, cityId) {
  const v = VERIFICATION[r.id];
  const fix = RESTAURANT_CORRECTIONS[r.id] || null;
  const osm = v && v.osm ? v.osm : null;
  const tags = osm ? osm.tags || {} : {};

  const researchedPin = fix && Number.isFinite(fix.latitude) && Number.isFinite(fix.longitude);
  const useOsmPin = !researchedPin && v && v.status === 'location_corrected' && osm;
  const latitude = researchedPin ? fix.latitude : useOsmPin ? osm.lat : r.latitude;
  const longitude = researchedPin ? fix.longitude : useOsmPin ? osm.lon : r.longitude;
  let status = v ? v.status : 'not_checked';
  if (researchedPin) status = 'location_corrected';

  let schedule = null;
  let hoursSource = null;
  let hoursVerified = false;
  const fixSchedule = fix && fix.hours ? parseOsmOpeningHours(fix.hours) : null;
  const osmSchedule = parseOsmOpeningHours(tags.opening_hours);
  if (fixSchedule) {
    schedule = fixSchedule;
    hoursSource = `Checked ${CORRECTIONS_CHECKED_ON} against public listings`;
    hoursVerified = true;
  } else if (osmSchedule) {
    schedule = osmSchedule;
    hoursSource = 'OpenStreetMap';
    hoursVerified = true;
  } else if (r.openTime && r.closeTime) {
    schedule = scheduleFromOpenClose(r.openTime, r.closeTime);
    hoursSource = 'Curated guess — not verified';
  }

  const diet = mergeDiet(r.tags || [], tags);

  return {
    ...r,
    cuisine: (fix && fix.cuisine) || r.cuisine,
    area: (fix && fix.area) || r.area,
    latitude,
    longitude,
    schedule,
    hoursSource,
    hoursVerified,
    hoursText: describeSchedule(schedule) || (tags.opening_hours ? tags.opening_hours : null),
    rawOsmHours: tags.opening_hours || null,
    dataNote: fix && fix.note ? fix.note : null,
    dataSources: fix && fix.sources ? fix.sources : [],
    removed: Boolean(fix && fix.remove),
    tags: diet.tags,
    dietSource: diet.usedOsm ? 'Curated + OpenStreetMap diet tags' : 'Curated (not verified)',
    dietConflict: diet.conflict,
    // Curated star ratings had no source → hidden. Live providers set ratingSource.
    rating: r.ratingSource ? r.rating : null,
    ratingSource: r.ratingSource || null,
    nearestMetro: nearestStationText(latitude, longitude, cityId) || r.nearestMetro,
    priceSource: 'Curated (approximate, not a live menu)',
    imageIsRepresentative: true,
    verification: {
      status,
      source: v
        ? v.via === 'nominatim'
          ? 'OpenStreetMap (Nominatim search)'
          : 'OpenStreetMap'
        : null,
      checkedAt: v ? v.checkedAt : null,
      osmUrl: osm ? osm.url : null,
      osmName: tags.name || null,
      distanceM: v ? (v.distanceM ?? null) : null,
      originalCoords:
        useOsmPin || researchedPin ? { latitude: r.latitude, longitude: r.longitude } : null,
      pinSource: researchedPin ? 'public listings' : useOsmPin ? 'OpenStreetMap' : null,
    },
  };
}

const audited = new Set();

/**
 * Logs data-quality issues once per restaurant per session.
 * MAJOR: invalid coordinates / outside city / diet conflict.
 * MINOR: curated pin corrected from OSM (already fixed in the UI).
 * MINOR: not verified, missing hours.
 */
export function auditRestaurants(list, cityId) {
  const bounds = CITY_BOUNDS[cityId];
  const counts = {
    total: list.length,
    verified: 0,
    corrected: 0,
    unverified: 0,
    live: 0,
    hoursVerified: 0,
    hoursUnverified: 0,
  };
  for (const r of list) {
    if (r.isLive || r.isOsmLive) counts.live += 1;
    const v = r.verification || {};
    if (v.status === 'verified') counts.verified += 1;
    else if (v.status === 'location_corrected') counts.corrected += 1;
    else if (!r.isLive && !r.isOsmLive) counts.unverified += 1;
    const live = r.isLive || r.isOsmLive;
    if (r.hoursVerified || (live && r.schedule)) counts.hoursVerified += 1;
    else counts.hoursUnverified += 1;

    const key = `${cityId}:${r.id}`;
    if (audited.has(key)) continue;
    audited.add(key);

    const lat = Number(r.latitude);
    const lon = Number(r.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      reportIssue('FOOD_DATA_INVALID', { key: r.id, message: `${r.name}: missing coordinates` });
      continue;
    }
    if (
      bounds &&
      (lat < bounds.minLat || lat > bounds.maxLat || lon < bounds.minLon || lon > bounds.maxLon)
    ) {
      reportIssue('FOOD_DATA_INVALID', {
        key: r.id,
        message: `${r.name}: coordinates outside ${cityId}`,
        data: { lat, lon },
      });
    }
    if (v.status === 'location_corrected') {
      reportIssue('FOOD_LOCATION_MISMATCH', {
        key: r.id,
        message:
          v.pinSource === 'public listings'
            ? `${r.name}: curated pin/area was wrong — corrected from public listings`
            : `${r.name}: curated pin was ${v.distanceM} m from OSM "${v.osmName}" — OSM pin used`,
        data: { osm: v.osmUrl, original: v.originalCoords },
      });
    } else if (!r.isLive && !r.isOsmLive && v.status !== 'verified') {
      reportIssue('FOOD_NOT_VERIFIED', { key: r.id, message: `${r.name}: no OpenStreetMap match` });
    }
    if (r.dietConflict) {
      reportIssue('FOOD_DATA_INVALID', {
        key: `${r.id}:diet`,
        message: `${r.name}: ${r.dietConflict}`,
      });
    }
    if (!live && !r.hoursVerified) {
      reportIssue('FOOD_FIELD_MISSING', {
        key: `${r.id}:hours`,
        message: `${r.name}: opening hours not verified (shown as unverified)`,
      });
    }
  }
  log.info(FEATURES.FOOD, 'restaurants.audit', { cityId, ...counts });
  return counts;
}

export function __resetRestaurantAuditForTests() {
  audited.clear();
}
