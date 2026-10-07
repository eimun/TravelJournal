import {
  PURPLE_STATIONS,
  GREEN_STATIONS,
  getNextMetroDeparture,
  calculateMetroFare,
  findNearestMetroStation,
  getMajesticInterchangeGuide,
  getMetroPlatformAndGateInfo,
} from '../../app/data/transitData';
import {
  planTransitRoute,
  planMultimodalRoutes,
  planDirectAutoRoute,
  planDirectCabRoute,
  planDirectBusRoute,
  buildConnectingLeg,
} from '../../app/services/directionsService';
import { formatDistance, estimateWalkMinutes } from '../../app/services/locationService';

describe('transitData & Routing Service', () => {
  it('contains complete Purple and Green line stations with coordinates', () => {
    expect(PURPLE_STATIONS.length).toBeGreaterThanOrEqual(35);
    expect(GREEN_STATIONS.length).toBeGreaterThanOrEqual(28);

    const majesticPurple = PURPLE_STATIONS.find((s) => s.isInterchange);
    const majesticGreen = GREEN_STATIONS.find((s) => s.isInterchange);

    expect(majesticPurple).toBeDefined();
    expect(majesticGreen).toBeDefined();
  });

  it('calculates accurate metro fares according to Namma Metro fare stages', () => {
    expect(calculateMetroFare(1)).toBe(10);
    expect(calculateMetroFare(3)).toBe(15);
    expect(calculateMetroFare(5)).toBe(25);
    expect(calculateMetroFare(9)).toBe(35);
    expect(calculateMetroFare(14)).toBe(45);
    expect(calculateMetroFare(20)).toBe(55);
    expect(calculateMetroFare(30)).toBe(60);
  });

  it('computes real-time next train departures accurately', () => {
    // 9:30 AM (Peak hours)
    const peakDate = new Date(2026, 8, 14, 9, 30);
    const peakDeparture = getNextMetroDeparture('p19', 'purple', peakDate);
    expect(peakDeparture.status).toBe('running');
    expect(peakDeparture.frequencyMinutes).toBe(5);
    expect(peakDeparture.nextInMinutes).toBeGreaterThanOrEqual(1);
    expect(peakDeparture.departures.length).toBeGreaterThanOrEqual(3);
    expect(peakDeparture.departures[0].timeFormatted).toBeDefined();
    expect(peakDeparture.operatingHours).toContain('05:00 AM');

    // 2:00 AM (Closed night hours)
    const nightDate = new Date(2026, 8, 14, 2, 0);
    const nightDeparture = getNextMetroDeparture('p19', 'purple', nightDate);
    expect(nightDeparture.status).toBe('closed');
    expect(nightDeparture.scheduledTime).toContain('05:00 AM');
  });

  it('buildConnectingLeg matches relevant BMTC route and attaches today upcoming departures', () => {
    const leg = buildConnectingLeg({
      id: 'last_mile_test',
      legType: 'last_mile',
      locationName: 'Whitefield',
      fromCoord: { latitude: 12.9909, longitude: 77.6525 },
      toCoord: { latitude: 12.9877, longitude: 77.7289 },
      distanceMeters: 2500,
    });

    expect(leg.modes.bus).toBeDefined();
    expect(leg.matchedBus).toBeDefined();
    expect(leg.busSchedule).toBeDefined();
    expect(leg.busSchedule.departures.length).toBeGreaterThanOrEqual(1);
    expect(leg.busSchedule.departures[0].timeFormatted).toBeDefined();
  });

  it('finds the closest metro station to given coordinates', () => {
    // Coordinates near MG Road
    const station = findNearestMetroStation(12.9754, 77.6067);
    expect(station).toBeDefined();
    expect(station.name).toContain('MG Road');
    expect(station.line).toBe('purple');
  });

  it('provides exact Majestic interchange guidance between Purple and Green lines', () => {
    const pToG = getMajesticInterchangeGuide('purple', 'green');
    expect(pToG.title).toContain('Majestic');
    expect(pToG.steps.length).toBeGreaterThanOrEqual(4);
    expect(pToG.steps[1]).toContain('GREEN');

    const gToP = getMajesticInterchangeGuide('green', 'purple');
    expect(gToP.steps[1]).toContain('PURPLE');
  });

  it('plans a direct metro route on the same line (MG Road to Indiranagar)', () => {
    const origin = { latitude: 12.9754, longitude: 77.6067, name: 'MG Road' };
    const destination = {
      latitude: 12.9783,
      longitude: 77.6387,
      name: 'Indiranagar 100ft Rd',
    };

    const route = planTransitRoute(origin, destination);
    expect(route).toBeDefined();
    expect(route.type).toBe('transit_metro');
    expect(route.isSameLine).toBe(true);
    expect(route.totalCost).toBeGreaterThan(0);
    expect(route.steps.length).toBeGreaterThanOrEqual(3); // walk, metro, walk
  });

  it('plans an interchange metro route across Purple and Green lines (MG Road to Lalbagh)', () => {
    const origin = { latitude: 12.9754, longitude: 77.6067, name: 'MG Road' }; // Purple
    const destination = {
      latitude: 12.9507,
      longitude: 77.5848,
      name: 'Lalbagh Botanical Garden',
    }; // Green

    const route = planTransitRoute(origin, destination);
    expect(route).toBeDefined();
    expect(route.type).toBe('transit_metro');
    expect(route.isSameLine).toBe(false);

    // Verify Majestic transfer step is present
    const transferStep = route.steps.find((s) => s.id === 'majestic_transfer');
    expect(transferStep).toBeDefined();
    expect(transferStep.title).toContain('Nadaprabhu Kempegowda');
  });

  it('calculates realistic travel duration (>40 min) for 14.6 km route to Lalbagh Botanical Garden', () => {
    const origin = { latitude: 12.9688, longitude: 77.7126, name: 'Kundalahalli' };
    const destination = {
      latitude: 12.9507,
      longitude: 77.5848,
      name: 'Lalbagh Botanical Garden',
    };

    const route = planTransitRoute(origin, destination);
    expect(route).toBeDefined();
    expect(route.totalDurationMinutes).toBeGreaterThanOrEqual(40);
    expect(route.totalDurationMinutes).toBeLessThan(75);

    // Every step must have positive duration
    route.steps.forEach((step) => {
      expect(step.durationMinutes).toBeGreaterThan(0);
    });
  });

  it('formats distances and walk times properly', () => {
    expect(formatDistance(450)).toBe('450 m');
    expect(formatDistance(2300)).toBe('2.3 km');
    expect(estimateWalkMinutes(750)).toBe(10);
  });

  it('searches Bengaluru locations and handles hubs, areas, and metro stations', async () => {
    const { searchBengaluruLocations } = require('../../app/services/searchService');

    const hsrResults = await searchBengaluruLocations('HSR');
    expect(hsrResults.length).toBeGreaterThan(0);
    expect(hsrResults.some((r) => r.name.includes('HSR'))).toBe(true);

    const btmResults = await searchBengaluruLocations('BTM');
    expect(btmResults.length).toBeGreaterThan(0);
    expect(btmResults.some((r) => r.name.includes('BTM'))).toBe(true);

    const metroResults = await searchBengaluruLocations('Kengeri');
    expect(metroResults.length).toBeGreaterThan(0);
    expect(metroResults.some((r) => r.name.includes('Kengeri'))).toBe(true);

    // Search for Polaris School of Technology
    const polarisResults = await searchBengaluruLocations('polaris school of technology');
    expect(polarisResults.length).toBeGreaterThan(0);
    expect(polarisResults.some((r) => r.name.includes('Polaris'))).toBe(true);
    expect(polarisResults[0].area).toContain('Brookefield');
    expect(polarisResults[0].nearestMetro).toContain('Kundalahalli');

    // Search for custom unknown landmark
    const customResults = await searchBengaluruLocations('My Custom Studio in Brookefield');
    expect(customResults.length).toBeGreaterThan(0);
    expect(customResults[0].name).toContain('My Custom Studio');
  });

  it('suggests Auto, Bike, Cab, and Bus comparison instead of 26-min long walk for 1.9 km Kundalahalli', () => {
    const { buildConnectingLeg } = require('../../app/services/directionsService');

    const leg = buildConnectingLeg({
      id: 'kundalahalli_leg',
      legType: 'last_mile',
      locationName: 'Kundalahalli Gate',
      fromCoord: { latitude: 12.9688, longitude: 77.7126 },
      toCoord: { latitude: 12.9592, longitude: 77.7188 },
      distanceMeters: 1900,
    });

    expect(leg.isLongDistance).toBe(true);
    // Defaults to Auto rather than walking 26 minutes!
    expect(leg.defaultMode).toBe('auto');
    expect(leg.modes).toBeDefined();

    // Contains all 5 modes with price and time
    expect(leg.modes.auto).toBeDefined();
    expect(leg.modes.bike).toBeDefined();
    expect(leg.modes.cab).toBeDefined();
    expect(leg.modes.bus).toBeDefined();
    expect(leg.modes.walk).toBeDefined();

    // Auto fare & duration
    expect(leg.modes.auto.fare).toBeGreaterThanOrEqual(30);
    expect(leg.modes.auto.durationMinutes).toBeLessThan(12);

    // Bike Taxi fare & duration (cheaper than auto, faster)
    expect(leg.modes.bike.fare).toBeGreaterThanOrEqual(20);
    expect(leg.modes.bike.durationMinutes).toBeLessThanOrEqual(leg.modes.auto.durationMinutes);

    // Cab
    expect(leg.modes.cab.fare).toBeGreaterThanOrEqual(79);

    // BMTC Feeder Bus (economical ₹10)
    expect(leg.modes.bus.fare).toBe(10);

    // Walk duration around 25-26 min, flagged with warning
    expect(leg.modes.walk.durationMinutes).toBeGreaterThanOrEqual(25);
    expect(leg.modes.walk.details).toContain('Auto or Bike Taxi strongly recommended');
  });

  it('provides accurate platform directions and station gate recommendations', () => {
    // Indiranagar going towards Challaghatta (Westbound, toIdx > fromIdx)
    const indiranagarWest = getMetroPlatformAndGateInfo({
      stationId: 'p16',
      line: 'purple',
      fromIdx: 15,
      toIdx: 22,
    });
    expect(indiranagarWest.platform).toBe('Platform 2');
    expect(indiranagarWest.towards).toContain('Towards Challaghatta');
    expect(indiranagarWest.entryGate).toBe('Gate A');
    expect(indiranagarWest.exitGate).toBe('Gate B');

    // Indiranagar going towards Whitefield (Eastbound, toIdx < fromIdx)
    const indiranagarEast = getMetroPlatformAndGateInfo({
      stationId: 'p16',
      line: 'purple',
      fromIdx: 15,
      toIdx: 5,
    });
    expect(indiranagarEast.platform).toBe('Platform 1');
    expect(indiranagarEast.towards).toContain('Towards Whitefield');

    // Lalbagh (Green line) going South towards Silk Institute
    const lalbaghSouth = getMetroPlatformAndGateInfo({
      stationId: 'g14',
      line: 'green',
      fromIdx: 13,
      toIdx: 20,
    });
    expect(lalbaghSouth.platform).toBe('Platform 1');
    expect(lalbaghSouth.towards).toContain('Towards Silk Institute');
    expect(lalbaghSouth.exitGate).toBe('Gate 4');
  });

  it('calculates Direct Cab comparison, money savings, and food equivalents', () => {
    const origin = { latitude: 12.9784, longitude: 77.5726, name: 'Majestic' };
    const destination = { latitude: 12.9757, longitude: 77.6066, name: 'MG Road' };

    const route = planTransitRoute(origin, destination);
    expect(route).toBeDefined();
    expect(route.autoAdvisory).toBeDefined();

    const adv = route.autoAdvisory;
    expect(adv.cabFare).toBeGreaterThan(route.totalCost);
    expect(adv.moneySaved).toBeGreaterThan(0);
    expect(adv.foodEquivalent).toBeDefined();
    expect(adv.scamAlert).toContain('meter');
    expect(adv.fare).toBeGreaterThanOrEqual(30); // Base meter fare
  });

  it('prioritizes low-fatigue connections in Mom & Dad Mode (seniorMode)', () => {
    const origin = { latitude: 12.9784, longitude: 77.5726, name: 'Majestic' };
    const destination = { latitude: 12.9507, longitude: 77.5848, name: 'Lalbagh' };

    const seniorRoute = planTransitRoute(origin, destination, { seniorMode: true });
    expect(seniorRoute).toBeDefined();
    expect(seniorRoute.seniorMode).toBe(true);

    // Connecting legs in senior mode should default to auto if distance > 250m
    const firstMile = seniorRoute.steps.find((s) => s.id === 'first_mile');
    if (firstMile && firstMile.distanceMeters > 250) {
      expect(firstMile.selectedMode).toBe('auto');
    }
  });

  describe('Multi-Modal Route Alternatives (Auto, Metro, Cab, Bus)', () => {
    it('generates all 4 route options and recommends Direct Auto for short distance (< 4.5km)', () => {
      // MG Road to Cubbon Park (~1.8 km)
      const origin = { latitude: 12.9754, longitude: 77.6067, name: 'MG Road Metro' };
      const destination = { latitude: 12.9779, longitude: 77.5952, name: 'Cubbon Park' };

      const plan = planMultimodalRoutes(origin, destination, new Date(), { cityId: 'bengaluru' });
      expect(plan).toBeDefined();
      expect(plan.isShortDistance).toBe(true);
      expect(plan.recommendedMode).toBe('auto');
      expect(plan.routes.auto).toBeDefined();
      expect(plan.routes.metro).toBeDefined();
      expect(plan.routes.cab).toBeDefined();
      expect(plan.routes.bus).toBeDefined();

      expect(plan.options.length).toBe(4);
      const autoOpt = plan.options.find((o) => o.id === 'auto');
      expect(autoOpt).toBeDefined();
      expect(autoOpt.tag).toContain('Fastest');

      // Direct auto should take fewer minutes than navigating metro entry/exit for 1.8km
      expect(plan.routes.auto.totalDurationMinutes).toBeLessThan(plan.routes.metro.totalDurationMinutes);
    });

    it('recommends Metro Combo for long distance trips (> 5km)', () => {
      // Whitefield to Majestic (~18 km)
      const origin = { latitude: 12.9698, longitude: 77.7499, name: 'Whitefield' };
      const destination = { latitude: 12.9784, longitude: 77.5726, name: 'Majestic' };

      const plan = planMultimodalRoutes(origin, destination, new Date(), { cityId: 'bengaluru' });
      expect(plan).toBeDefined();
      expect(plan.isShortDistance).toBe(false);
      expect(plan.recommendedMode).toBe('metro');

      const metroOpt = plan.options.find((o) => o.id === 'metro');
      expect(metroOpt.tag).toContain('Traffic-Free');

      // Metro should be significantly cheaper than direct cab
      expect(plan.routes.metro.totalCost).toBeLessThan(plan.routes.cab.totalCost);
    });

    it('generates direct auto, cab, and bus routes with city-specific fares', () => {
      const origin = { latitude: 28.6328, longitude: 77.2195, name: 'Rajiv Chowk' };
      const destination = { latitude: 28.6129, longitude: 77.2295, name: 'India Gate' };
      const distMeters = 2800;

      const auto = planDirectAutoRoute(origin, destination, distMeters, 'delhi');
      expect(auto.mode).toBe('auto');
      expect(auto.totalCost).toBeGreaterThanOrEqual(30);
      expect(auto.steps.length).toBe(2);

      const cab = planDirectCabRoute(origin, destination, distMeters, 'delhi');
      expect(cab.mode).toBe('cab');
      expect(cab.totalCost).toBeGreaterThan(auto.totalCost);

      const bus = planDirectBusRoute(origin, destination, distMeters, 'delhi');
      expect(bus.mode).toBe('bus');
      expect(bus.title).toContain('DTC Bus');
      expect(bus.totalCost).toBeLessThanOrEqual(auto.totalCost);
    });
  });
});
