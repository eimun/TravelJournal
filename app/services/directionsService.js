import {
  PURPLE_STATIONS,
  GREEN_STATIONS,
  findNearestMetroStation,
  getNextMetroDeparture,
  calculateMetroFare,
  getDistanceBetween,
  getMajesticInterchangeGuide,
  getMetroPlatformAndGateInfo,
} from '../data/transitData';
import { formatDistance, estimateWalkMinutes } from './locationService';
import { calculateDynamicFareMatrix } from '../../src/domain/dynamicFare';

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
      title: `BMTC Feeder Bus to ${locationName}`,
      meta: `${formatDistance(distanceMeters)} · ~${busMin} min · ₹${busFare}`,
      details: `BMTC metro feeder bus (MF-series). Economical choice (~${busMin} min). Stops right at station gate.`,
      tip: `Pay cash (₹10 note) or UPI QR via Tummoc / conductor scanner.`,
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
        title: destination.name,
        type: 'destination',
        stepIndex: 0,
      },
    ];

    const shortLeg = buildConnectingLeg({
      id: 's_short_direct',
      legType: 'first_mile',
      locationName: destination.name,
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
      title: `Direct to ${destination.name}`,
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

  // Find nearest metro stations
  const originStation = findNearestMetroStation(origin.latitude, origin.longitude);
  const destStation = findNearestMetroStation(destination.latitude, destination.longitude);

  const walkToOriginStationMeters = originStation
    ? getDistanceBetween(origin.latitude, origin.longitude, originStation.latitude, originStation.longitude)
    : Infinity;

  const walkFromDestStationMeters = destStation
    ? getDistanceBetween(destStation.latitude, destStation.longitude, destination.latitude, destination.longitude)
    : Infinity;

  // Case 2: Both near same station or metro not convenient -> direct commute
  const isSameStation = originStation && destStation && originStation.id === destStation.id;

  if (isSameStation || !originStation || !destStation) {
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
        title: destination.name,
        type: 'destination',
        stepIndex: 0,
      },
    ];

    const directLeg = buildConnectingLeg({
      id: 's_direct_auto',
      legType: 'first_mile',
      locationName: destination.name,
      fromCoord: originCoord,
      toCoord: destCoord,
      distanceMeters: totalDirectDistance,
      seniorMode,
    });

    const savings = Math.max(0, directCab - directLeg.cost);
    const dosaCount = Math.floor(savings / 85);
    const coffeeCount = Math.max(1, Math.floor((savings % 85) / 20));

    return {
      type: 'auto_bus',
      title: `Direct to ${destination.name}`,
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
        dosaCount,
        coffeeCount,
        foodEquivalent: dosaCount > 0 ? `${dosaCount} Benne Dosas + ${coffeeCount} Filter Coffees` : `${coffeeCount} Filter Coffees`,
        tip: `Fair meter fare is ~₹${legitAutoMeter}. Direct cab is ~₹${directCab}. If street auto asks more than ₹${streetQuote}, insist on meter or book via Namma Yatri.`,
        scamAlert: `Drivers at major spots quote ₹${streetQuote}+ without meter. Always ask for meter.`,
      },
    };
  }

  // Determine line paths
  const originLineList = originStation.line === 'purple' ? PURPLE_STATIONS : GREEN_STATIONS;
  const destLineList = destStation.line === 'purple' ? PURPLE_STATIONS : GREEN_STATIONS;

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
    locationName: `${originStation.name.split('(')[0]} Metro`,
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
    title: `${originStation.name.split('(')[0]} (${originStation.line === 'purple' ? 'Purple Line' : 'Green Line'})`,
    line: originStation.line,
    type: 'station',
    stepIndex: 1,
  });

  if (isSameLine) {
    // Single line travel (e.g. Purple -> Purple or Green -> Green)
    const stationsSlice =
      originIdx < destIdx
        ? originLineList.slice(originIdx, destIdx + 1)
        : originLineList.slice(destIdx, originIdx + 1).reverse();

    const stopCount = Math.abs(destIdx - originIdx);
    const metroRideMinutes = stopCount * 2.2;
    totalTime += metroRideMinutes;

    const metroFare = calculateMetroFare(stopCount);
    totalFare += metroFare;

    const departureInfo = getNextMetroDeparture(originStation.id, originStation.line, travelDateObj);

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
      title: `${originStation.line === 'purple' ? 'Purple Line' : 'Green Line'} · ${stopCount} stops`,
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
    // Line interchange needed at Majestic!
    const originMajesticIdx = originLineList.findIndex((s) => s.isInterchange);
    const destMajesticIdx = destLineList.findIndex((s) => s.isInterchange);

    const majesticStation = originLineList[originMajesticIdx];
    const majesticCoord = { latitude: majesticStation.latitude, longitude: majesticStation.longitude };

    // Leg 1: Origin Station -> Majestic
    const leg1Slice =
      originIdx < originMajesticIdx
        ? originLineList.slice(originIdx, originMajesticIdx + 1)
        : originLineList.slice(originMajesticIdx, originIdx + 1).reverse();

    const leg1Stops = Math.abs(originMajesticIdx - originIdx);
    const leg1Minutes = Math.max(2, leg1Stops * 2.2);
    totalTime += leg1Minutes;

    const departureLeg1 = getNextMetroDeparture(originStation.id, originStation.line, travelDateObj);
    const leg1Direction =
      originIdx < originMajesticIdx
        ? originLineList[originLineList.length - 1].name.split('(')[0].trim()
        : originLineList[0].name.split('(')[0].trim();

    const leg1GatePlatform = getMetroPlatformAndGateInfo({
      stationId: originStation.id,
      line: originStation.line,
      fromIdx: originIdx,
      toIdx: originMajesticIdx,
    });

    const leg1Coords = leg1Slice.map((st) => ({
      latitude: st.latitude,
      longitude: st.longitude,
    }));

    steps.push({
      id: 'metro_leg1',
      type: 'metro',
      line: originStation.line,
      title: `${originStation.line === 'purple' ? 'Purple Line' : 'Green Line'} to Majestic (${leg1Stops} stops)`,
      meta: `${originStation.name.split('(')[0]} → Majestic · ${Math.round(leg1Minutes)} min`,
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
        destStationName: 'Kempegowda Majestic',
      },
    });

    // Milestone 3: Majestic Interchange
    milestones.push({
      id: 'm_interchange',
      coordinate: majesticCoord,
      label: 'Transfer',
      title: 'Change Line at Majestic Station',
      type: 'transfer',
      stepIndex: 2,
    });

    // Step: Majestic Transfer
    const transferGuide = getMajesticInterchangeGuide(originStation.line, destStation.line);
    totalTime += 4;
    steps.push({
      id: 'majestic_transfer',
      type: 'transfer',
      title: 'Change Line at Nadaprabhu Kempegowda (Majestic)',
      meta: 'Transfer concourse · ~3-4 min walk · Free interchange',
      details: transferGuide.steps.join(' → '),
      tip: transferGuide.tip,
      icon: 'swap',
      cost: 0,
      durationMinutes: 4,
      coordinates: [majesticCoord, majesticCoord],
    });

    // Leg 2: Majestic -> Destination Station
    const leg2Slice =
      destMajesticIdx < destIdx
        ? destLineList.slice(destMajesticIdx, destIdx + 1)
        : destLineList.slice(destIdx, destMajesticIdx + 1).reverse();

    const leg2Stops = Math.abs(destIdx - destMajesticIdx);
    const leg2Minutes = Math.max(2, leg2Stops * 2.2);
    totalTime += leg2Minutes;

    const totalMetroStops = leg1Stops + leg2Stops;
    const combinedMetroFare = calculateMetroFare(totalMetroStops);
    totalFare += combinedMetroFare;

    const departureLeg2 = getNextMetroDeparture(
      'majestic',
      destStation.line,
      new Date(travelDateObj.getTime() + (firstMileStep.durationMinutes + leg1Minutes + 4) * 60 * 1000),
    );

    const leg2GatePlatform = getMetroPlatformAndGateInfo({
      stationId: destStation.id,
      line: destStation.line,
      fromIdx: destMajesticIdx,
      toIdx: destIdx,
    });

    // At Majestic: Platform 1/2 for Purple, Platform 3/4 for Green
    const majesticBoardPlatform = destStation.line === 'green'
      ? (destIdx > destMajesticIdx ? 'Platform 4 (Towards Silk Institute)' : 'Platform 3 (Towards Madavara)')
      : (destIdx > destMajesticIdx ? 'Platform 2 (Towards Challaghatta)' : 'Platform 1 (Towards Whitefield)');

    const leg2Coords = leg2Slice.map((st) => ({
      latitude: st.latitude,
      longitude: st.longitude,
    }));

    steps.push({
      id: 'metro_leg2',
      type: 'metro',
      line: destStation.line,
      title: `${destStation.line === 'purple' ? 'Purple Line' : 'Green Line'} to destination (${leg2Stops} stops)`,
      meta: `Majestic → ${destStation.name.split('(')[0]} · Combined ₹${combinedMetroFare} · ${Math.round(leg2Minutes)} min`,
      details: `Board from ${majesticBoardPlatform}.`,
      nextDeparture: departureLeg2,
      intermediateStations: leg2Slice.map((s) => s.name.split('(')[0].trim()),
      icon: 'train',
      cost: combinedMetroFare,
      durationMinutes: Math.round(leg2Minutes),
      coordinates: leg2Coords,
      platformInfo: {
        platform: majesticBoardPlatform,
        towards: leg2GatePlatform.towards,
        entryGate: 'Level 1/2 Paid Transfer',
        exitGate: leg2GatePlatform.exitGate,
        destGates: leg2GatePlatform.gates,
        originStationName: 'Majestic',
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

  // Step Last Mile: Multi-modal connection to Final Destination
  const lastMileStep = buildConnectingLeg({
    id: 'last_mile',
    legType: 'last_mile',
    locationName: destination.name,
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
    title: destination.name,
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

  const dosaCount = Math.floor(moneySaved / 85);
  const coffeeCount = Math.max(1, Math.floor((moneySaved % 85) / 20));
  const foodEquivalent = dosaCount > 0
    ? `${dosaCount} Benne Masala Dosas + ${coffeeCount} Filter Coffees`
    : `${coffeeCount} Filter Coffees`;

  return {
    type: 'transit_metro',
    title: `Via Namma Metro (${isSameLine ? 'Direct' : '1 Interchange at Majestic'})`,
    totalDurationMinutes: Math.round(totalTime),
    totalCost: totalFare,
    totalDistanceText: formatDistance(totalDirectDistance),
    routeCategory: isSameLine ? 'Direct Metro' : 'Metro with Interchange',
    coordinates: fullCoordinates,
    milestones,
    originStation,
    destStation,
    isSameLine,
    steps,
    seniorMode,
    autoAdvisory: {
      fare: legitAutoFare,
      streetQuote: streetAutoQuote,
      cabFare: fullCabFare,
      cabDurationMinutes: cabTrafficMinutes,
      transitCost,
      transitDurationMinutes: transitMinutes,
      moneySaved,
      timeSaved,
      dosaCount,
      coffeeCount,
      foodEquivalent,
      tip: `Direct cab would cost ~₹${fullCabFare} and get stuck in city traffic (${cabTrafficMinutes} min). Metro costs only ₹${transitCost} and takes ${transitMinutes} min!`,
      scamAlert: `Never pay street auto quotes of ₹${streetAutoQuote}+. Insist on meter (fair rate: ~₹${legitAutoFare}) or take the metro.`,
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
