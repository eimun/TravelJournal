/**
 * Domain: Bengaluru Dynamic Auto & Cab Price Engine
 * Reconciles the gap between theoretical RTO Gazetted Meter Tariff
 * and real-world fluctuating prices on Uber, Rapido, Namma Yatri & Street Hails.
 */

export const BENGALURU_RTO_CONFIG = {
  flagfallDistanceMeters: 2000,
  flagfallFare: 30,
  perKmRate: 15,
  nightSurchargeMultiplier: 1.5, // 10 PM to 5 AM (Govt Gazetted +50%)
  waitingPer15Min: 5,
};

/**
 * Determines current surge multiplier, label, and advice based on time of day
 */
export function getTimeSurgeContext(date = new Date()) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const timeVal = hour + minute / 60;

  // 1. Night Time: 10:00 PM (22:00) to 5:00 AM
  if (timeVal >= 22 || timeVal < 5) {
    return {
      period: 'night',
      surgeMultiplier: 1.5,
      surgeLabel: 'Night Tariff (+50% RTO Rule)',
      emoji: '🌙',
      color: '#6366f1',
      advice: 'Official 1.5x night rate applies after 10 PM. Aggregator cabs may also add safety fees.',
    };
  }

  // 2. Early Morning: 5:00 AM to 8:30 AM
  if (timeVal >= 5 && timeVal < 8.5) {
    return {
      period: 'early_morning',
      surgeMultiplier: 1.0,
      surgeLabel: 'Off-Peak (Base Rate)',
      emoji: '🌅',
      color: '#10b981',
      advice: 'Great time for autos. Traffic is light and meter acceptance is high.',
    };
  }

  // 3. Morning Rush: 8:30 AM to 11:30 AM
  if (timeVal >= 8.5 && timeVal < 11.5) {
    return {
      period: 'morning_peak',
      surgeMultiplier: 1.45,
      surgeLabel: 'Morning Office Rush (1.4x–1.6x Surge)',
      emoji: '⚡',
      color: '#f59e0b',
      advice: 'High demand near metro & tech corridors. Uber/Ola surge active. Try Namma Yatri or BMTC feeder.',
    };
  }

  // 4. Midday Off-Peak: 11:30 AM to 5:00 PM
  if (timeVal >= 11.5 && timeVal < 17.0) {
    return {
      period: 'midday_normal',
      surgeMultiplier: 1.05,
      surgeLabel: 'Normal Off-Peak Rates',
      emoji: '☀️',
      color: '#0284c7',
      advice: 'Normal fares. Drivers are likely to agree to meter or low aggregator rates.',
    };
  }

  // 5. Evening Peak: 5:00 PM to 8:30 PM (Peak Bengaluru Traffic)
  if (timeVal >= 17.0 && timeVal < 20.5) {
    return {
      period: 'evening_peak',
      surgeMultiplier: 1.65,
      surgeLabel: 'Peak Evening Gridlock (1.5x–2.0x Surge)',
      emoji: '🔥',
      color: '#ef4444',
      advice: 'Severe gridlock near bottlenecks. Street drivers demand 2x-3x. Prefer Metro or Rapido Bike.',
    };
  }

  // 6. Late Evening: 8:30 PM to 10:00 PM
  return {
    period: 'late_evening',
    surgeMultiplier: 1.2,
    surgeLabel: 'Post-Rush Hours',
    emoji: '🌆',
    color: '#8b5cf6',
    advice: 'Traffic subsiding. Aggregator fares stabilize before the 10 PM night rate begins.',
  };
}

/**
 * Calculates comprehensive multi-provider fare matrix for a given distance
 */
