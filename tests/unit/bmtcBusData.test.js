import {
  BMTC_ROUTES,
  BMTC_DAILY_PASSES,
  calculateUpcomingBusDepartures,
  findBusesForLocation,
  getBmtcRoutesByType,
} from '../../app/data/bmtcBusData';

describe('BMTC Bus Schedules and Route Finder Engine', () => {
  describe('BMTC_ROUTES Dataset Integrity', () => {
    it('contains valid curated routes covering Metro Feeders, Trunks, and Airport Vayu Vajra', () => {
      expect(BMTC_ROUTES.length).toBeGreaterThanOrEqual(10);

      const types = BMTC_ROUTES.map((r) => r.type);
      expect(types).toContain('metro_feeder');
      expect(types).toContain('trunk');
      expect(types).toContain('airport');
    });

    it('ensures every route has required metadata, fare range, stops, and timetable timings', () => {
      BMTC_ROUTES.forEach((route) => {
        expect(route.routeNumber).toBeDefined();
        expect(route.name).toBeDefined();
        expect(route.origin).toBeDefined();
        expect(route.destination).toBeDefined();
        expect(route.fare).toBeDefined();
        expect(route.stops.length).toBeGreaterThan(1);
        expect(typeof route.firstBus).toBe('string');
        expect(typeof route.lastBus).toBe('string');
        expect(route.frequencyMinutes).toBeGreaterThan(0);
      });
    });

    it('provides valid BMTC daily passes (Ordinary ₹70 and Vajra ₹140)', () => {
      expect(BMTC_DAILY_PASSES.length).toBeGreaterThanOrEqual(2);
      BMTC_DAILY_PASSES.forEach((p) => {
        expect(p.name).toBeDefined();
        expect(p.price).toBeGreaterThan(0);
        expect(p.coverage).toBeDefined();
        expect(p.howToBuy).toBeDefined();
      });
    });
  });

  describe('findBusesForLocation', () => {
    it('finds metro feeder buses connecting Majestic station', () => {
      const results = findBusesForLocation('Majestic');
      expect(results.length).toBeGreaterThan(0);
      const routeNumbers = results.map((r) => r.routeNumber);
      expect(routeNumbers).toContain('MF-12');
      expect(routeNumbers).toContain('KIA-9');
    });

    it('finds Silk Board routes (500-D trunk and KIA-8)', () => {
      const results = findBusesForLocation('Silk Board');
      expect(results.length).toBeGreaterThan(0);
      const routeNumbers = results.map((r) => r.routeNumber);
      expect(routeNumbers).toContain('500-D');
      expect(routeNumbers).toContain('KIA-8');
    });

    it('finds Indiranagar feeder buses (MF-21)', () => {
      const results = findBusesForLocation('Indiranagar');
      expect(results.length).toBeGreaterThan(0);
      const hasMF21 = results.some((r) => r.routeNumber === 'MF-21');
      expect(hasMF21).toBe(true);
    });

    it('handles query normalization without hyphen (e.g. 500D matches 500-D)', () => {
      const results = findBusesForLocation('500D');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].routeNumber).toBe('500-D');
    });

    it('is case-insensitive and handles partial names', () => {
      const lowerResults = findBusesForLocation('whitefield');
      const upperResults = findBusesForLocation('WHITEFIELD');
      expect(lowerResults.length).toBe(upperResults.length);
      expect(lowerResults.length).toBeGreaterThan(0);
    });

    it('returns empty array when no route matches query', () => {
      const results = findBusesForLocation('xyzNonExistentLocation123');
      expect(results).toEqual([]);
    });
  });

  describe('getBmtcRoutesByType', () => {
    it('filters strictly by type', () => {
      const feederRoutes = getBmtcRoutesByType('metro_feeder');
      expect(feederRoutes.length).toBeGreaterThan(0);
      feederRoutes.forEach((r) => expect(r.type).toBe('metro_feeder'));

      const airportRoutes = getBmtcRoutesByType('airport');
      expect(airportRoutes.length).toBeGreaterThan(0);
      airportRoutes.forEach((r) => expect(r.type).toBe('airport'));
    });
  });

  describe('calculateUpcomingBusDepartures', () => {
    it('calculates upcoming departures with valid countdown minutes during daytime service', () => {
      const route = BMTC_ROUTES.find((r) => r.routeNumber === 'MF-18');
      expect(route).toBeDefined();

      const middayDate = new Date('2026-09-30T10:15:00');
      const upcoming = calculateUpcomingBusDepartures(route, middayDate);

      expect(upcoming.isServiceActive).toBe(true);
      expect(upcoming.departures.length).toBeGreaterThanOrEqual(1);
      expect(upcoming.departures[0].minutesUntil).toBeGreaterThanOrEqual(0);
      expect(upcoming.nextDepartureText).toContain('min');
    });

    it('marks service as inactive during deep night hours for day-only feeders', () => {
      const route = BMTC_ROUTES.find((r) => r.routeNumber === 'MF-18'); // Operates 05:30 AM to 23:15 PM
      expect(route).toBeDefined();

      const deepNightDate = new Date('2026-09-30T02:30:00');
      const upcoming = calculateUpcomingBusDepartures(route, deepNightDate);

      expect(upcoming.isServiceActive).toBe(false);
      expect(upcoming.nextDepartureText).toContain('05:30');
    });

    it('handles 24/7 airport Vayu Vajra routes (e.g. KIA-9) with departures throughout the night', () => {
      const kiaRoute = BMTC_ROUTES.find((r) => r.routeNumber === 'KIA-9');
      expect(kiaRoute).toBeDefined();

      const lateNightDate = new Date('2026-09-30T03:10:00');
      const upcoming = calculateUpcomingBusDepartures(kiaRoute, lateNightDate);

      expect(upcoming.isServiceActive).toBe(true);
      expect(upcoming.departures.length).toBeGreaterThanOrEqual(1);
    });
  });
});
