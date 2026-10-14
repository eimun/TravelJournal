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
import { getFareMatrix, getOfficialFare } from './fareService';
import { FEATURES, log, loggedFetch, reportIssue } from '../../src/logging';
import { findBusesForLocation, calculateUpcomingBusDepartures } from '../data/bmtcBusData';

/**
 * Fetches real road-level geometry from the OSRM demo server.
 * Falls back to a straight line if offline or the request times out.
 * Note: router.project-osrm.org is a public demo (max 1 req/s, non-commercial,
 * no uptime guarantee) and only serves the car profile.
 */
export async function fetchRoadPolyline(fromCoord, toCoord, mode = 'walking') {
  if (!fromCoord || !toCoord) return [];
  const route = await fetchOsrmRoute(fromCoord, toCoord, mode === 'driving' ? 'driving' : 'walking', 'osrm.polyline');
  if (route && route.geometry?.coordinates?.length) {
    return route.geometry.coordinates.map(([lon, lat]) => ({ latitude: lat, longitude: lon }));
  }
  reportIssue('NAV_ROAD_GEOMETRY_FAILED', { key: mode, message: 'Straight line drawn instead of road geometry' });
  return [
    { latitude: fromCoord.latitude, longitude: fromCoord.longitude },
    { latitude: toCoord.latitude, longitude: toCoord.longitude },
  ];
}

async function fetchOsrmRoute(fromCoord, toCoord, profile, name) {
  const url = `https://router.project-osrm.org/route/v1/${profile}/${fromCoord.longitude},${fromCoord.latitude};${toCoord.longitude},${toCoord.latitude}?overview=full&geometries=geojson`;
  const res = await loggedFetch(url, { name, feature: FEATURES.NAV, timeoutMs: 6000 });
  if (!res.ok || !res.json) return null;
  if (res.json.code !== 'Ok' || !res.json.routes?.length) {
    log.warn(FEATURES.NAV, `${name}.no_route`, { code: res.json.code, message: res.json.message });
    return null;
  }
  return res.json.routes[0];
}

/**
 * Real driving distance between two points (meters), used for meter fares.
 * Returns null when unavailable; callers then fall back to straight-line × detour factor.
 */
