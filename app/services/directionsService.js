import {
  PURPLE_STATIONS,
  GREEN_STATIONS,
  DMRC_YELLOW_STATIONS,
  DMRC_BLUE_STATIONS,
  DMRC_AIRPORT_STATIONS,
  MUMBAI_WESTERN_STATIONS,
  MUMBAI_CENTRAL_STATIONS,
  MUMBAI_METRO1_STATIONS,
  findNearestMetroStation,
  getNextMetroDeparture,
  calculateMetroFare,
  getDistanceBetween,
  getMajesticInterchangeGuide,
  getRajivChowkInterchangeGuide,
  getDadarInterchangeGuide,
  getInterchangeGuide,
  getMetroPlatformAndGateInfo,
  getLineColor,
  getLineDisplayName,
  getStationListForLine,
  detectCityFromCoord,
} from '../data/transitData';
import { formatDistance, estimateWalkMinutes } from './locationService';
import { calculateDynamicFareMatrix } from '../../src/domain/dynamicFare';
import { findBusesForLocation, calculateUpcomingBusDepartures } from '../data/bmtcBusData';

/**
 * Fetches real road-level geometry from OSRM road routing engine.
 * Falls back to straight line if offline or request times out.
 */
export async function fetchRoadPolyline(fromCoord, toCoord, mode = 'walking') {
  if (!fromCoord || !toCoord) return [];
  try {
    const profile = mode === 'driving' ? 'driving' : 'walking';
    const url = `https://router.project-osrm.org/route/v1/${profile}/${fromCoord.longitude},${fromCoord.latitude};${toCoord.longitude},${toCoord.latitude}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2800);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0 && data.routes[0].geometry?.coordinates) {
        return data.routes[0].geometry.coordinates.map(([lon, lat]) => ({
          latitude: lat,
          longitude: lon,
        }));
      }
    }
  } catch {
    // Fallback on network delay or offline
  }

  return [
    { latitude: fromCoord.latitude, longitude: fromCoord.longitude },
    { latitude: toCoord.latitude, longitude: toCoord.longitude },
  ];
}

/**
 * Builds an intelligent multi-modal connecting leg (first-mile or last-mile)
 * comparing Auto, Bike Taxi, BMTC Feeder Bus, and Walking.
 * If distance > 800m, defaults to Auto/Bike rather than a 26-min walk!
 */
export function buildConnectingLeg({
  id,
  legType, // 'first_mile' | 'last_mile'
  locationName,
  fromCoord,
  toCoord,
  distanceMeters,
  seniorMode = false,
}) {
  // If seniorMode is active, minimize walking to under 250m
  const isLongDistance = seniorMode ? distanceMeters > 250 : distanceMeters > 800;
  const defaultMode = isLongDistance ? 'auto' : 'walk';

  const walkMin = estimateWalkMinutes(distanceMeters);
  const autoMin = Math.max(3, Math.round(distanceMeters / 340) + 2);
  const bikeMin = Math.max(2, Math.round(distanceMeters / 420) + 1);
  const busMin = Math.max(5, Math.round(distanceMeters / 250) + 3);
  const cabMin = Math.max(4, Math.round(distanceMeters / 300) + 3);

  const dynamicFare = calculateDynamicFareMatrix(distanceMeters, new Date());
  const autoMeterFare = dynamicFare.providers.rtoMeter.fare;
  const autoAppFare = dynamicFare.providers.nammaYatri.fare;
  const autoQuoteFare = dynamicFare.providers.streetQuote.fare;
  const bikeFare = dynamicFare.providers.rapidoBike.fare;
  const busFare = 10;
  const cabFare = Math.max(89, Math.round(dynamicFare.providers.uberOla.fare + 45));

  const matchedBuses = findBusesForLocation(locationName);
  const matchedBus = matchedBuses.length > 0 ? matchedBuses[0] : null;
  const busSchedule = matchedBus ? calculateUpcomingBusDepartures(matchedBus, new Date()) : null;

  const modes = {
    auto: {
      key: 'auto',
      label: 'Auto',
      icon: 'car',
      emoji: '🛺',
      durationMinutes: autoMin,
      fare: autoAppFare,
      meterFare: autoMeterFare,
      quoteFare: autoQuoteFare,
      dynamicFare,
      title: `Auto to ${locationName}`,
      meta: `${formatDistance(distanceMeters)} · ~${autoMin} min · App ~₹${autoAppFare} (Meter ₹${autoMeterFare})`,
      details: seniorMode
        ? `Senior/Family Pick: Hop into a meter auto or Namma Yatri (~${autoMin} min). Drops right at the station elevator/ramp.`
        : `Take auto (~${autoMin} min). Namma Yatri ~₹${autoAppFare}, Uber/Ola ~${dynamicFare.providers.uberOla.fareRange || `₹${dynamicFare.providers.uberOla.fare}`}. Meter rate: ₹${autoMeterFare}.`,
      tip: `${dynamicFare.surge.label}. Offline drivers quote ~₹${autoQuoteFare}. Use Namma Yatri or ask for meter.`,
    },
    bike: {
      key: 'bike',
      label: 'Bike Taxi',
      icon: 'bike',
      emoji: '🛵',
      durationMinutes: bikeMin,
      fare: bikeFare,
      quoteFare: bikeFare,
      title: `Bike Taxi to ${locationName}`,
      meta: `${formatDistance(distanceMeters)} · ~${bikeMin} min · ₹${bikeFare}`,
      details: `Rapido / Uber Moto (~${bikeMin} min). Fastest option to cut through Bengaluru traffic bottlenecks.`,
      tip: `Wear the helmet provided. Best for single commuter with light luggage.`,
    },
    cab: {
      key: 'cab',
      label: 'Cab',
      icon: 'cab',
      emoji: '🚕',
      durationMinutes: cabMin,
      fare: cabFare,
      quoteFare: cabFare,
      title: `Cab to ${locationName}`,
      meta: `${formatDistance(distanceMeters)} · ~${cabMin} min · AC Cab ₹${cabFare}`,
      details: `Uber / Ola / BluSmart cab (~${cabMin} min). Comfortable AC ride, best in afternoon heat, rain or with heavy luggage.`,
      tip: `Pickups at station exit gate 2. Pre-booked cabs arrive in 3-5 min.`,
    },
    bus: {
      key: 'bus',
      label: 'BMTC Bus',
      icon: 'bus',
      emoji: '🚌',
      durationMinutes: busMin,
      fare: busFare,
      quoteFare: busFare,
      ordinaryFare: matchedBus ? matchedBus.ordinaryFare : busFare,
      matchedBus,
      busSchedule,
      title: matchedBus ? `BMTC ${matchedBus.routeNumber} to ${locationName}` : `BMTC Feeder Bus to ${locationName}`,
      meta: busSchedule && busSchedule.departures?.[0]
        ? `Next in ${busSchedule.nextBusInMinutes}m (${busSchedule.departures[0].timeFormatted}) · ₹${busFare}`
        : `${formatDistance(distanceMeters)} · ~${busMin} min · ₹${busFare}`,
      details: matchedBus
        ? `BMTC ${matchedBus.routeNumber}: ${matchedBus.name}. Next bus in ${busSchedule.nextBusInMinutes} mins (${busSchedule.departures[0]?.timeFormatted}). ${busSchedule.frequencyText}.`
        : `BMTC metro feeder bus (MF-series). Economical choice (~${busMin} min). Stops right at station gate.`,
      tip: `Pay cash (₹10 note) or UPI QR via Tummoc / conductor scanner. Zero surge guarantee.`,
    },
    walk: {
      key: 'walk',
      label: 'Walk',
      icon: 'walk',
      emoji: '🚶',
      durationMinutes: walkMin,
      fare: 0,
      quoteFare: 0,
      title: `Walk to ${locationName}`,
      meta: `${formatDistance(distanceMeters)} · ~${walkMin} min walk · Free`,
      details: isLongDistance
        ? `⚠️ Long walk (${formatDistance(distanceMeters)} · ${walkMin} min) along busy main road. Auto or Bike Taxi strongly recommended!`
        : `Direct walk along footpath (${formatDistance(distanceMeters)} · ${walkMin} min). Free of charge.`,
      tip: isLongDistance
        ? `Not recommended: 1.9+ km walk in traffic, pollution and heat. Take an auto or bike taxi instead.`
        : `Stay on the pedestrian footpath.`,
    },
  };

  const selected = modes[defaultMode];

  return {
    id,
    type: 'connecting_leg',
    legType,
    title: selected.title,
    meta: selected.meta,
    details: selected.details,
    tip: selected.tip,
    cost: selected.fare,
    durationMinutes: selected.durationMinutes,
    icon: selected.icon,
    isLongDistance,
    defaultMode,
    selectedMode: defaultMode,
    modes,
    distanceMeters,
    dynamicFare,
    matchedBus,
    busSchedule,
    locationName,
    fromCoord,
    toCoord,
    coordinates: [fromCoord, toCoord],
  };
}

/**
 * Intelligent Transit Router for Bengaluru:
 * Computes optimal step-by-step route between origin and destination,
 * with multi-modal first/last-mile comparison, real road geometry, and milestones.
 */
export function planTransitRoute(origin, destination, travelDate = new Date(), options = {}) {
  if (!origin || !destination) return null;

  let travelDateObj = travelDate instanceof Date ? travelDate : new Date();
  let opts = options;
  if (travelDate && !(travelDate instanceof Date) && typeof travelDate === 'object') {
    opts = travelDate;
    travelDateObj = opts.travelDate || new Date();
  }
  const seniorMode = !!opts.seniorMode;

  const totalDirectDistance = getDistanceBetween(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude,
  );

  const originCoord = { latitude: origin.latitude, longitude: origin.longitude };
  const destCoord = { latitude: destination.latitude, longitude: destination.longitude };

  // Case 1: If destination is very close (less than 900 meters), direct connection is best
  if (totalDirectDistance < 900) {
    const walkCoords = [originCoord, destCoord];

    const destName = destination.name || destination.title || 'Destination';
    const milestones = [
      {
        id: 'm_start',
        coordinate: originCoord,
        label: 'Start',
        title: origin.name || 'Your Location',
        type: 'origin',
        stepIndex: 0,
      },
      {
        id: 'm_dest',
        coordinate: destCoord,
        label: 'End',
        title: destName,
        type: 'destination',
        stepIndex: 0,
      },
    ];

    const shortLeg = buildConnectingLeg({
      id: 's_short_direct',
      legType: 'first_mile',
      locationName: destName,
      fromCoord: originCoord,
      toCoord: destCoord,
      distanceMeters: totalDirectDistance,
      seniorMode,
    });

    const legitMeter = 30;
    const directCab = 79;
    const savings = Math.max(0, directCab - shortLeg.cost);

    return {
      type: 'walk_direct',
      title: `Direct to ${destName}`,
      totalDurationMinutes: shortLeg.durationMinutes,
      totalCost: shortLeg.cost,
      totalDistanceText: formatDistance(totalDirectDistance),
      routeCategory: totalDirectDistance < 700 ? 'Walking Only' : 'Short Hop',
      coordinates: walkCoords,
      milestones,
      steps: [shortLeg],
      seniorMode,
      autoAdvisory: {
        fare: legitMeter,
        streetQuote: 60,
        cabFare: directCab,
        cabDurationMinutes: 8,
        transitCost: shortLeg.cost,
        transitDurationMinutes: shortLeg.durationMinutes,
        moneySaved: savings,
        timeSaved: 2,
        dosaCount: 0,
        coffeeCount: 2,
        foodEquivalent: '2 Filter Coffees',
        tip: 'Short distance. Walking is pleasant, or hop into a quick meter auto for ₹30.',
        scamAlert: 'Drivers asking ₹80–₹100 for this short walk are overcharging. Ask for meter.',
      },
    };
  }

  // Detect city context
  const cityId = opts.cityId || detectCityFromCoord(origin.latitude, origin.longitude) || detectCityFromCoord(destination.latitude, destination.longitude) || 'bengaluru';

  // Find nearest metro stations
  const originStation = findNearestMetroStation(origin.latitude, origin.longitude, cityId);
  const destStation = findNearestMetroStation(destination.latitude, destination.longitude, cityId);

  const walkToOriginStationMeters = originStation
    ? getDistanceBetween(origin.latitude, origin.longitude, originStation.latitude, originStation.longitude)
    : Infinity;

  const walkFromDestStationMeters = destStation
    ? getDistanceBetween(destStation.latitude, destStation.longitude, destination.latitude, destination.longitude)
    : Infinity;

  // Case 2: Both near same station or metro not convenient -> direct commute
  const isSameStation = originStation && destStation && originStation.id === destStation.id;
  const metroTooFar = walkToOriginStationMeters > 8000 || walkFromDestStationMeters > 8000;

  if (isSameStation || metroTooFar || !originStation || !destStation) {
    const destName = destination.name || destination.title || 'Destination';
    const distanceKm = Math.max(0.5, totalDirectDistance / 1000);
    const legitAutoMeter = Math.max(30, Math.round(30 + Math.max(0, distanceKm - 2) * 15));
    const streetQuote = Math.round(legitAutoMeter * 1.85);
    const directCab = Math.max(89, Math.round(80 + distanceKm * 22));
    const autoCoords = [originCoord, destCoord];

    const milestones = [
      {
        id: 'm_start',
        coordinate: originCoord,
        label: 'Start',
        title: origin.name || 'Your Location',
        type: 'origin',
        stepIndex: 0,
      },
      {
        id: 'm_dest',
        coordinate: destCoord,
        label: 'End',
        title: destName,
        type: 'destination',
        stepIndex: 0,
      },
    ];

    const directLeg = buildConnectingLeg({
      id: 's_direct_auto',
      legType: 'first_mile',
      locationName: destName,
      fromCoord: originCoord,
      toCoord: destCoord,
      distanceMeters: totalDirectDistance,
      seniorMode,
    });

    const savings = Math.max(0, directCab - directLeg.cost);
    let foodEquivalent = '';
    let scamAlert = '';
    let tip = '';

    if (cityId === 'delhi') {
      const choleCount = Math.floor(savings / 90);
      const chaiCount = Math.max(1, Math.floor((savings % 90) / 15));
      foodEquivalent = choleCount > 0 ? `${choleCount} Chole Bhature + ${chaiCount} Cutting Chais` : `${chaiCount} Cutting Chais`;
      scamAlert = `Paharganj / New Delhi station auto drivers quote ₹${streetQuote}+ without meter. Insist on meter or use Delhi Metro.`;
      tip = `Fair CNG auto meter is ~₹${legitAutoMeter}. Direct cab is ~₹${directCab}. Delhi Metro connects key hubs fastest.`;
    } else if (cityId === 'mumbai') {
      const vadaCount = Math.floor(savings / 25);
      const chaiCount = Math.max(1, Math.floor((savings % 25) / 15));
      foodEquivalent = vadaCount > 0 ? `${vadaCount} Ashok Vada Pavs + ${chaiCount} Cutting Chais` : `${chaiCount} Cutting Chais`;
      scamAlert = `Mumbai taxis and autos strictly run by meter by law! Never agree to fixed street quotes.`;
      tip = `Fair meter rate is ~₹${legitAutoMeter}. Direct cab is ~₹${directCab}. Suburban local train costs just ₹5–₹10.`;
    } else {
      const dosaCount = Math.floor(savings / 85);
      const coffeeCount = Math.max(1, Math.floor((savings % 85) / 20));
      foodEquivalent = dosaCount > 0 ? `${dosaCount} Benne Dosas + ${coffeeCount} Filter Coffees` : `${coffeeCount} Filter Coffees`;
      scamAlert = `Drivers at major spots quote ₹${streetQuote}+ without meter. Always ask for meter.`;
      tip = `Fair meter fare is ~₹${legitAutoMeter}. Direct cab is ~₹${directCab}. If street auto asks more than ₹${streetQuote}, insist on meter or book via Namma Yatri.`;
    }

    return {
      type: 'auto_bus',
      title: `Direct to ${destName}`,
      totalDurationMinutes: directLeg.durationMinutes,
      totalCost: directLeg.cost,
      totalDistanceText: formatDistance(totalDirectDistance),
      routeCategory: 'Auto / Cab / Bike',
      coordinates: autoCoords,
      milestones,
      steps: [directLeg],
      seniorMode,
      autoAdvisory: {
        fare: legitAutoMeter,
        streetQuote,
        cabFare: directCab,
        cabDurationMinutes: directLeg.durationMinutes + 5,
        transitCost: directLeg.cost,
        transitDurationMinutes: directLeg.durationMinutes,
        moneySaved: savings,
        timeSaved: 5,
        foodEquivalent,
        tip,
        scamAlert,
      },
    };
  }

  // Determine line paths
  const originLineList = getStationListForLine(originStation.line);
  const destLineList = getStationListForLine(destStation.line);

  const originIdx = originLineList.findIndex((s) => s.id === originStation.id);
  const destIdx = destLineList.findIndex((s) => s.id === destStation.id);
  const isSameLine = originStation.line === destStation.line;

  const steps = [];
  const milestones = [];

  let totalFare = 0;
  let totalTime = 0;

  const originStationCoord = { latitude: originStation.latitude, longitude: originStation.longitude };
  const destStationCoord = { latitude: destStation.latitude, longitude: destStation.longitude };

  // Milestone 1: Origin
  milestones.push({
    id: 'm_start',
    coordinate: originCoord,
    label: 'Start',
    title: origin.name || 'Your Location',
    type: 'origin',
    stepIndex: 0,
  });

  // Step 1: First Mile Connection (Auto / Bike / Bus / Walk)
  const firstMileStep = buildConnectingLeg({
    id: 'first_mile',
    legType: 'first_mile',
    locationName: `${originStation.name.split('(')[0]} Station`,
    fromCoord: originCoord,
    toCoord: originStationCoord,
    distanceMeters: walkToOriginStationMeters,
    seniorMode,
  });
  totalTime += firstMileStep.durationMinutes;
  totalFare += firstMileStep.cost;
  steps.push(firstMileStep);

  // Milestone 2: Boarding Station
  milestones.push({
    id: 'm_board',
    coordinate: originStationCoord,
    label: 'Board',
    title: `${originStation.name.split('(')[0]} (${getLineDisplayName(originStation.line)})`,
    line: originStation.line,
    type: 'station',
    stepIndex: 1,
  });

  let interchangeName = 'Interchange';

  if (isSameLine) {
    // Single line travel (e.g. Purple -> Purple or Yellow -> Yellow)
    const stationsSlice =
      originIdx < destIdx
        ? originLineList.slice(originIdx, destIdx + 1)
        : originLineList.slice(destIdx, originIdx + 1).reverse();

    const stopCount = Math.abs(destIdx - originIdx);
    const metroRideMinutes = stopCount * 2.2;
    totalTime += metroRideMinutes;

    const metroFare = calculateMetroFare(stopCount, cityId);
    totalFare += metroFare;

    const departureInfo = getNextMetroDeparture(originStation.id, originStation.line, travelDateObj, cityId);

    const originGatePlatform = getMetroPlatformAndGateInfo({
      stationId: originStation.id,
      line: originStation.line,
      fromIdx: originIdx,
      toIdx: destIdx,
    });
    const destGatePlatform = getMetroPlatformAndGateInfo({
      stationId: destStation.id,
      line: destStation.line,
      fromIdx: originIdx,
      toIdx: destIdx,
    });

    const metroCoords = stationsSlice.map((st) => ({
      latitude: st.latitude,
      longitude: st.longitude,
    }));

    steps.push({
      id: 'metro_ride',
      type: 'metro',
      line: originStation.line,
      title: `${getLineDisplayName(originStation.line)} · ${stopCount} stops`,
      meta: `${originStation.name.split('(')[0]} → ${destStation.name.split('(')[0]} · ₹${metroFare} · ${Math.round(metroRideMinutes)} min`,
      details: `Board from ${originGatePlatform.platform} (${originGatePlatform.towards}). Enter via ${originGatePlatform.entryGate}.`,
      nextDeparture: departureInfo,
      intermediateStations: stationsSlice.map((s) => s.name.split('(')[0].trim()),
      icon: 'train',
      cost: metroFare,
      durationMinutes: Math.round(metroRideMinutes),
      coordinates: metroCoords,
      platformInfo: {
        platform: originGatePlatform.platform,
        platformNum: originGatePlatform.platformNum,
        towards: originGatePlatform.towards,
        entryGate: originGatePlatform.entryGate,
        exitGate: destGatePlatform.exitGate,
        gates: originGatePlatform.gates,
        destGates: destGatePlatform.gates,
        originStationName: originStation.name.split('(')[0].trim(),
        destStationName: destStation.name.split('(')[0].trim(),
      },
    });

    // Milestone 3: De-board Station
    milestones.push({
      id: 'm_deboard',
      coordinate: destStationCoord,
      label: 'De-board',
      title: `De-board at ${destStation.name.split('(')[0]}`,
      line: destStation.line,
      type: 'station',
      stepIndex: 1,
    });
  } else {
    // Multi-line travel: Interchange needed
    let commonOriginIdx = -1;
    let commonDestIdx = -1;

    for (let i = 0; i < originLineList.length; i++) {
      const os = originLineList[i];
      if (!os.isInterchange) continue;
      const osBase = os.name.split('(')[0].trim().toLowerCase();
      const matchIdx = destLineList.findIndex((ds) => {
        if (!ds.isInterchange) return false;
        const dsBase = ds.name.split('(')[0].trim().toLowerCase();
        return osBase.includes(dsBase) || dsBase.includes(osBase);
      });
      if (matchIdx !== -1) {
        commonOriginIdx = i;
        commonDestIdx = matchIdx;
        break;
      }
    }

    const originInterchangeIdx = commonOriginIdx !== -1 ? commonOriginIdx : originLineList.findIndex((s) => s.isInterchange);
    const destInterchangeIdx = commonDestIdx !== -1 ? commonDestIdx : destLineList.findIndex((s) => s.isInterchange);

    const safeOriginInterchangeIdx = originInterchangeIdx !== -1 ? originInterchangeIdx : 0;
    const safeDestInterchangeIdx = destInterchangeIdx !== -1 ? destInterchangeIdx : 0;

    const interchangeStation = originLineList[safeOriginInterchangeIdx];
    const interchangeCoord = { latitude: interchangeStation.latitude, longitude: interchangeStation.longitude };
    interchangeName = interchangeStation.name.split('(')[0].trim();

    // Leg 1: Origin Station -> Interchange
    const leg1Slice =
      originIdx < safeOriginInterchangeIdx
        ? originLineList.slice(originIdx, safeOriginInterchangeIdx + 1)
        : originLineList.slice(safeOriginInterchangeIdx, originIdx + 1).reverse();

    const leg1Stops = Math.abs(safeOriginInterchangeIdx - originIdx);
    const leg1Minutes = Math.max(2, leg1Stops * 2.2);
    totalTime += leg1Minutes;

    const departureLeg1 = getNextMetroDeparture(originStation.id, originStation.line, travelDateObj, cityId);

    const leg1GatePlatform = getMetroPlatformAndGateInfo({
      stationId: originStation.id,
      line: originStation.line,
      fromIdx: originIdx,
      toIdx: safeOriginInterchangeIdx,
    });

    const leg1Coords = leg1Slice.map((st) => ({
      latitude: st.latitude,
      longitude: st.longitude,
    }));

    steps.push({
      id: 'metro_leg1',
      type: 'metro',
      line: originStation.line,
      title: `${getLineDisplayName(originStation.line)} to ${interchangeName} (${leg1Stops} stops)`,
      meta: `${originStation.name.split('(')[0]} → ${interchangeName} · ${Math.round(leg1Minutes)} min`,
      details: `Board from ${leg1GatePlatform.platform} (${leg1GatePlatform.towards}). Enter via ${leg1GatePlatform.entryGate}.`,
      nextDeparture: departureLeg1,
      intermediateStations: leg1Slice.map((s) => s.name.split('(')[0].trim()),
      icon: 'train',
      cost: 0,
      durationMinutes: Math.round(leg1Minutes),
      coordinates: leg1Coords,
      platformInfo: {
        platform: leg1GatePlatform.platform,
        platformNum: leg1GatePlatform.platformNum,
        towards: leg1GatePlatform.towards,
        entryGate: leg1GatePlatform.entryGate,
        exitGate: 'Concourse Transfer Level',
        gates: leg1GatePlatform.gates,
        originStationName: originStation.name.split('(')[0].trim(),
        destStationName: interchangeName,
      },
    });

    // Milestone 3: Interchange
    milestones.push({
      id: 'm_interchange',
      coordinate: interchangeCoord,
      label: 'Transfer',
      title: `Change Line at ${interchangeName} Station`,
      type: 'transfer',
      stepIndex: 2,
    });

    // Step: Interchange Transfer
    const transferGuide = getInterchangeGuide(cityId, originStation.line, destStation.line);
    totalTime += 4;
    const isMajestic = interchangeName.toLowerCase().includes('kempegowda') || interchangeName.toLowerCase().includes('majestic');
    steps.push({
      id: isMajestic ? 'majestic_transfer' : 'transit_transfer',
      type: 'transfer',
      title: isMajestic ? 'Change Line at Nadaprabhu Kempegowda (Majestic)' : `Change Line at ${interchangeName}`,
      meta: 'Transfer concourse · ~3-4 min walk · Free interchange',
      details: transferGuide.steps.join(' → '),
      tip: transferGuide.tip,
      icon: 'swap',
      cost: 0,
      durationMinutes: 4,
      coordinates: [interchangeCoord, interchangeCoord],
    });

    // Leg 2: Interchange -> Destination Station
    const leg2Slice =
      safeDestInterchangeIdx < destIdx
        ? destLineList.slice(safeDestInterchangeIdx, destIdx + 1)
        : destLineList.slice(destIdx, safeDestInterchangeIdx + 1).reverse();

    const leg2Stops = Math.abs(destIdx - safeDestInterchangeIdx);
    const leg2Minutes = Math.max(2, leg2Stops * 2.2);
    totalTime += leg2Minutes;

    const totalMetroStops = leg1Stops + leg2Stops;
    const combinedMetroFare = calculateMetroFare(totalMetroStops, cityId);
    totalFare += combinedMetroFare;

    const departureLeg2 = getNextMetroDeparture(
      destLineList[safeDestInterchangeIdx]?.id || 'interchange',
      destStation.line,
      new Date(travelDateObj.getTime() + (firstMileStep.durationMinutes + leg1Minutes + 4) * 60 * 1000),
      cityId,
    );

    const leg2GatePlatform = getMetroPlatformAndGateInfo({
      stationId: destStation.id,
      line: destStation.line,
      fromIdx: safeDestInterchangeIdx,
      toIdx: destIdx,
    });

    const leg2Coords = leg2Slice.map((st) => ({
      latitude: st.latitude,
      longitude: st.longitude,
    }));

    steps.push({
      id: 'metro_leg2',
      type: 'metro',
      line: destStation.line,
      title: `${getLineDisplayName(destStation.line)} to destination (${leg2Stops} stops)`,
      meta: `${interchangeName} → ${destStation.name.split('(')[0]} · Combined ₹${combinedMetroFare} · ${Math.round(leg2Minutes)} min`,
      details: `Board from ${leg2GatePlatform.platform} (${leg2GatePlatform.towards}).`,
      nextDeparture: departureLeg2,
      intermediateStations: leg2Slice.map((s) => s.name.split('(')[0].trim()),
      icon: 'train',
      cost: combinedMetroFare,
      durationMinutes: Math.round(leg2Minutes),
      coordinates: leg2Coords,
      platformInfo: {
        platform: leg2GatePlatform.platform,
        towards: leg2GatePlatform.towards,
        entryGate: `${interchangeName} Transfer Concourse`,
        exitGate: leg2GatePlatform.exitGate,
        destGates: leg2GatePlatform.gates,
        originStationName: interchangeName,
        destStationName: destStation.name.split('(')[0].trim(),
      },
    });

    // Milestone 4: De-board Station
    milestones.push({
      id: 'm_deboard',
      coordinate: destStationCoord,
      label: 'De-board',
      title: `De-board at ${destStation.name.split('(')[0]}`,
      line: destStation.line,
      type: 'station',
      stepIndex: 3,
    });
  }

  const destName = destination.name || destination.title || 'Destination';

  // Step Last Mile: Multi-modal connection to Final Destination
  const lastMileStep = buildConnectingLeg({
    id: 'last_mile',
    legType: 'last_mile',
    locationName: destName,
    fromCoord: destStationCoord,
    toCoord: destCoord,
    distanceMeters: walkFromDestStationMeters,
    seniorMode,
  });
  totalTime += lastMileStep.durationMinutes;
  totalFare += lastMileStep.cost;
  steps.push(lastMileStep);

  // Milestone Final: Destination
  milestones.push({
    id: 'm_dest',
    coordinate: destCoord,
    label: 'End',
    title: destName,
    type: 'destination',
    stepIndex: steps.length - 1,
  });

  // Assemble full baseline polyline coordinates
  const fullCoordinates = [];
  steps.forEach((s) => {
    if (s.coordinates && s.coordinates.length > 0) {
      fullCoordinates.push(...s.coordinates);
    }
  });

  const distanceKm = Math.max(1, totalDirectDistance / 1000);
  const legitAutoFare = Math.max(30, Math.round(30 + Math.max(0, distanceKm - 2) * 15));
  const streetAutoQuote = Math.round(legitAutoFare * 1.85);
  const fullCabFare = Math.max(149, Math.round(110 + distanceKm * 25));
  const cabTrafficMinutes = Math.max(20, Math.round(distanceKm * 3.6) + 12);

  const transitCost = totalFare;
  const transitMinutes = Math.round(totalTime);
  const moneySaved = Math.max(0, fullCabFare - transitCost);
  const timeSaved = Math.max(0, cabTrafficMinutes - transitMinutes);

  let foodEquivalent = '';
  let agencyName = 'Namma Metro';
  if (cityId === 'delhi') {
    agencyName = 'Delhi Metro (DMRC)';
    const choleCount = Math.floor(moneySaved / 90);
    const chaiCount = Math.max(1, Math.floor((moneySaved % 90) / 15));
    foodEquivalent = choleCount > 0 ? `${choleCount} Chole Bhature + ${chaiCount} Cutting Chais` : `${chaiCount} Cutting Chais`;
  } else if (cityId === 'mumbai') {
    agencyName = 'Mumbai Suburban Local & Metro';
    const vadaCount = Math.floor(moneySaved / 25);
    const chaiCount = Math.max(1, Math.floor((moneySaved % 25) / 15));
    foodEquivalent = vadaCount > 0 ? `${vadaCount} Ashok Vada Pavs + ${chaiCount} Cutting Chais` : `${chaiCount} Cutting Chais`;
  } else {
    const dosaCount = Math.floor(moneySaved / 85);
    const coffeeCount = Math.max(1, Math.floor((moneySaved % 85) / 20));
    foodEquivalent = dosaCount > 0
      ? `${dosaCount} Benne Masala Dosas + ${coffeeCount} Filter Coffees`
      : `${coffeeCount} Filter Coffees`;
  }

  const routeTitle = cityId === 'delhi'
    ? `Via Delhi Metro (${isSameLine ? 'Direct' : `1 Interchange at ${interchangeName}`})`
    : cityId === 'mumbai'
      ? `Via Mumbai Local (${isSameLine ? 'Direct' : `1 Interchange at ${interchangeName}`})`
      : `Via Namma Metro (${isSameLine ? 'Direct' : '1 Interchange at Majestic'})`;

  return {
    type: 'transit_metro',
    title: routeTitle,
    totalDurationMinutes: Math.round(totalTime),
    totalCost: totalFare,
    totalDistanceText: formatDistance(totalDirectDistance),
    routeCategory: isSameLine ? 'Direct Transit' : 'Transit with Interchange',
    coordinates: fullCoordinates,
    milestones,
    originStation,
    destStation,
    isSameLine,
    steps,
    seniorMode,
    cityId,
    autoAdvisory: {
      fare: legitAutoFare,
      streetQuote: streetAutoQuote,
      cabFare: fullCabFare,
      cabDurationMinutes: cabTrafficMinutes,
      transitCost,
      transitDurationMinutes: transitMinutes,
      moneySaved,
      timeSaved,
      foodEquivalent,
      tip: `Direct cab would cost ~₹${fullCabFare} and get stuck in city traffic (${cabTrafficMinutes} min). ${agencyName} costs only ₹${transitCost} and takes ${transitMinutes} min!`,
      scamAlert: cityId === 'mumbai'
        ? `Mumbai taxis strictly follow meter by law. Meter rate: ~₹${legitAutoFare}. Suburban local train is fastest.`
        : cityId === 'delhi'
          ? `Never pay street quotes of ₹${streetAutoQuote}+ at railway stations. Use Delhi Metro or insist on meter (~₹${legitAutoFare}).`
          : `Never pay street auto quotes of ₹${streetAutoQuote}+. Insist on meter (fair rate: ~₹${legitAutoFare}) or take the metro.`,
    },
  };
}

/**
 * Asynchronously enriches walking and auto steps with actual OSRM road geometry
 * so that polyline wraps real street curves instead of straight lines.
 */
export async function enrichRouteWithRealRoads(baseRoute) {
  if (!baseRoute || !baseRoute.steps) return baseRoute;

  const enrichedSteps = [...baseRoute.steps];
  let changed = false;

  for (let i = 0; i < enrichedSteps.length; i++) {
    const step = enrichedSteps[i];
    const isConnect = step.type === 'connecting_leg' || step.type === 'walk' || step.type === 'auto';
    if (isConnect && step.fromCoord && step.toCoord) {
      const mode = step.selectedMode === 'walk' ? 'walking' : 'driving';
      const roadCoords = await fetchRoadPolyline(step.fromCoord, step.toCoord, mode);
      if (roadCoords && roadCoords.length > 2) {
        enrichedSteps[i] = {
          ...step,
          coordinates: roadCoords,
        };
        changed = true;
      }
    }
  }

  if (!changed) return baseRoute;

  const updatedFullCoords = [];
  enrichedSteps.forEach((s) => {
    if (s.coordinates) updatedFullCoords.push(...s.coordinates);
  });

  return {
    ...baseRoute,
    steps: enrichedSteps,
    coordinates: updatedFullCoords,
  };
}
