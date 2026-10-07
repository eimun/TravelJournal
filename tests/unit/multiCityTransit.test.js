import {
  DMRC_YELLOW_STATIONS,
  DMRC_BLUE_STATIONS,
  DMRC_AIRPORT_STATIONS,
  MUMBAI_WESTERN_STATIONS,
  MUMBAI_CENTRAL_STATIONS,
  MUMBAI_METRO1_STATIONS,
  findNearestMetroStation,
  calculateMetroFare,
  getNextMetroDeparture,
  getRajivChowkInterchangeGuide,
  getDadarInterchangeGuide,
  getLineColor,
  getLineDisplayName,
  DMRC_YELLOW,
  DMRC_BLUE,
  MUMBAI_WESTERN,
  MUMBAI_CENTRAL,
} from '../../app/data/transitData';
import { planTransitRoute } from '../../app/services/directionsService';

describe('Multi-City Metro & Suburban Transit Systems', () => {
  describe('Delhi Metro (DMRC) Network', () => {
    test('contains comprehensive Yellow, Blue, and Airport Express lines', () => {
      expect(DMRC_YELLOW_STATIONS.length).toBeGreaterThanOrEqual(25);
      expect(DMRC_BLUE_STATIONS.length).toBeGreaterThanOrEqual(30);
      expect(DMRC_AIRPORT_STATIONS.length).toBeGreaterThanOrEqual(6);

      const rajivYellow = DMRC_YELLOW_STATIONS.find((s) => s.name.includes('Rajiv Chowk'));
      const rajivBlue = DMRC_BLUE_STATIONS.find((s) => s.name.includes('Rajiv Chowk'));
      expect(rajivYellow?.isInterchange).toBe(true);
      expect(rajivBlue?.isInterchange).toBe(true);
    });

    test('calculates accurate DMRC token fare slabs', () => {
      expect(calculateMetroFare(1, 'delhi')).toBe(10);
      expect(calculateMetroFare(4, 'delhi')).toBe(20);
      expect(calculateMetroFare(8, 'delhi')).toBe(30);
      expect(calculateMetroFare(16, 'delhi')).toBe(40);
      expect(calculateMetroFare(25, 'delhi')).toBe(50);
      expect(calculateMetroFare(35, 'delhi')).toBe(60);
    });

    test('provides exact Rajiv Chowk interchange guidance between Yellow and Blue lines', () => {
      const yToB = getRajivChowkInterchangeGuide('dmrc_yellow', 'dmrc_blue');
      expect(yToB.title).toContain('Rajiv Chowk');
      expect(yToB.steps.some((s) => s.includes('BLUE'))).toBe(true);

      const bToY = getRajivChowkInterchangeGuide('dmrc_blue', 'dmrc_yellow');
      expect(bToY.steps.some((s) => s.includes('YELLOW'))).toBe(true);
    });

    test('plans a direct DMRC Yellow Line trip (Chandni Chowk to Rajiv Chowk)', () => {
      const origin = { latitude: 28.6578, longitude: 77.2304, name: 'Chandni Chowk' };
      const destination = { latitude: 28.6328, longitude: 77.2195, name: 'Rajiv Chowk CP' };

      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'delhi' });
      expect(route).toBeDefined();
      expect(route.type).toBe('transit_metro');
      expect(route.isSameLine).toBe(true);
      expect(route.title).toContain('Delhi Metro');
      expect(route.steps.some((s) => s.line === 'dmrc_yellow')).toBe(true);
      expect(route.autoAdvisory.foodEquivalent).toContain('Chole Bhature');
    });

    test('plans an interchange DMRC trip between Blue Line and Yellow Line via Rajiv Chowk', () => {
      // Origin near Karol Bagh (Blue Line) -> Destination near Central Secretariat (Yellow Line)
      const origin = { latitude: 28.6441, longitude: 77.1906, name: 'Karol Bagh Market' };
      const destination = { latitude: 28.6146, longitude: 77.2119, name: 'Central Secretariat' };

      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'delhi' });
      expect(route).toBeDefined();
      expect(route.isSameLine).toBe(false);
      expect(route.title).toContain('Rajiv Chowk');

      const transferStep = route.steps.find((s) => s.type === 'transfer');
      expect(transferStep).toBeDefined();
      expect(transferStep.title).toContain('Rajiv Chowk');
    });
  });

  describe('Mumbai Suburban & Metro Network', () => {
    test('contains complete Western Line, Central Line, and Metro Line 1 stations', () => {
      expect(MUMBAI_WESTERN_STATIONS.length).toBeGreaterThanOrEqual(20);
      expect(MUMBAI_CENTRAL_STATIONS.length).toBeGreaterThanOrEqual(16);
      expect(MUMBAI_METRO1_STATIONS.length).toBeGreaterThanOrEqual(12);

      const dadarWestern = MUMBAI_WESTERN_STATIONS.find((s) => s.name.includes('Dadar'));
      const dadarCentral = MUMBAI_CENTRAL_STATIONS.find((s) => s.name.includes('Dadar'));
      expect(dadarWestern?.isInterchange).toBe(true);
      expect(dadarCentral?.isInterchange).toBe(true);
    });

    test('calculates Mumbai Suburban local fares starting at ₹5', () => {
      expect(calculateMetroFare(2, 'mumbai')).toBe(5);
      expect(calculateMetroFare(6, 'mumbai')).toBe(10);
      expect(calculateMetroFare(12, 'mumbai')).toBe(15);
      expect(calculateMetroFare(20, 'mumbai')).toBe(20);
    });

    test('provides exact Dadar FOB interchange guidance between Western and Central lines', () => {
      const wToC = getDadarInterchangeGuide('mumbai_western', 'mumbai_central');
      expect(wToC.title).toContain('Dadar Junction');
      expect(wToC.steps.some((s) => s.includes('Foot Overbridge') || s.includes('FOB'))).toBe(true);
    });

    test('plans a direct Mumbai Western Line trip (Marine Lines to Bandra)', () => {
      const origin = { latitude: 18.9432, longitude: 72.8230, name: 'Marine Drive' };
      const destination = { latitude: 19.0544, longitude: 72.8402, name: 'Bandra Station' };

      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'mumbai' });
      expect(route).toBeDefined();
      expect(route.type).toBe('transit_metro');
      expect(route.isSameLine).toBe(true);
      expect(route.title).toContain('Mumbai Local');
      expect(route.steps.some((s) => s.line === 'mumbai_western')).toBe(true);
      expect(route.autoAdvisory.foodEquivalent).toContain('Vada Pav');
    });

    test('plans an interchange Mumbai trip from Central Line to Western Line via Dadar', () => {
      // Origin near CSMT (Central Line) -> Destination near Bandra (Western Line)
      const origin = { latitude: 18.9400, longitude: 72.8353, name: 'CSMT Station' };
      const destination = { latitude: 19.0544, longitude: 72.8402, name: 'Bandra Bandstand' };

      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'mumbai' });
      expect(route).toBeDefined();
      expect(route.isSameLine).toBe(false);
      expect(route.title).toContain('Dadar');

      const transferStep = route.steps.find((s) => s.type === 'transfer');
      expect(transferStep).toBeDefined();
      expect(transferStep.title).toContain('Dadar');
    });
  });

  describe('Line Colors and Names', () => {
    test('returns exact line branding colors and names', () => {
      expect(getLineColor('dmrc_yellow')).toBe(DMRC_YELLOW);
      expect(getLineColor('dmrc_blue')).toBe(DMRC_BLUE);
      expect(getLineColor('mumbai_western')).toBe(MUMBAI_WESTERN);
      expect(getLineColor('mumbai_central')).toBe(MUMBAI_CENTRAL);

      expect(getLineDisplayName('dmrc_yellow')).toContain('Yellow Line');
      expect(getLineDisplayName('mumbai_western')).toContain('Western Line');
    });
  });

  describe('Majestic Interchange City Isolation', () => {
    test('strictly excludes Majestic references from Delhi interchange routes', () => {
      // Hauz Khas to Connaught Place via Yellow & Blue interchange
      const origin = { latitude: 28.5432, longitude: 77.2065, name: 'IIT Delhi' };
      const destination = { latitude: 28.6289, longitude: 77.2065, name: 'Barakhamba Road' };
      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'delhi' });

      expect(route).toBeDefined();
      expect(route.title.toLowerCase()).not.toContain('majestic');
      route.steps.forEach((step) => {
        expect(step.title.toLowerCase()).not.toContain('majestic');
        if (step.description) {
          expect(step.description.toLowerCase()).not.toContain('majestic');
        }
      });
    });

    test('strictly excludes Majestic references from Mumbai interchange routes', () => {
      const origin = { latitude: 18.9400, longitude: 72.8353, name: 'CSMT Station' };
      const destination = { latitude: 19.0544, longitude: 72.8402, name: 'Bandra Bandstand' };
      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'mumbai' });

      expect(route).toBeDefined();
      expect(route.title.toLowerCase()).not.toContain('majestic');
      route.steps.forEach((step) => {
        expect(step.title.toLowerCase()).not.toContain('majestic');
        if (step.description) {
          expect(step.description.toLowerCase()).not.toContain('majestic');
        }
      });
    });

    test('preserves Majestic interchange for Bengaluru multi-line trips', () => {
      const origin = { latitude: 12.9784, longitude: 77.6408, name: 'Indiranagar' };
      const destination = { latitude: 12.9352, longitude: 77.5828, name: 'Jayanagar' };
      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'bengaluru' });

      expect(route).toBeDefined();
      expect(route.isSameLine).toBe(false);
      expect(route.title.toLowerCase()).toContain('majestic');
      const transferStep = route.steps.find((s) => s.type === 'transfer');
      expect(transferStep.title.toLowerCase()).toContain('majestic');
    });
  });
});