export async function fetchRoadDistance(fromCoord, toCoord) {
  if (!fromCoord || !toCoord) return null;
  const route = await fetchOsrmRoute(fromCoord, toCoord, 'driving', 'osrm.distance');
  if (!route || !Number.isFinite(route.distance)) return null;
  log.info(FEATURES.FARE, 'road_distance.ok', {
    meters: Math.round(route.distance),
    durationSec: Math.round(route.duration),
  });
  return { meters: route.distance, durationSec: route.duration };
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
  cityId = 'bengaluru',
  roadMeters,
}) {
  // If seniorMode is active, minimize walking to under 250m
  const isLongDistance = seniorMode ? distanceMeters > 250 : distanceMeters > 800;
  const defaultMode = isLongDistance ? 'auto' : 'walk';

  const walkMin = estimateWalkMinutes(distanceMeters);
  const autoMin = Math.max(3, Math.round(distanceMeters / 340) + 2);
  const bikeMin = Math.max(2, Math.round(distanceMeters / 420) + 1);
  const busMin = Math.max(5, Math.round(distanceMeters / 250) + 3);
  const cabMin = Math.max(4, Math.round(distanceMeters / 300) + 3);

  const dynamicFare = getFareMatrix(distanceMeters, new Date(), { cityId, roadMeters, where: legType || id });
  const { auto: autoOfficial, cab: cabOfficial, bike: bikeOfficial } = dynamicFare.official;
  const autoMeterFare = autoOfficial.fare;
  const bikeFare = bikeOfficial.fare;
  const cabFare = cabOfficial.fare;
  const busFare = 10;
  const approx = autoOfficial.distanceSource === 'estimated' ? '~' : '';
  const nightNote = autoOfficial.isNight ? ` (${autoOfficial.tariff.night.label})` : '';

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
      fare: autoMeterFare,
      meterFare: autoMeterFare,
      fareOfficial: autoOfficial,
      dynamicFare,
      title: `Auto to ${locationName}`,
      meta: `${formatDistance(distanceMeters)} · ~${autoMin} min · Meter ${approx}₹${autoMeterFare}${nightNote}`,
      details: seniorMode
        ? `Senior/Family Pick: Hop into a meter auto (~${autoMin} min). Official meter fare ${approx}₹${autoMeterFare}.`
        : `Take an auto (~${autoMin} min). Official meter fare ${approx}₹${autoMeterFare}${nightNote}. App autos set their own price.`,
      tip: `${dynamicFare.surge.label}. Ask for the meter; app prices are usually higher than the meter.`,
    },
    bike: {
      key: 'bike',
      label: 'Bike Taxi',
      icon: 'bike',
      emoji: '🛵',
      durationMinutes: bikeMin,
      fare: bikeFare,
      fareOfficial: bikeOfficial,
      title: `Bike Taxi to ${locationName}`,
      meta: `${formatDistance(distanceMeters)} · ~${bikeMin} min · ${bikeFare === null ? 'Price set by app' : `Official ${approx}₹${bikeFare}`}`,
      details:
        bikeFare === null
          ? `Rapido / Uber Moto (~${bikeMin} min). ${bikeOfficial.tariff?.legalStatus || 'No government bike-taxi tariff.'} Check the price in the app.`
          : `Rapido / Uber Moto (~${bikeMin} min). Official bike-taxi fare ${approx}₹${bikeFare}.`,
      tip: `Wear the helmet provided. Best for single commuter with light luggage.`,
    },
    cab: {
      key: 'cab',
      label: 'Cab',
      icon: 'cab',
      emoji: '🚕',
      durationMinutes: cabMin,
      fare: cabFare,
      fareOfficial: cabOfficial,
      title: `Cab to ${locationName}`,
      meta: `${formatDistance(distanceMeters)} · ~${cabMin} min · Official ${approx}₹${cabFare}`,
      details: `${cabOfficial.tariff?.label || 'Cab'}: ${approx}₹${cabFare} (~${cabMin} min). ${cabOfficial.tariff?.appNote || ''}`,
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
  const roadMeters = opts.roadDistanceMeters;

  const totalDirectDistance = getDistanceBetween(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude,
  );

  const originCoord = { latitude: origin.latitude, longitude: origin.longitude };
  const destCoord = { latitude: destination.latitude, longitude: destination.longitude };
  const cityId = opts.cityId || detectCityFromCoord(origin.latitude, origin.longitude) || detectCityFromCoord(destination.latitude, destination.longitude) || 'bengaluru';

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
      cityId,
      roadMeters,
    });

    const shortAuto = getOfficialFare(cityId, 'auto', { straightMeters: totalDirectDistance, roadMeters }, 'short_hop');
    const shortCab = getOfficialFare(cityId, 'cab', { straightMeters: totalDirectDistance, roadMeters }, 'short_hop');
    const legitMeter = shortAuto.fare;
    const directCab = shortCab.fare;
    const savings = Math.max(0, (directCab || 0) - (shortLeg.cost || 0));

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
        streetQuote: null,
        cabFare: directCab,
        fareDistanceSource: shortAuto.distanceSource,
        cabDurationMinutes: 8,
        transitCost: shortLeg.cost,
        transitDurationMinutes: shortLeg.durationMinutes,
        moneySaved: savings,
        timeSaved: 2,
        dosaCount: 0,
        coffeeCount: 2,
        foodEquivalent: '2 Filter Coffees',
        tip: `Short distance. Walking is pleasant, or take a meter auto (official minimum ₹${shortAuto.tariff?.baseFare ?? legitMeter}).`,
        scamAlert: `The official auto meter fare for this trip is ₹${legitMeter}. Anything far above that is not the meter rate — ask for the meter.`,
      },
    };
  }


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
    const directAuto = getOfficialFare(cityId, 'auto', { straightMeters: totalDirectDistance, roadMeters }, 'direct');
    const directCabFare = getOfficialFare(cityId, 'cab', { straightMeters: totalDirectDistance, roadMeters }, 'direct');
    const legitAutoMeter = directAuto.fare;
    const directCab = directCabFare.fare;
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
      cityId,
      roadMeters,
    });

    const savings = Math.max(0, (directCab || 0) - (directLeg.cost || 0));
    let foodEquivalent = '';
    let scamAlert = '';
    let tip = '';

    if (cityId === 'delhi') {
      const choleCount = Math.floor(savings / 90);
      const chaiCount = Math.max(1, Math.floor((savings % 90) / 15));
      foodEquivalent = choleCount > 0 ? `${choleCount} Chole Bhature + ${chaiCount} Cutting Chais` : `${chaiCount} Cutting Chais`;
      scamAlert = `Official auto meter fare here is ₹${legitAutoMeter}. Station touts often quote far more without the meter — insist on the meter or use Delhi Metro.`;
      tip = `Auto meter fare: ₹${legitAutoMeter}. Metered taxi: ₹${directCab}. Delhi Metro connects key hubs fastest.`;
    } else if (cityId === 'mumbai') {
      const vadaCount = Math.floor(savings / 25);
      const chaiCount = Math.max(1, Math.floor((savings % 25) / 15));
      foodEquivalent = vadaCount > 0 ? `${vadaCount} Ashok Vada Pavs + ${chaiCount} Cutting Chais` : `${chaiCount} Cutting Chais`;
      scamAlert = `Mumbai taxis and autos strictly run by meter by law! Never agree to fixed street quotes.`;
      tip = `Auto meter fare: ₹${legitAutoMeter}. Kaali-peeli taxi meter: ₹${directCab}. Suburban local trains are much cheaper.`;
    } else {
      const dosaCount = Math.floor(savings / 85);
      const coffeeCount = Math.max(1, Math.floor((savings % 85) / 20));
      foodEquivalent = dosaCount > 0 ? `${dosaCount} Benne Dosas + ${coffeeCount} Filter Coffees` : `${coffeeCount} Filter Coffees`;
      scamAlert = `Official auto meter fare here is ₹${legitAutoMeter}. Drivers at busy spots often quote more without the meter — ask for the meter.`;
      tip = `Auto meter fare: ₹${legitAutoMeter}. Official cab fare: ₹${directCab}. App autos set their own price.`;
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
        streetQuote: null,
        cabFare: directCab,
        fareDistanceSource: directAuto.distanceSource,
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
    cityId,
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
    cityId,
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
  const metroCompareAuto = getOfficialFare(cityId, 'auto', { straightMeters: totalDirectDistance, roadMeters }, 'metro_compare');
  const metroCompareCab = getOfficialFare(cityId, 'cab', { straightMeters: totalDirectDistance, roadMeters }, 'metro_compare');
  const legitAutoFare = metroCompareAuto.fare;
  const fullCabFare = metroCompareCab.fare;
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
      streetQuote: null,
      cabFare: fullCabFare,
      fareDistanceSource: metroCompareAuto.distanceSource,
      cabDurationMinutes: cabTrafficMinutes,
      transitCost,
      transitDurationMinutes: transitMinutes,
      moneySaved,
      timeSaved,
      foodEquivalent,
      tip: `A cab at the official fare would cost ₹${fullCabFare} (~${cabTrafficMinutes} min in traffic). ${agencyName} costs ₹${transitCost} and takes ${transitMinutes} min.`,
      scamAlert: cityId === 'mumbai'
        ? `Mumbai autos and taxis must run by meter. Auto meter fare: ₹${legitAutoFare}.`
        : cityId === 'delhi'
          ? `Official auto meter fare: ₹${legitAutoFare}. Insist on the meter at railway stations.`
          : `Official auto meter fare: ₹${legitAutoFare}. Insist on the meter or take the metro.`,
    },
  };
}