export function calculateDynamicFareMatrix(distanceMeters, date = new Date(), options = {}) {
  const dist = Math.max(100, Number(distanceMeters) || 0);
  const surgeCtx = getTimeSurgeContext(date);
  const isRain = Boolean(options.isRain);
  const effectiveSurge = isRain ? surgeCtx.surgeMultiplier * 1.3 : surgeCtx.surgeMultiplier;

  // 1. RTO Government Gazetted Meter
  let rtoBase = BENGALURU_RTO_CONFIG.flagfallFare;
  if (dist > BENGALURU_RTO_CONFIG.flagfallDistanceMeters) {
    const extraKm = (dist - BENGALURU_RTO_CONFIG.flagfallDistanceMeters) / 1000;
    rtoBase += extraKm * BENGALURU_RTO_CONFIG.perKmRate;
  }
  const isNight = surgeCtx.period === 'night';
  const rtoMeter = Math.ceil((rtoBase * (isNight ? 1.5 : 1.0)) / 5) * 5;

  // 2. Namma Yatri (Direct auto, zero-commission, realistic tip/pickup)
  // Usually meter + ₹10 to ₹25 pickup incentive
  const nammaYatri = Math.max(45, Math.round(rtoMeter * 1.12 + (effectiveSurge > 1.3 ? 20 : 10)));

  // 3. Uber Auto / Ola Auto (Platform convenience fee + dynamic surge pricing)
  const distanceKm = dist / 1000;
  const uberBase = 42 + distanceKm * 18.5;
  const uberSurged = uberBase * effectiveSurge + 15; // +₹15 platform & pickup charge
  const uberOlaMin = Math.max(60, Math.round(uberSurged * 0.95));
  const uberOlaMax = Math.max(75, Math.round(uberSurged * 1.15));

  // 4. Rapido Bike Taxi (Fast, solo commuter budget option)
  const bikeBase = 25 + Math.max(0, distanceKm - 1.5) * 8.5;
  const rapidoBike = Math.max(25, Math.round(bikeBase * (isRain ? 1.4 : effectiveSurge > 1.3 ? 1.15 : 1.0)));

  // 5. Street Offline Driver Quote (Gate/Roadside overcharging quote)
  // Offline drivers demand flat rate: minimum ₹100-₹150, or at least ~2.2x meter and higher than app surge
  const streetBase = Math.max(rtoMeter * 2.2, uberOlaMax * 1.1);
  const streetQuote = Math.max(100, Math.ceil(streetBase / 10) * 10);

  return {
    distanceMeters: dist,
    distanceKm: Math.round((dist / 1000) * 10) / 10,
    surge: {
      period: surgeCtx.period,
      multiplier: Math.round(effectiveSurge * 100) / 100,
      label: isRain ? `${surgeCtx.surgeLabel} + Rain Surcharge` : surgeCtx.surgeLabel,
      emoji: isRain ? '🌧️' : surgeCtx.emoji,
      color: isRain ? '#0284c7' : surgeCtx.color,
      advice: surgeCtx.advice,
      isNight,
      isRain,
    },
    providers: {
      rtoMeter: {
        id: 'rto_meter',
        name: 'Govt Meter Rate',
        subtitle: 'If driver agrees to meter',
        fare: rtoMeter,
        fareText: `₹${rtoMeter}`,
        tag: 'OFFICIAL TARIFF',
        tagColor: '#16a34a',
        badge: 'Lowest Price',
      },
      nammaYatri: {
        id: 'namma_yatri',
        name: 'Namma Yatri',
        subtitle: 'Driver-direct · No surge markups',
        fare: nammaYatri,
        fareText: `~₹${nammaYatri}`,
        tag: 'RECOMMENDED',
        tagColor: '#2563eb',
        badge: 'High Acceptance',
      },
      uberOla: {
        id: 'uber_ola',
        name: 'Uber / Ola Auto',
        subtitle: 'Live dynamic surge + platform fee',
        fare: Math.round((uberOlaMin + uberOlaMax) / 2),
        fareRange: `₹${uberOlaMin}–₹${uberOlaMax}`,
        fareText: `₹${uberOlaMin}–₹${uberOlaMax}`,
        tag: effectiveSurge > 1.3 ? 'SURGING' : 'CONVENIENT',
        tagColor: effectiveSurge > 1.3 ? '#ef4444' : '#64748b',
        badge: effectiveSurge > 1.3 ? 'Peak Surge' : 'Doorstep Pickup',
      },
      rapidoBike: {
        id: 'rapido_bike',
        name: 'Rapido Bike',
        subtitle: 'Fastest in traffic · Solo passenger',
        fare: rapidoBike,
        fareText: `~₹${rapidoBike}`,
        tag: 'FASTEST',
        tagColor: '#f59e0b',
        badge: 'Beats Traffic',
      },
      streetQuote: {
        id: 'street_quote',
        name: 'Street Driver Quote',
        subtitle: 'Station gate offline demand',
        fare: streetQuote,
        fareText: `~₹${streetQuote}`,
        tag: 'OVERCHARGING',
        tagColor: '#dc2626',
        badge: 'Negotiate Down',
      },
    },
    negotiationPhrase: {
      kannada: 'ಮೀಟರ್ ಹಾಕಿ ಬನ್ನಿ (Meter hakisi banni)',
      hindi: 'भैया, मीटर से चलिए (Bhaiya, meter se chaliye)',
      english: 'Please turn on the meter.',
    },
  };
}
