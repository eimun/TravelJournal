import { getAllCities, getCityConfig } from '../../app/data/citiesRegistry';
import { PLACES, RESTAURANTS, DISHES, EATERIES_DB } from '../../app/data/bengaluruData';
import { PURPLE_STATIONS, GREEN_STATIONS, POPULAR_DESTINATIONS } from '../../app/data/transitData';
import { BMTC_ROUTES } from '../../app/data/bmtcBusData';
import { ALL_CLOAKROOMS, getCloakroomsForCity } from '../../app/data/cloakroomData';
import {
  DELHI_RESTAURANTS,
  MUMBAI_RESTAURANTS,
  DELHI_SEARCH_HUBS,
  MUMBAI_SEARCH_HUBS,
} from '../../app/data/cityPlacesData';

describe('Data Accuracy & Authenticity Comprehensive Audit', () => {
  test('Audit 1: Auto Fare formulas match government gazetted rates', () => {
    // Bengaluru: Karnataka Transport Dept Gazette (Nov 2021)
    const blr = getCityConfig('bengaluru');
    expect(blr.autoFareFormula.baseFare).toBe(30);
    expect(blr.autoFareFormula.baseDistanceKm).toBe(2.0);
    expect(blr.autoFareFormula.perKm).toBe(15);
    expect(blr.autoFareFormula.lingoPhrase.toLowerCase()).toContain('meter');

    // Delhi: Delhi Govt Transport Dept Gazette (Jan 2023)
    const del = getCityConfig('delhi');
    expect(del.autoFareFormula.baseFare).toBe(30);
    expect(del.autoFareFormula.baseDistanceKm).toBe(1.5);
    expect(del.autoFareFormula.perKm).toBe(11);
    expect(del.autoFareFormula.lingoPhrase.toLowerCase()).toContain('meter');

    // Mumbai: MMRTA Maharashtra Gazetted Auto Tariff (Oct 2022)
    const bom = getCityConfig('mumbai');
    expect(bom.autoFareFormula.baseFare).toBe(23);
    expect(bom.autoFareFormula.baseDistanceKm).toBe(1.5);
    expect(bom.autoFareFormula.perKm).toBe(15.33);
    expect(bom.autoFareFormula.lingoPhrase.toLowerCase()).toContain('meter');
  });

  test('Audit 2: Bengaluru geo-coordinates accuracy', () => {
    // Greater Bengaluru region (including Nandi Hills excursion at 13.37°N)
    const allBlrItems = [
      ...PLACES,
      ...RESTAURANTS,
      ...PURPLE_STATIONS,
      ...GREEN_STATIONS,
      ...POPULAR_DESTINATIONS,
    ];

    allBlrItems.forEach((item) => {
      expect(item.latitude).toBeGreaterThanOrEqual(12.8);
      expect(item.latitude).toBeLessThanOrEqual(13.4);
      expect(item.longitude).toBeGreaterThanOrEqual(77.45);
      expect(item.longitude).toBeLessThanOrEqual(77.78);
    });
  });

  test('Audit 3: Delhi geo-coordinates accuracy', () => {
    // Delhi NCR coordinates fall accurately in 28.4°N - 28.85°N, 77.0°E - 77.35°E
    const allDelItems = [...DELHI_RESTAURANTS, ...DELHI_SEARCH_HUBS];
    allDelItems.forEach((item) => {
      expect(item.latitude).toBeGreaterThanOrEqual(28.4);
      expect(item.latitude).toBeLessThanOrEqual(28.85);
      expect(item.longitude).toBeGreaterThanOrEqual(77.0);
      expect(item.longitude).toBeLessThanOrEqual(77.35);
    });
  });

  test('Audit 4: Mumbai geo-coordinates accuracy', () => {
    // Mumbai coordinates fall accurately in 18.85°N - 19.35°N, 72.75°E - 73.05°E
    const allBomItems = [...MUMBAI_RESTAURANTS, ...MUMBAI_SEARCH_HUBS];
    allBomItems.forEach((item) => {
      expect(item.latitude).toBeGreaterThanOrEqual(18.85);
      expect(item.latitude).toBeLessThanOrEqual(19.35);
      expect(item.longitude).toBeGreaterThanOrEqual(72.75);
      expect(item.longitude).toBeLessThanOrEqual(73.05);
    });
  });

  test('Audit 5: Namma Metro station sequences and interchange integrity', () => {
    // Majestic interchange exists on both Purple & Green lines
    const purpleMajestic = PURPLE_STATIONS.find((s) => s.isInterchange && s.name.includes('Majestic'));
    const greenMajestic = GREEN_STATIONS.find((s) => s.isInterchange && s.name.includes('Majestic'));
    expect(purpleMajestic).toBeDefined();
    expect(greenMajestic).toBeDefined();
    expect(purpleMajestic.latitude).toBeCloseTo(12.9756, 3);
    expect(purpleMajestic.longitude).toBeCloseTo(77.5728, 3);

    // Terminal stations (including Phase 2 extension to Madavara/BIEC)
    expect(PURPLE_STATIONS[0].name).toContain('Whitefield');
    expect(PURPLE_STATIONS[PURPLE_STATIONS.length - 1].name).toContain('Challaghatta');
    expect(GREEN_STATIONS[0].name).toContain('Madavara');
    expect(GREEN_STATIONS[GREEN_STATIONS.length - 1].name).toContain('Silk Institute');
  });

  test('Audit 6: Cloakroom tariff integrity against Indian Railways and Airport standards', () => {
    expect(ALL_CLOAKROOMS.length).toBeGreaterThanOrEqual(7);
    ALL_CLOAKROOMS.forEach((hub) => {
      if (hub.category === 'railway') {
        expect(hub.tariff.first24Hours).toContain('₹30');
      } else if (hub.category === 'airport') {
        expect(hub.tariff.first24Hours).toMatch(/₹(250|300)/);
      }
      expect(hub.rules.length).toBeGreaterThanOrEqual(2);
    });

    const blrCloakrooms = getCloakroomsForCity('bengaluru');
    expect(blrCloakrooms.some((c) => c.name.includes('Majestic'))).toBe(true);

    const delCloakrooms = getCloakroomsForCity('delhi');
    expect(delCloakrooms.some((c) => c.name.includes('New Delhi'))).toBe(true);

    const bomCloakrooms = getCloakroomsForCity('mumbai');
    expect(bomCloakrooms.some((c) => c.name.includes('CSMT'))).toBe(true);
  });

  test('Audit 7: BMTC Bus routes match real Bengaluru corridors', () => {
    const kiaRoute = BMTC_ROUTES.find((r) => r.routeNumber.startsWith('KIA'));
    expect(kiaRoute).toBeDefined();
    expect(kiaRoute.origin).toContain('Kempegowda');
    expect(kiaRoute.type).toBe('airport');

    const route500 = BMTC_ROUTES.find((r) => r.routeNumber.includes('500'));
    expect(route500).toBeDefined();
    expect(route500.category).toContain('Outer Ring Road');
  });

  test('Audit 8: All restaurants have realistic pricing tiers, images and operational hours', () => {
    const allRestaurants = [...RESTAURANTS, ...DELHI_RESTAURANTS, ...MUMBAI_RESTAURANTS];
    expect(allRestaurants.length).toBeGreaterThanOrEqual(70);

    allRestaurants.forEach((r) => {
      // Rating 3.5 to 5.0
      expect(r.rating).toBeGreaterThanOrEqual(3.5);
      expect(r.rating).toBeLessThanOrEqual(5.0);

      // Price Tier 1 (₹), 2 (₹₹), or 3 (₹₹₹)
      expect([1, 2, 3]).toContain(r.priceTier);

      // Must-try price is realistic (between ₹15 and ₹850)
      expect(r.mustTry.price).toBeGreaterThanOrEqual(15);
      expect(r.mustTry.price).toBeLessThanOrEqual(850);

      // Has realistic timing string
      expect(r.openTime).toMatch(/^\d{1,2}:\d{2}$/);
      expect(r.closeTime).toMatch(/^\d{1,2}:\d{2}$/);

      // Image URL is present and valid HTTPS URL
      expect(r.image).toBeDefined();
      expect(r.image).toMatch(/^https:\/\//);
    });
  });

  test('Audit 9: Monument Entry fees and timings match Archaeological Survey of India (ASI) standards', () => {
    const lalbagh = PLACES.find((p) => p.id === 'lalbagh');
    expect(lalbagh.total).toBe(105);

    const cubbon = PLACES.find((p) => p.id === 'cubbon');
    expect(cubbon.total).toBe(60);

    const palace = PLACES.find((p) => p.id === 'palace');
    expect(palace.costs.find((c) => c.label.includes('Entry')).amount).toBe('₹250');
  });
});