/**
 * Direct Auto Rickshaw route (Door-to-door)
 */
export function planDirectAutoRoute(origin, destination, distanceMeters, cityId = 'bengaluru', opts = {}) {
  const originCoord = { latitude: origin.latitude, longitude: origin.longitude };
  const destCoord = { latitude: destination.latitude, longitude: destination.longitude };
  const destName = destination.name || destination.title || 'Destination';
  const roadMeters = opts.roadDistanceMeters;
  const autoFare = getOfficialFare(cityId, 'auto', { straightMeters: distanceMeters, roadMeters }, 'route_auto');
  const cabCompare = getOfficialFare(cityId, 'cab', { straightMeters: distanceMeters, roadMeters }, 'route_auto');
  const legitMeterFare = autoFare.fare;
  const distanceKm = autoFare.distanceKm || Math.max(0.5, distanceMeters / 1000);
  const approx = autoFare.distanceSource === 'estimated' ? '~' : '';
  const nightNote = autoFare.isNight ? ` · ${autoFare.tariff.night.label}` : '';
  const rideMin = opts.roadDurationSec
    ? Math.max(4, Math.round(opts.roadDurationSec / 60))
    : Math.max(4, Math.round(distanceKm * 3.2));
  const totalMin = rideMin + 3;

  const steps = [
    {
      id: 'auto_hail',
      type: 'walk',
      title: 'Hail a meter auto',
      meta: 'Street auto or app booking · 2-3 min',
      cost: 0,
      durationMinutes: 3,
      description: 'Ask for the meter. App autos (Uber / Ola / Rapido / Namma Yatri) set their own price, usually above the meter.',
      fromCoord: originCoord,
      toCoord: originCoord,
      coordinates: [originCoord, originCoord],
    },
    {
      id: 'auto_ride',
      type: 'auto',
      title: `Auto to ${destName}`,
      meta: `${autoFare.distanceSource === 'road' ? `${distanceKm} km by road` : `~${distanceKm} km road (est.)`} · ~${rideMin} min · Meter ${approx}₹${legitMeterFare}${nightNote}`,
      cost: legitMeterFare,
      durationMinutes: rideMin,
      description: 'Direct street ride via main roads without metro stairs or line transfers. Insist on meter or use app.',
      fromCoord: originCoord,
      toCoord: destCoord,
      coordinates: [originCoord, destCoord],
    },
  ];

  const milestones = [
    {
      id: 'm_auto_start',
      coordinate: originCoord,
      label: 'Start',
      title: origin.name || 'Your Location',
      type: 'origin',
      stepIndex: 0,
    },
    {
      id: 'm_auto_dest',
      coordinate: destCoord,
      label: 'End',
      title: destName,
      type: 'destination',
      stepIndex: 1,
    },
  ];

  return {
    id: 'route_direct_auto',
    mode: 'auto',
    type: 'direct_auto',
    title: `Direct Auto to ${destName}`,
    totalDurationMinutes: totalMin,
    totalCost: legitMeterFare,
    totalDistanceText: roadMeters ? `${formatDistance(roadMeters)} by road` : formatDistance(distanceMeters),
    fareDetail: autoFare,
    routeCategory: 'Direct Auto (Door-to-Door)',
    coordinates: [originCoord, destCoord],
    milestones,
    steps,
    cityId,
    autoAdvisory: {
      fare: legitMeterFare,
      streetQuote: null,
      cabFare: cabCompare.fare,
      fareDistanceSource: autoFare.distanceSource,
      tip: `Official meter fare: ${approx}₹${legitMeterFare} (${autoFare.breakdown?.base}, ${autoFare.breakdown?.perKm}).`,
      scamAlert: `If a driver refuses the meter, the fair price is still ${approx}₹${legitMeterFare}.`,
    },
  };
}

