/**
 * Service: GPS check-ins for trail stops and heritage eateries (F-1/F-2).
 * Bridges locationService → domain/geofence → passportRepo. Purely local:
 * a check-in never needs the network, only a location fix.
 */

import {
  evaluateCheckIns,
  addVisitedStop,
  distanceMeters,
  radiusForStop,
} from '../../src/domain/geofence';
import { hasStampForSource, saveStamp } from '../../src/repositories/passportRepo';

const STAMP_SOURCE = { TRAIL_STOP: 'trail_stop', HERITAGE_EATERY: 'heritage_eatery' };

/**
 * Given the live position and a trail, return the stops now in range.
 */
export function stopsInRange(trail, position) {
  if (!trail?.stops || !position) return [];
  const flags = evaluateCheckIns(trail.stops, position);
  return trail.stops.filter((_, i) => flags[i]);
}

/**
 * Merge in-range stops into a visited id list.
 */
export function mergeVisited(visitedIds, trail, position) {
  const inRange = stopsInRange(trail, position).map((s) => s.id);
  let next = Array.isArray(visitedIds) ? visitedIds : [];
  for (const id of inRange) next = addVisitedStop(next, id);
  return next;
}

/**
 * Distance from position to a single stop, for "x m away" UI copy.
 * Returns null when either end is missing.
 */
export function metersToStop(stop, position) {
  if (!stop || !position) return null;
  return distanceMeters(position.latitude, position.longitude, stop.latitude, stop.longitude);
}

/**
 * "You're 45 m away" helper formatted for UI.
 */
export function proximityLabel(stop, position) {
  const d = metersToStop(stop, position);
  if (d === null) return null;
  if (d <= radiusForStop(stop)) return 'You are here';
  if (d < 1000) return `${Math.round(d)} m away`;
  return `${(d / 1000).toFixed(1)} km away`;
}

/**
 * Unlock a stamp once per source. Returns true when a new stamp was created.
 */
export async function unlockStampOnce(stampInput) {
  const exists = await hasStampForSource(stampInput.sourceType, stampInput.sourceId);
  if (exists) return false;
  await saveStamp({ ...stampInput, unlockedAt: stampInput.unlockedAt || new Date().toISOString() });
  return true;
}

/**
 * Convenience wrappers for the two stamp source types.
 */
export function trailStopStampInput(trail, stop, cityId) {
  return {
    id: `stamp_trail_${stop.id}`,
    cityId,
    sourceType: STAMP_SOURCE.TRAIL_STOP,
    sourceId: stop.id,
    title: stop.name,
    unlockedLabel: `Unlocked: ${trail.title} — ${stop.name}`,
    year: null,
  };
}

export function heritageEateryStampInput(heritageEatery, cityId) {
  return {
    id: `stamp_eatery_${heritageEatery.sourceId}`,
    cityId,
    sourceType: STAMP_SOURCE.HERITAGE_EATERY,
    sourceId: heritageEatery.sourceId,
    title: heritageEatery.title,
    unlockedLabel: heritageEatery.unlockedLabel,
    year: heritageEatery.year ?? null,
  };
}

export { STAMP_SOURCE };
