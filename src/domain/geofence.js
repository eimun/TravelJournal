/**
 * Domain: pure geofence math for trail-stop and landmark check-ins (F-1/F-2).
 * No React, no storage, no network — pure functions for the 80% gate.
 */

const EARTH_RADIUS_M = 6371008.8;

/**
 * Haversine distance in metres between two lat/lng pairs.
 */
export function distanceMeters(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => typeof v !== 'number' || Number.isNaN(v))) {
    return null;
  }
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Default check-in radius per stop type (metres). Large open sites get a wider net.
 */
export const DEFAULT_RADIUS_BY_TYPE = {
  market: 100,
  temple: 90,
  eatery: 60,
  park: 140,
  museum: 80,
  metro: 80,
  landmark: 90,
};

export function radiusForStop(stop) {
  const base = DEFAULT_RADIUS_BY_TYPE[stop?.type] ?? 90;
  return Math.max(40, Math.min(200, stop?.checkInRadiusM ?? base));
}

/**
 * Evaluate which stops the user is currently inside.
 * Returns per-stop booleans in the same order as `stops`.
 */
export function evaluateCheckIns(stops, position) {
  if (!Array.isArray(stops) || !position) {
    return stops?.map?.(() => false) ?? [];
  }
  const { latitude, longitude } = position;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return stops.map(() => false);
  }
  return stops.map((stop) => {
    if (typeof stop?.latitude !== 'number' || typeof stop?.longitude !== 'number') {
      return false;
    }
    const d = distanceMeters(latitude, longitude, stop.latitude, stop.longitude);
    return d !== null && d <= radiusForStop(stop);
  });
}

/**
 * Merge a newly in-range stop into the visited list (order-stable, idempotent).
 */
export function addVisitedStop(visitedIds, stopId) {
  const list = Array.isArray(visitedIds) ? visitedIds : [];
  if (list.includes(stopId)) return list;
  return [...list, stopId];
}

/**
 * Count ordered progress: number of leading stops visited from stop 1 onward.
 * A user can check in out of order; progress is the longest prefix of visited
 * stops (like trail stones lighting up).
 */
export function trailProgress(stops, visitedIds) {
  const visited = new Set(visitedIds || []);
  let count = 0;
  for (const stop of stops || []) {
    if (visited.has(stop.id)) count += 1;
    else break;
  }
  return count;
}