/**
 * Direct cab route — official cab / taxi tariff of the city.
 */
export function planDirectCabRoute(origin, destination, distanceMeters, cityId = 'bengaluru', opts = {}) {
  const originCoord = { latitude: origin.latitude, longitude: origin.longitude };
  const destCoord = { latitude: destination.latitude, longitude: destination.longitude };
  const destName = destination.name || destination.title || 'Destination';
  const roadMeters = opts.roadDistanceMeters;
  const cabOfficial = getOfficialFare(cityId, 'cab', { straightMeters: distanceMeters, roadMeters }, 'route_cab');
  const cabFare = cabOfficial.fare;
  const distanceKm = cabOfficial.distanceKm || Math.max(0.5, distanceMeters / 1000);
  const approx = cabOfficial.distanceSource === 'estimated' ? '~' : '';
  const driveMin = opts.roadDurationSec
    ? Math.max(5, Math.round(opts.roadDurationSec / 60))
    : Math.max(5, Math.round(distanceKm * 3.6));
  const totalMin = driveMin + 5;

  const steps = [
    {
      id: 'cab_pickup',
      type: 'walk',
      title: 'Book a cab (Uber / Ola / taxi)',
      meta: 'Pickup at doorstep · 4-5 min wait',
      cost: 0,
      durationMinutes: 5,
      description: 'Driver arrives directly at your exact GPS pickup pin.',
      fromCoord: originCoord,
      toCoord: originCoord,
      coordinates: [originCoord, originCoord],
    },
    {
      id: 'cab_drive',
      type: 'cab',
      title: `AC Cab to ${destName}`,
      meta: `${cabOfficial.distanceSource === 'road' ? `${distanceKm} km by road` : `~${distanceKm} km road (est.)`} · ~${driveMin} min · Official ${approx}₹${cabFare}`,
      cost: cabFare,
      durationMinutes: driveMin,
      description: `${cabOfficial.tariff?.label || 'Cab'}: ${cabOfficial.breakdown?.base}, ${cabOfficial.breakdown?.perKm}. ${cabOfficial.tariff?.appNote || ''}`,
      fromCoord: originCoord,
      toCoord: destCoord,
      coordinates: [originCoord, destCoord],
    },
  ];

  const milestones = [
    {
      id: 'm_cab_start',
      coordinate: originCoord,
      label: 'Start',
      title: origin.name || 'Your Location',
      type: 'origin',
      stepIndex: 0,
    },
    {
      id: 'm_cab_dest',
      coordinate: destCoord,
      label: 'End',
      title: destName,
      type: 'destination',
      stepIndex: 1,
    },
  ];

  return {
    id: 'route_direct_cab',
    mode: 'cab',
    type: 'direct_cab',
    title: `Direct Cab to ${destName}`,
    totalDurationMinutes: totalMin,
    totalCost: cabFare,
    totalDistanceText: roadMeters ? `${formatDistance(roadMeters)} by road` : formatDistance(distanceMeters),
    fareDetail: cabOfficial,
    routeCategory: 'Direct Cab (AC Comfort)',
    coordinates: [originCoord, destCoord],
    milestones,
    steps,
    cityId,
    autoAdvisory: {
      fare: cabFare,
      streetQuote: null,
      cabFare,
      fareDistanceSource: cabOfficial.distanceSource,
      tip: 'Door-to-door ride. Good for luggage and bad weather.',
      scamAlert: cabOfficial.tariff?.appNote || 'App cab prices are set by the app.',
    },
  };
}

