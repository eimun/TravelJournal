/**
 * Fare service: the app-side entry point for every auto / cab / bike fare.
 * Wraps the pure tariff engine with runtime audits so any wrong or degraded fare
 * shows up in the diagnostics report as a MAJOR or MINOR issue.
 */

import { computeOfficialFare, daysSince, TARIFF_STALE_AFTER_DAYS } from '../../src/domain/tariffs';
import { calculateDynamicFareMatrix } from '../../src/domain/dynamicFare';
import { FEATURES, log, reportIssue } from '../../src/logging';

const auditedTariffs = new Set();

function auditTariff(cityId, vehicle, result) {
  const id = `${cityId}:${vehicle}`;
  if (result.missing) {
    reportIssue('FARE_TARIFF_MISSING', { key: id, message: `No ${vehicle} tariff for ${cityId}` });
    return;
  }
  if (auditedTariffs.has(id)) return;
  auditedTariffs.add(id);
  const age = daysSince(result.tariff.verifiedOn);
  if (age > TARIFF_STALE_AFTER_DAYS) {
    reportIssue('FARE_TARIFF_STALE', {
      key: id,
      message: `${result.tariff.label} last verified ${age} days ago (${result.tariff.verifiedOn})`,
      data: { sources: result.tariff.sources },
    });
  }
}

function auditFare(result, context) {
  if (!result.regulated || result.fare === null) return;
  const id = `${result.cityId}:${result.vehicle}`;
  if (!Number.isFinite(result.fare) || result.fare <= 0) {
    reportIssue('FARE_INVALID', {
      key: id,
      message: `Fare computed as ${result.fare}`,
      data: { ...context, result },
    });
  } else if (result.fare < result.tariff.baseFare) {
    reportIssue('FARE_BELOW_OFFICIAL_MINIMUM', {
      key: id,
      message: `₹${result.fare} < minimum ₹${result.tariff.baseFare}`,
      data: context,
    });
  }
}

// Longest plausible in-city auto/cab trip. Anything longer means origin and
// destination are in different cities (stale GPS, wrong coordinates, bad state).
const MAX_PLAUSIBLE_TRIP_M = 100000;

/**
 * @param {string} cityId
 * @param {'auto'|'cab'|'bike'} vehicle
 * @param {{roadMeters?: number, straightMeters: number, date?: Date}} trip
 * @param {string} where  short label of the calling screen/step, for the logs
 */
export function getOfficialFare(cityId, vehicle, trip, where = 'unknown') {
  const result = computeOfficialFare(cityId, vehicle, trip);
  const span = Math.max(trip.straightMeters || 0, trip.roadMeters || 0);
  if (span > MAX_PLAUSIBLE_TRIP_M) {
    reportIssue('FARE_IMPLAUSIBLE_TRIP', {
      key: `${cityId}:${where}`,
      message: `${(span / 1000).toFixed(0)} km trip priced with the ${cityId} ${vehicle} tariff`,
      data: { trip, fare: result.fare },
    });
  }
  auditTariff(cityId, vehicle, result);
  auditFare(result, { where, trip });
  if (result.distanceSource === 'estimated' && trip.straightMeters > 2500) {
    // Short hops barely change; only flag trips where the estimate could matter.
    reportIssue('FARE_ROAD_DISTANCE_ESTIMATED', {
      key: `${cityId}:${where}`,
      message: `Straight-line ${(trip.straightMeters / 1000).toFixed(1)} km × detour factor used`,
    });
  }
  log.debug(FEATURES.FARE, 'fare.computed', {
    where,
    cityId,
    vehicle,
    fare: result.fare,
    km: result.distanceKm,
    distanceSource: result.distanceSource,
    night: result.isNight || false,
  });
  return result;
}

export function getFareMatrix(
  straightMeters,
  date,
  { cityId = 'bengaluru', roadMeters, where = 'matrix' } = {},
) {
  const matrix = calculateDynamicFareMatrix(straightMeters, date, { cityId, roadMeters });
  for (const vehicle of ['auto', 'cab', 'bike']) {
    const r = matrix.official[vehicle];
    auditTariff(cityId, vehicle, r);
    auditFare(r, { where, straightMeters, roadMeters });
  }
  return matrix;
}

export function __resetFareAuditForTests() {
  auditedTariffs.clear();
}
