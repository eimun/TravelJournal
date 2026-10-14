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

  const fareText = (r) =>
    r.fare === null || r.fare === undefined ? 'Set by app' : `${r.distanceSource === 'estimated' ? '~' : ''}₹${r.fare}`;

  return {
    cityId,
    distanceMeters: trip.straightMeters,
    distanceKm: auto.distanceKm ?? Math.round((trip.straightMeters / 1000) * 10) / 10,
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
        name: 'App autos (Uber / Ola / Rapido / Namma Yatri)',
        subtitle: auto.tariff?.appNote || 'Price set by the app',
        fare: null,
        fareText: 'Set by app',
        tag: 'NOT PUBLISHED',
        tagColor: '#64748b',
        badge: 'Check app',
      },
      cab: {
        id: 'cab_official',
        name: cab.tariff?.label || 'Cab',
        subtitle: cab.tariff?.appNote || '',
        fare: cab.fare,
        fareText: fareText(cab),
        tag: cab.regulated ? 'OFFICIAL TARIFF' : 'NOT REGULATED',
        tagColor: cab.regulated ? '#16a34a' : '#64748b',
        badge: cab.isNight ? 'Night rate' : '',
      },
      bike: {
        id: 'bike',
        name: bike.tariff?.label || 'Bike taxi',
        subtitle: bike.regulated ? bike.tariff?.appNote : bike.tariff?.legalStatus || 'Price set by the app',
        fare: bike.fare,
        fareText: fareText(bike),
        tag: bike.regulated ? 'OFFICIAL TARIFF' : 'NO GOVT TARIFF',
        tagColor: bike.regulated ? '#16a34a' : '#64748b',
        badge: '',
      },
    },
    negotiationPhrase: {
      kannada: 'ಮೀಟರ್ ಹಾಕಿ ಬನ್ನಿ (Meter hakisi banni)',
      hindi: 'भैया, मीटर से चलिए (Bhaiya, meter se chaliye)',
      english: 'Please turn on the meter.',
    },
  };
}