/**
 * Direct City Bus route (BMTC / DTC / BEST)
 */
export function planDirectBusRoute(origin, destination, distanceMeters, cityId = 'bengaluru', opts = {}) {
  const originCoord = { latitude: origin.latitude, longitude: origin.longitude };
  const destCoord = { latitude: destination.latitude, longitude: destination.longitude };
  const destName = destination.name || destination.title || 'Destination';
  const distanceKm = Math.max(0.5, distanceMeters / 1000);

  let agencyName = 'BMTC Bus';
  let busFare = 15;
  if (cityId === 'delhi') {
    agencyName = 'DTC Bus';
    busFare = Math.min(25, Math.max(10, Math.round(10 + distanceKm * 1.5)));
  } else if (cityId === 'mumbai') {
    agencyName = 'BEST Bus';
    busFare = Math.min(20, Math.max(6, Math.round(6 + distanceKm * 1.2)));
  } else {
    // Bengaluru
    agencyName = 'BMTC Bus';
    busFare = Math.min(30, Math.max(15, Math.round(15 + distanceKm * 1.8)));
  }

  const busRideMin = Math.max(6, Math.round(distanceKm * 4.4));
  const totalMin = busRideMin + 8;

  const steps = [
    {
      id: 'bus_walk_stop',
      type: 'walk',
      title: `Walk to ${agencyName} Stop`,
      meta: '150-200m · ~4 min',
      cost: 0,
      durationMinutes: 4,
      description: `Walk to the nearest ${agencyName} bus stop.`,
      fromCoord: originCoord,
      toCoord: originCoord,
      coordinates: [originCoord, originCoord],
    },
    {
      id: 'bus_ride',
      type: 'bus',
      title: `${agencyName} to ${destName}`,
      meta: `${formatDistance(distanceMeters)} · ~${busRideMin} min · ₹${busFare}`,
      cost: busFare,
      durationMinutes: busRideMin,
      description: 'Hop on city bus line. Buy ticket from conductor or tap digital card.',
      fromCoord: originCoord,
      toCoord: destCoord,
      coordinates: [originCoord, destCoord],
    },
    {
      id: 'bus_walk_dest',
      type: 'walk',
      title: `Walk to ${destName}`,
      meta: '100m · ~4 min',
      cost: 0,
      durationMinutes: 4,
      description: 'Alight at the bus stop and walk a short distance to destination.',
      fromCoord: destCoord,
      toCoord: destCoord,
      coordinates: [destCoord, destCoord],
    },
  ];

  const milestones = [
    {
      id: 'm_bus_start',
      coordinate: originCoord,
      label: 'Start',
      title: origin.name || 'Your Location',
      type: 'origin',
      stepIndex: 0,
    },
    {
      id: 'm_bus_board',
      coordinate: originCoord,
      label: 'Bus',
      title: `${agencyName} Stop`,
      type: 'station',
      stepIndex: 1,
    },
    {
      id: 'm_bus_dest',
      coordinate: destCoord,
      label: 'End',
      title: destName,
      type: 'destination',
      stepIndex: 2,
    },
  ];

  return {
    id: 'route_direct_bus',
    mode: 'bus',
    type: 'direct_bus',
    title: `${agencyName} to ${destName}`,
    totalDurationMinutes: totalMin,
    totalCost: busFare,
    totalDistanceText: formatDistance(distanceMeters),
    routeCategory: `City Bus (${agencyName})`,
    coordinates: [originCoord, destCoord],
    milestones,
    steps,
    cityId,
    autoAdvisory: {
      fare: busFare,
      streetQuote: null,
      cabFare: getOfficialFare(cityId, 'cab', { straightMeters: distanceMeters, roadMeters: opts.roadDistanceMeters }, 'route_bus').fare,
      tip: `Cheapest way to travel across ${cityId}. Pass holders travel free.`,
      scamAlert: `Official ticket is strictly ₹${busFare}. Collect physical ticket from conductor.`,
    },
  };
}

