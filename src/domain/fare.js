/**
 * Domain: Transit and Auto Meter Fare Estimation
 * Auto meter fares come from the official tariff table (src/domain/tariffs.js);
 * metro/bus fares use distance-band lookup.
 */

import { computeOfficialFare } from './tariffs';

/**
 * Official daytime auto meter fare for a ROAD distance (Bengaluru by default).
 */
export function meterEstimate(distanceM, { cityId = 'bengaluru' } = {}) {
  const meters = Math.max(0, Number(distanceM) || 0);
  const result = computeOfficialFare(cityId, 'auto', {
    roadMeters: meters > 0 ? meters : undefined,
    straightMeters: 0,
    date: new Date('2026-01-01T12:00:00'),
  });
  return {
    fair: result.fare,
    isShortHop: meters <= 1200,
  };
}

export function transitFare(fares = [], distanceKm = 0) {
  if (!fares || fares.length === 0) return 20;

  for (const f of fares) {
    if (distanceKm >= f.band_from_km && distanceKm <= f.band_to_km) {
      return f.amount;
    }
  }

  return fares[fares.length - 1]?.amount ?? 20;
}
