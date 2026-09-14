import {
  PURPLE_STATIONS,
  GREEN_STATIONS,
  getNextMetroDeparture,
  calculateMetroFare,
  findNearestMetroStation,
  getMajesticInterchangeGuide,
} from '../../app/data/transitData';
import { planTransitRoute } from '../../app/services/directionsService';
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

    // 2:00 AM (Closed night hours)
    const nightDate = new Date(2026, 8, 14, 2, 0);
    const nightDeparture = getNextMetroDeparture('p19', 'purple', nightDate);
    expect(nightDeparture.status).toBe('closed');
    expect(nightDeparture.scheduledTime).toContain('05:00 AM');
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
});
