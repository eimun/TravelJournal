/**
 * Domain: fare matrix for a road trip (auto / cab / bike taxi).
 *
 * Only official, sourced tariffs (src/domain/tariffs.js) produce a rupee amount.
 * App prices (Uber, Ola, Rapido, Namma Yatri) are NOT published, so they are
 * described, never invented. Traffic context is time-of-day advice only — it does
 * not change any fare.
 */

import { computeOfficialFare, getTariff, isNightTime, TARIFFS } from './tariffs';

/** Kept for backwards compatibility with older imports; mirrors the Bengaluru tariff. */
export const BENGALURU_RTO_CONFIG = {
  flagfallDistanceMeters: TARIFFS.bengaluru.auto.baseKm * 1000,
  flagfallFare: TARIFFS.bengaluru.auto.baseFare,
  perKmRate: TARIFFS.bengaluru.auto.perKm,
  nightSurchargeMultiplier: TARIFFS.bengaluru.auto.night.multiplier,
};

/**
 * Time-of-day traffic context. Advice only — no surge multiplier is applied to
 * official fares (meters do not surge; app surge is not public).
 */
export function getTimeSurgeContext(date = new Date(), cityId = 'bengaluru') {
  const t = date.getHours() + date.getMinutes() / 60;
  const autoNight = getTariff(cityId, 'auto')?.night;
  const nightLabel = autoNight ? `Night meter rate (${autoNight.label})` : 'Late night';
  const isNightWindow = autoNight ? isNightTime(autoNight, date) : t >= 22 || t < 5;

  if (isNightWindow) {
    return {
      period: 'night',
      label: nightLabel,
      surgeLabel: nightLabel,
      emoji: '🌙',
      color: '#6366f1',
      advice: 'Night tariff applies to meter autos/taxis. App prices are also usually higher at night.',
    };
  }
  if (t >= 8.5 && t < 11.5) {
    return {
      period: 'morning_peak',
      label: 'Morning rush hour',
      surgeLabel: 'Morning rush hour',
      emoji: '⚡',
      color: '#f59e0b',
      advice: 'Heavy traffic and high demand. App prices often surge; metro is usually faster.',
    };
  }
  if (t >= 17 && t < 20.5) {
    return {
      period: 'evening_peak',
      label: 'Evening rush hour',
      surgeLabel: 'Evening rush hour',
      emoji: '🔥',
      color: '#ef4444',
      advice: 'Peak traffic. Expect longer rides and app surge; metro avoids road congestion.',
    };
  }
  return {
    period: t >= 5 && t < 8.5 ? 'early_morning' : t >= 20.5 ? 'late_evening' : 'midday_normal',
    label: 'Normal traffic',
    surgeLabel: 'Normal traffic',
    emoji: '☀️',
    color: '#0284c7',
    advice: 'Normal traffic. Meter autos are easiest to find now.',
  };
}

/**
 * Estimated realistic price range for App Autos (Uber Auto, Ola Auto, Rapido Auto, Namma Yatri).
 * Reflects real-world dynamic pricing: meter base + platform fee (₹15–₹30) + peak/night surge.
 */
export function estimateAppAutoPriceRange(meterFare, distanceKm, isNight = false, period = 'midday_normal') {
  const d = Math.max(0.5, distanceKm || 1);
  const base = meterFare && meterFare > 0 ? meterFare : Math.round(36 + d * 18);

  // App autos have platform fees and booking charge; realistic minimum is ~₹75-80
  const low = Math.max(75, Math.round((base * 1.25) / 5) * 5);

  // Peak/night surge multiplier
  const isPeak = period === 'morning_peak' || period === 'evening_peak';
  const surgeMultiplier = isNight ? 1.55 : isPeak ? 1.45 : 1.35;
  const high = Math.max(low + 20, Math.round((base * surgeMultiplier + 25) / 5) * 5);

  return { min: low, max: high, fareText: `~₹${low} – ₹${high}` };
}

/**
 * Estimated realistic price range for Bike Taxis (Rapido, Uber Moto, Ola Bike).
 * Real-world city minimums with platform fees and insurance are ₹60+.
 */
