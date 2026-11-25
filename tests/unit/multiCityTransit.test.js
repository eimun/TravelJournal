import {
  DMRC_YELLOW_STATIONS,
  DMRC_BLUE_STATIONS,
  DMRC_AIRPORT_STATIONS,
  MUMBAI_WESTERN_STATIONS,
  MUMBAI_CENTRAL_STATIONS,
  MUMBAI_METRO1_STATIONS,
  KOLKATA_BLUE_STATIONS,
  KOLKATA_GREEN_STATIONS,
  HYD_RED_STATIONS,
  HYD_BLUE_STATIONS,
  CHENNAI_BLUE_STATIONS,
  CHENNAI_GREEN_STATIONS,
  findNearestMetroStation,
  calculateMetroFare,
  getNextMetroDeparture,
  getRajivChowkInterchangeGuide,
  getDadarInterchangeGuide,
  getEsplanadeInterchangeGuide,
  getAmeerpetInterchangeGuide,
  getChennaiCentralInterchangeGuide,
  getLineColor,
  getLineDisplayName,
  DMRC_YELLOW,
  DMRC_BLUE,
  MUMBAI_WESTERN,
  MUMBAI_CENTRAL,
  KOLKATA_BLUE,
  KOLKATA_GREEN,
  HYD_RED,
  HYD_BLUE,
  CHENNAI_BLUE,
  CHENNAI_GREEN,
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
      expect(typeof route.autoAdvisory.foodEquivalent).toBe('string');
      expect(route.autoAdvisory.cabFare).toBeGreaterThanOrEqual(40); // Delhi taxi meter minimum
    });

    test('plans an interchange DMRC trip between Blue Line and Yellow Line via Rajiv Chowk', () => {
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

  describe('Kolkata Metro Network (Underwater & North-South)', () => {
    test('contains comprehensive Blue Line and Green Line (Underwater) stations', () => {
      expect(KOLKATA_BLUE_STATIONS.length).toBeGreaterThanOrEqual(24);
      expect(KOLKATA_GREEN_STATIONS.length).toBeGreaterThanOrEqual(10);

      const esplanadeBlue = KOLKATA_BLUE_STATIONS.find((s) => s.name.includes('Esplanade'));
      const esplanadeGreen = KOLKATA_GREEN_STATIONS.find((s) => s.name.includes('Esplanade'));
      expect(esplanadeBlue?.isInterchange).toBe(true);
      expect(esplanadeGreen?.isInterchange).toBe(true);
    });

    test('calculates accurate Kolkata Metro fare slabs', () => {
      expect(calculateMetroFare(2, 'kolkata')).toBe(5);
      expect(calculateMetroFare(4, 'kolkata')).toBe(10);
      expect(calculateMetroFare(8, 'kolkata')).toBe(15);
      expect(calculateMetroFare(15, 'kolkata')).toBe(20);
      expect(calculateMetroFare(22, 'kolkata')).toBe(25);
    });

    test('provides exact Esplanade interchange guidance between Blue and Green lines', () => {
      const bToG = getEsplanadeInterchangeGuide('kolkata_blue', 'kolkata_green');
      expect(bToG.title).toContain('Esplanade');
      expect(bToG.steps.some((s) => s.includes('GREEN Line') || s.includes('Howrah'))).toBe(true);

      const gToB = getEsplanadeInterchangeGuide('kolkata_green', 'kolkata_blue');
      expect(gToB.steps.some((s) => s.includes('BLUE Line') || s.includes('Dakshineswar'))).toBe(true);
    });

    test('plans a direct Kolkata Blue Line trip (Dum Dum to Park Street)', () => {
      const origin = { latitude: 22.6218, longitude: 88.3934, name: 'Dum Dum Station' };
      const destination = { latitude: 22.5511, longitude: 88.3524, name: 'Park Street Metro' };

      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'kolkata' });
      expect(route).toBeDefined();
      expect(route.type).toBe('transit_metro');
      expect(route.isSameLine).toBe(true);
      expect(route.title).toContain('Kolkata Metro');
      expect(route.steps.some((s) => s.line === 'kolkata_blue')).toBe(true);
      expect(route.autoAdvisory.foodEquivalent).toContain('Kathi Roll');
      expect(route.autoAdvisory.cabFare).toBeGreaterThanOrEqual(30);
    });

    test('plans an interchange trip via Esplanade crossing the underwater Hooghly tunnel', () => {
      const origin = { latitude: 22.5841, longitude: 88.3429, name: 'Howrah Railway Station' };
      const destination = { latitude: 22.5186, longitude: 88.3468, name: 'Kalighat Metro' };

      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'kolkata' });
      expect(route).toBeDefined();
      expect(route.isSameLine).toBe(false);
      expect(route.title).toContain('Esplanade');

      const transferStep = route.steps.find((s) => s.type === 'transfer');
      expect(transferStep).toBeDefined();
      expect(transferStep.title).toContain('Esplanade');
    });
  });

  describe('Hyderabad Metro Network (L&T HMRL)', () => {
    test('contains comprehensive Red Line and Blue Line (IT Corridor) stations', () => {
      expect(HYD_RED_STATIONS.length).toBeGreaterThanOrEqual(25);
      expect(HYD_BLUE_STATIONS.length).toBeGreaterThanOrEqual(20);

      const ameerpetRed = HYD_RED_STATIONS.find((s) => s.name.includes('Ameerpet'));
      const ameerpetBlue = HYD_BLUE_STATIONS.find((s) => s.name.includes('Ameerpet'));
      expect(ameerpetRed?.isInterchange).toBe(true);
      expect(ameerpetBlue?.isInterchange).toBe(true);
    });

    test('calculates accurate Hyderabad Metro fare slabs', () => {
      expect(calculateMetroFare(1, 'hyderabad')).toBe(10);
      expect(calculateMetroFare(3, 'hyderabad')).toBe(15);
      expect(calculateMetroFare(6, 'hyderabad')).toBe(25);
      expect(calculateMetroFare(10, 'hyderabad')).toBe(35);
      expect(calculateMetroFare(16, 'hyderabad')).toBe(45);
      expect(calculateMetroFare(22, 'hyderabad')).toBe(55);
    });

    test('provides exact Ameerpet interchange guidance between Red and Blue lines', () => {
      const rToB = getAmeerpetInterchangeGuide('hyd_red', 'hyd_blue');
      expect(rToB.title).toContain('Ameerpet');
      expect(rToB.steps.some((s) => s.includes('BLUE Line') || s.includes('Hitec City'))).toBe(true);

      const bToR = getAmeerpetInterchangeGuide('hyd_blue', 'hyd_red');
      expect(bToR.steps.some((s) => s.includes('RED Line') || s.includes('LB Nagar'))).toBe(true);
    });

    test('plans a direct Hyderabad Blue Line trip (Secunderabad to Hitec City)', () => {
      const origin = { latitude: 17.4334, longitude: 78.5045, name: 'Secunderabad East' };
      const destination = { latitude: 17.4504, longitude: 78.3808, name: 'Hitec City' };

      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'hyderabad' });
      expect(route).toBeDefined();
      expect(route.type).toBe('transit_metro');
      expect(route.isSameLine).toBe(true);
      expect(route.title).toContain('Hyderabad Metro');
      expect(route.steps.some((s) => s.line === 'hyd_blue')).toBe(true);
      expect(route.autoAdvisory.foodEquivalent).toContain('Biryani');
      expect(route.autoAdvisory.cabFare).toBeGreaterThanOrEqual(50);
    });

    test('plans an interchange trip via Ameerpet (Miyapur to Hitec City)', () => {
      const origin = { latitude: 17.4966, longitude: 78.3614, name: 'Miyapur Terminal' };
      const destination = { latitude: 17.4504, longitude: 78.3808, name: 'Hitec City' };

      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'hyderabad' });
      expect(route).toBeDefined();
      expect(route.isSameLine).toBe(false);
      expect(route.title).toContain('Ameerpet');

      const transferStep = route.steps.find((s) => s.type === 'transfer');
      expect(transferStep).toBeDefined();
      expect(transferStep.title).toContain('Ameerpet');
    });
  });

  describe('Chennai Metro Network (CMRL)', () => {
    test('contains comprehensive Blue Line (Airport Corridor) and Green Line stations', () => {
      expect(CHENNAI_BLUE_STATIONS.length).toBeGreaterThanOrEqual(25);
      expect(CHENNAI_GREEN_STATIONS.length).toBeGreaterThanOrEqual(15);

      const centralBlue = CHENNAI_BLUE_STATIONS.find((s) => s.name.includes('Central'));
      const centralGreen = CHENNAI_GREEN_STATIONS.find((s) => s.name.includes('Central'));
      expect(centralBlue?.isInterchange).toBe(true);
      expect(centralGreen?.isInterchange).toBe(true);
    });

    test('calculates accurate Chennai Metro fare slabs', () => {
      expect(calculateMetroFare(2, 'chennai')).toBe(10);
      expect(calculateMetroFare(4, 'chennai')).toBe(20);
      expect(calculateMetroFare(8, 'chennai')).toBe(30);
      expect(calculateMetroFare(14, 'chennai')).toBe(40);
      expect(calculateMetroFare(20, 'chennai')).toBe(50);
    });

    test('provides exact Chennai Central interchange guidance', () => {
      const bToG = getChennaiCentralInterchangeGuide('chennai_blue', 'chennai_green');
      expect(bToG.title).toContain('Chennai Central');
      expect(bToG.steps.some((s) => s.includes('GREEN Line') || s.includes('Egmore'))).toBe(true);
    });

    test('plans a direct Chennai Blue Line trip to Airport (Chennai Central to Airport)', () => {
      const origin = { latitude: 13.0827, longitude: 80.2755, name: 'Chennai Central' };
      const destination = { latitude: 12.9815, longitude: 80.1636, name: 'Chennai Airport' };

      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'chennai' });
      expect(route).toBeDefined();
      expect(route.type).toBe('transit_metro');
      expect(route.isSameLine).toBe(true);
      expect(route.title).toContain('Chennai Metro');
      expect(route.steps.some((s) => s.line === 'chennai_blue')).toBe(true);
      expect(route.autoAdvisory.foodEquivalent).toContain('Dosa');
      expect(route.autoAdvisory.cabFare).toBeGreaterThanOrEqual(60);
    });

    test('plans an interchange Chennai trip via Central/Alandur', () => {
      const origin = { latitude: 13.0790, longitude: 80.2610, name: 'Chennai Egmore' };
      const destination = { latitude: 12.9815, longitude: 80.1636, name: 'Chennai Airport' };

      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'chennai' });
      expect(route).toBeDefined();
      expect(route.isSameLine).toBe(false);

      const transferStep = route.steps.find((s) => s.type === 'transfer');
      expect(transferStep).toBeDefined();
    });
  });

  describe('Line Colors and Names', () => {
    test('returns exact line branding colors and names', () => {
      expect(getLineColor('dmrc_yellow')).toBe(DMRC_YELLOW);
      expect(getLineColor('dmrc_blue')).toBe(DMRC_BLUE);
      expect(getLineColor('mumbai_western')).toBe(MUMBAI_WESTERN);
      expect(getLineColor('mumbai_central')).toBe(MUMBAI_CENTRAL);
      expect(getLineColor('kolkata_blue')).toBe(KOLKATA_BLUE);
      expect(getLineColor('kolkata_green')).toBe(KOLKATA_GREEN);
      expect(getLineColor('hyd_red')).toBe(HYD_RED);
      expect(getLineColor('hyd_blue')).toBe(HYD_BLUE);
      expect(getLineColor('chennai_blue')).toBe(CHENNAI_BLUE);
      expect(getLineColor('chennai_green')).toBe(CHENNAI_GREEN);

      expect(getLineDisplayName('dmrc_yellow')).toContain('Yellow Line');
      expect(getLineDisplayName('mumbai_western')).toContain('Western Line');
      expect(getLineDisplayName('kolkata_blue')).toContain('Blue Line');
      expect(getLineDisplayName('kolkata_green')).toContain('Green Line');
      expect(getLineDisplayName('hyd_red')).toContain('Red Line');
      expect(getLineDisplayName('chennai_blue')).toContain('Blue Line');
    });
  });

  describe('Majestic Interchange City Isolation', () => {
    test('strictly excludes Majestic references from Delhi interchange routes', () => {
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

    test('strictly excludes Majestic references from Kolkata interchange routes', () => {
      const origin = { latitude: 22.5841, longitude: 88.3429, name: 'Howrah Station' };
      const destination = { latitude: 22.5186, longitude: 88.3468, name: 'Kalighat Temple' };
      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'kolkata' });

      expect(route).toBeDefined();
      expect(route.title.toLowerCase()).not.toContain('majestic');
      route.steps.forEach((step) => {
        expect(step.title.toLowerCase()).not.toContain('majestic');
        if (step.description) {
          expect(step.description.toLowerCase()).not.toContain('majestic');
        }
      });
    });

    test('strictly excludes Majestic references from Hyderabad interchange routes', () => {
      const origin = { latitude: 17.4966, longitude: 78.3614, name: 'Miyapur' };
      const destination = { latitude: 17.4504, longitude: 78.3808, name: 'Hitec City' };
      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'hyderabad' });

      expect(route).toBeDefined();
      expect(route.title.toLowerCase()).not.toContain('majestic');
      route.steps.forEach((step) => {
        expect(step.title.toLowerCase()).not.toContain('majestic');
        if (step.description) {
          expect(step.description.toLowerCase()).not.toContain('majestic');
        }
      });
    });

    test('strictly excludes Majestic references from Chennai interchange routes', () => {
      const origin = { latitude: 13.0790, longitude: 80.2610, name: 'Egmore' };
      const destination = { latitude: 12.9815, longitude: 80.1636, name: 'Airport' };
      const route = planTransitRoute(origin, destination, new Date(), { cityId: 'chennai' });

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