/**
 * Plans complete multi-modal route alternatives:
 * 1. Metro Combo (Auto + Metro + Auto)
 * 2. Direct Auto (Door-to-door, fastest for < 4.5km)
 * 3. Direct Cab (AC comfort, luggage)
 * 4. City Bus (Most economical)
 */
export function planMultimodalRoutes(origin, destination, departureTime = new Date(), opts = {}) {
  if (!origin || !destination) return null;

  const originCoord = { latitude: origin.latitude, longitude: origin.longitude };
  const destCoord = { latitude: destination.latitude, longitude: destination.longitude };
  const totalDirectDistance = getDistanceBetween(
    originCoord.latitude,
    originCoord.longitude,
    destCoord.latitude,
    destCoord.longitude,
  );
  const distanceKm = Math.max(0.5, totalDirectDistance / 1000);
  const cityId = opts.cityId || detectCityFromCoord(origin.latitude, origin.longitude) || detectCityFromCoord(destination.latitude, destination.longitude) || 'bengaluru';

  const metroRoute = planTransitRoute(origin, destination, departureTime, opts);
  if (metroRoute) {
    metroRoute.mode = 'metro';
  }

  const autoRoute = planDirectAutoRoute(origin, destination, totalDirectDistance, cityId, opts);
  const cabRoute = planDirectCabRoute(origin, destination, totalDirectDistance, cityId, opts);
  const busRoute = planDirectBusRoute(origin, destination, totalDirectDistance, cityId, opts);

  const tripDistanceText = opts.roadDistanceMeters
    ? `${formatDistance(opts.roadDistanceMeters)} by road`
    : formatDistance(totalDirectDistance);

  // Short trip (< 4.5km): Direct Auto is fastest
  const isShortDistance = totalDirectDistance < 4500;
  const recommendedMode = isShortDistance ? 'auto' : 'metro';
  const busName = cityId === 'delhi' ? 'DTC Bus' : cityId === 'mumbai' ? 'BEST Bus' : 'BMTC Bus';

  const options = [
    {
      id: 'metro',
      mode: 'metro',
      title: 'Metro Combo',
      icon: '🚇',
      tag: isShortDistance ? 'Rail Combo' : '🛡️ Traffic-Free',
      durationMinutes: metroRoute.totalDurationMinutes,
      cost: metroRoute.totalCost,
      isFastest: metroRoute.totalDurationMinutes < autoRoute.totalDurationMinutes,
      isCheapest: false,
      route: metroRoute,
    },
    {
      id: 'auto',
      mode: 'auto',
      title: 'Direct Auto',
      icon: '🛺',
      tag: isShortDistance ? '⚡ Fastest' : 'Door-to-Door',
      durationMinutes: autoRoute.totalDurationMinutes,
      cost: autoRoute.totalCost,
      isFastest: autoRoute.totalDurationMinutes <= metroRoute.totalDurationMinutes,
      isCheapest: false,
      route: autoRoute,
    },
    {
      id: 'cab',
      mode: 'cab',
      title: 'Direct Cab',
      icon: '🚕',
      tag: '❄️ AC Comfort',
      durationMinutes: cabRoute.totalDurationMinutes,
      cost: cabRoute.totalCost,
      isFastest: false,
      isCheapest: false,
      route: cabRoute,
    },
    {
      id: 'bus',
      mode: 'bus',
      title: busName,
      icon: '🚌',
      tag: '💰 Best Fare',
      durationMinutes: busRoute.totalDurationMinutes,
      cost: busRoute.totalCost,
      isFastest: false,
      isCheapest: true,
      route: busRoute,
    },
  ];

  return {
    origin,
    destination,
    distanceMeters: totalDirectDistance,
    // Road km when OSRM answered, otherwise straight-line km (distanceIsRoad says which).
    distanceKm: parseFloat(((opts.roadDistanceMeters || totalDirectDistance) / 1000).toFixed(1)),
    distanceIsRoad: Boolean(opts.roadDistanceMeters),
    isShortDistance,
    recommendedMode,
    recommendationReason: isShortDistance
      ? `Short trip (${tripDistanceText}): Direct auto takes ~${autoRoute.totalDurationMinutes} min, avoiding metro stairs and transfer delays.`
      : `Long trip (${tripDistanceText}): Metro rail avoids road traffic jams and saves money vs cab.`,
    routes: {
      metro: metroRoute,
      auto: autoRoute,
      cab: cabRoute,
      bus: busRoute,
    },
    options,
  };
}

/**
 * Asynchronously enriches walking and driving steps with actual OSRM road geometry
 * so that polyline wraps real street curves instead of straight lines.
 */
export async function enrichRouteWithRealRoads(baseRoute) {
  if (!baseRoute || !baseRoute.steps) return baseRoute;

  const enrichedSteps = [...baseRoute.steps];
  let changed = false;

  for (let i = 0; i < enrichedSteps.length; i++) {
    const step = enrichedSteps[i];
    const isConnect =
      step.type === 'connecting_leg' ||
      step.type === 'walk' ||
      step.type === 'auto' ||
      step.type === 'cab' ||
      step.type === 'bus' ||
      step.type === 'direct_auto' ||
      step.type === 'direct_cab' ||
      step.type === 'direct_bus';
    const zeroLength =
      step.fromCoord &&
      step.toCoord &&
      step.fromCoord.latitude === step.toCoord.latitude &&
      step.fromCoord.longitude === step.toCoord.longitude;
    if (isConnect && step.fromCoord && step.toCoord && !zeroLength) {
      const mode = (step.selectedMode === 'walk' || step.type === 'walk') ? 'walking' : 'driving';
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