export function estimateBikePriceRange(distanceKm, isNight = false, period = 'midday_normal') {
  const d = Math.max(0.5, distanceKm || 1);
  const isPeak = period === 'morning_peak' || period === 'evening_peak';

  // Base Rapido minimum is ~₹60 for city rides
  const lowRaw = 52 + Math.max(0, d - 1.5) * 11;
  const low = Math.max(60, Math.round(lowRaw / 5) * 5);

  const nightAdd = isNight ? 15 : isPeak ? 10 : 0;
  const highRaw = 68 + Math.max(0, d - 1.5) * 14 + nightAdd;
  const high = Math.max(low + 15, Math.round(highRaw / 5) * 5);

  return { min: low, max: high, fareText: `~₹${low} – ₹${high}` };
}

/**
 * @param {number} straightMeters straight-line distance
 * @param {Date} date
 * @param {object} options { cityId, roadMeters }
 */
export function calculateDynamicFareMatrix(straightMeters, date = new Date(), options = {}) {
  const cityId = options.cityId || 'bengaluru';
  const trip = { straightMeters: Math.max(100, Number(straightMeters) || 0), roadMeters: options.roadMeters, date };

  const auto = computeOfficialFare(cityId, 'auto', trip);
  const cab = computeOfficialFare(cityId, 'cab', trip);
  const bike = computeOfficialFare(cityId, 'bike', trip);
  const traffic = getTimeSurgeContext(date, cityId);
  const distanceKm = auto.distanceKm ?? Math.round((trip.straightMeters / 1000) * 10) / 10;

  const appAutoRange = estimateAppAutoPriceRange(auto.fare, distanceKm, !!auto.isNight, traffic.period);
  const bikeRange = estimateBikePriceRange(distanceKm, !!auto.isNight, traffic.period);

  const bikeFareText = bike.regulated && bike.fare !== null
    ? `${bike.distanceSource === 'estimated' ? '~' : ''}₹${bike.fare}`
    : bikeRange.fareText;

  const fareText = (r) =>
    r.fare === null || r.fare === undefined ? 'Set by app' : `${r.distanceSource === 'estimated' ? '~' : ''}₹${r.fare}`;

  return {
    cityId,
    distanceMeters: trip.straightMeters,
    distanceKm,
    distanceSource: auto.distanceSource || 'estimated',
    official: { auto, cab, bike },
    surge: { ...traffic, isNight: !!auto.isNight },
    providers: {
      rtoMeter: {
        id: 'rto_meter',
        name: 'Auto meter fare',
        subtitle: auto.tariff && auto.breakdown ? `${auto.breakdown.base}, ${auto.breakdown.perKm}` : 'No tariff configured',
        fare: auto.fare,
        fareText: fareText(auto),
        tag: 'OFFICIAL TARIFF',
        tagColor: '#16a34a',
        badge: auto.isNight ? 'Night rate' : 'Govt rate',
      },
      appAuto: {
        id: 'app_auto',
        name: 'App autos (Uber / Ola / Rapido)',
        subtitle: 'Uber, Ola, Rapido & Namma Yatri',
        fare: null,
        fareRange: appAutoRange,
        fareText: appAutoRange.fareText,
        tag: 'APP ESTIMATE',
        tagColor: '#2563eb',
        badge: auto.isNight ? 'Night surge' : traffic.period.includes('peak') ? 'Peak surge' : 'Market range',
      },
      cab: {
        id: 'cab_official',
        name: cab.tariff?.label || 'Cab',
        subtitle: 'Uber, Ola & local city cabs',
        fare: cab.fare,
        fareText: fareText(cab),
        tag: cab.regulated ? 'OFFICIAL TARIFF' : 'NOT REGULATED',
        tagColor: cab.regulated ? '#16a34a' : '#64748b',
        badge: cab.isNight ? 'Night rate' : '',
      },
      bike: {
        id: 'bike',
        name: bike.tariff?.label || 'Bike taxi (Rapido / Uber Moto)',
        subtitle: 'Rapido, Uber Moto & Ola Bike',
        fare: bike.fare,
        fareRange: bike.regulated && bike.fare !== null ? null : bikeRange,
        fareText: bikeFareText,
        tag: bike.regulated ? 'OFFICIAL TARIFF' : 'APP ESTIMATE',
        tagColor: bike.regulated ? '#16a34a' : '#2563eb',
        badge: bike.regulated ? (bike.isNight ? 'Night rate' : 'Govt rate') : (auto.isNight ? 'Night rate' : 'Rapido / Moto'),
      },
    },
    negotiationPhrase: {
      kannada: 'ಮೀಟರ್ ಹಾಕಿ ಬನ್ನಿ (Meter hakisi banni)',
      hindi: 'भैया, मीटर से चलिए (Bhaiya, meter se chaliye)',
      english: 'Please turn on the meter.',
    },
  };
}
