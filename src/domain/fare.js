/**
 * Domain: Transit and Auto Meter Fare Estimation
 * PRD 5.3 & 5.2: Haversine distance * rate + flagfall with minimum floor,
 * and distance band lookup for metro/bus.
 */

// Bengaluru auto-rickshaw government rates:
// Base flagfall (first 2 km): ₹30
// Per km after 2 km: ₹15
const AUTO_FLAGFALL_DISTANCE_M = 2000;
const AUTO_FLAGFALL_FARE = 30;
const AUTO_PER_KM_RATE = 15;

export function meterEstimate(distanceM) {
  if (!distanceM || distanceM <= 0) {
    return { fair: AUTO_FLAGFALL_FARE, expectedQuote: 60 };
  }

  let fair = AUTO_FLAGFALL_FARE;
  if (distanceM > AUTO_FLAGFALL_DISTANCE_M) {
    const extraKm = (distanceM - AUTO_FLAGFALL_DISTANCE_M) / 1000;
    fair += Math.round(extraKm * AUTO_PER_KM_RATE);
  }

  // Fair meter price rounded to nearest ₹5
  fair = Math.ceil(fair / 5) * 5;

  // Expected tourist quote is typically 1.5x - 2.5x the meter rate
  const expectedQuote = Math.max(100, Math.round((fair * 2.0) / 50) * 50);

  return {
    fair,
    expectedQuote,
    isShortHop: distanceM <= 1200,
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
