/**
 * Domain: Distance & Walking Time Calculation
 * PRD 5.3: Haversine distance in meters, walk time at 4.5 km/h.
 */

const EARTH_RADIUS_M = 6371000;
const WALK_SPEED_M_PER_MIN = (4.5 * 1000) / 60; // 75 meters per minute

export function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function haversine(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return 0;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_M * c);
}

export function walkMinutes(metres) {
  if (!metres || metres <= 0) return 0;
  return Math.max(1, Math.round(metres / WALK_SPEED_M_PER_MIN));
}
